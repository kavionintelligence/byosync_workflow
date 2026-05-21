# BYOSYNC — BIOMETRIC & DATA FLOW · v2 (ENCLAVE TARGET STATE)

**Status:** TARGET architecture — not yet implemented in production.
**Companion to:** `BYOSYNC_BIOMETRIC_AND_DATA_FLOW.txt` (v1 / current state).
**Purpose:** Define the end-state after migrating plaintext server processing into an attested AWS Nitro enclave, so the production system matches the "zero data, not even ByoSync" claim.

> Read this alongside v1. Every section below mirrors the v1 Part numbering. Lines marked **[NEW]** or **[CHANGED]** are the delta. Lines with no marker are unchanged from v1.

---

## DELTA SUMMARY — WHAT CHANGES FROM v1

| # | v1 (current) | v2 (target) | Why it matters |
|---|---|---|---|
| 1 | `getIdentity` decrypts PII in normal server RAM | PII decrypt happens **only inside the enclave** | ByoSync operator can no longer read PII |
| 2 | `verifyFace` / BCH match on normal server with plaintext templates | BCH match runs **inside the enclave**; templates KMS-wrapped | Biometric bits never exposed to operator |
| 3 | `DRIVE_MASTER_KEY` env var; `HKDF(master, userId)` derivable for any user | Per-user DEK wrapped by **KMS**, released **only to attested enclave (PCR-gated)**, optionally bound to live BCH secret | Removes the single worst exposure |
| 4 | Shared PII to company = plain HTTPS JSON | Subset **encrypted to the company's public key inside the enclave** | ByoSync API tier relays ciphertext only |
| 5 | OAuth refresh token decrypted server-side | Refresh token KMS-wrapped, unwrapped **in enclave**; Google calls proxied via parent | Token confidential to enclave |
| 6 | Liveness gated on first frame only | Per-frame + passive + challenge-response nonce | Anti-spoof + presence + fairness |
| 7 | `ConsentAudit` plain entries | **Hash-chained append-only** audit log | Tamper-evident for DPDP / BFSI |
| 8 | Phone + face only | Device trust set + step-up for new/unknown devices | Account-takeover resistance |

---

## PART 1 — HIGH-LEVEL ARCHITECTURE (WHAT TRAVELS WHERE)

Three data classes (unchanged), with a new **trust boundary** added.

**A) RAW BIOMETRICS** (face images, audio)
- Processed on the user's browser (client). Never stored as photos. *(unchanged)*
- Sent to server only as ArcFace embeddings / BCH bits inside hybrid-encrypted payloads. *(unchanged)*
- **[CHANGED]** On the server, these bits are **never decrypted on the parent** — they pass straight into the enclave over vsock.

**B) AUTH / POLICY DATA** (MongoDB)
- phoneHash, emailHash, faceData[] (BCH templates), voiceData, consent records, encrypted OAuth token, driveFiles[].fileId. *(unchanged)*
- **[CHANGED]** BCH templates and the OAuth token are now stored **KMS-wrapped**, decryptable only inside the enclave.

**C) PERSONAL DATA (PII)**
- Plaintext briefly on client during forms. *(unchanged)*
- Encrypted to user's Google Drive as `user_identity.json`. *(unchanged)*
- **[CHANGED]** When a company needs data, **the enclave** (not the parent server) decrypts the Drive blob, filters to consented fields, and re-encrypts to the company's key. The parent server never sees plaintext PII.

**[NEW] Trust boundary**
```
            UNTRUSTED                    TRUSTED (attested)
   ┌──────────────────────────┐   ┌───────────────────────────┐
   │ Client · Internet · TLS  │   │   Nitro Enclave            │
   │ Parent EC2 (blind relay) │──▶│   - BCH match              │
   │ MongoDB (wrapped blobs)  │   │   - PII decrypt + filter   │
   │ ByoSync engineers/root   │   │   - encrypt-to-company     │
   └──────────────────────────┘   │   PCR-gated KMS keys       │
                                   └───────────────────────────┘
   Parent sees: ciphertext in, signed result out. Never plaintext.
```

**ByoSync layer role (restated):** identity broker + consent ledger + biometric gatekeeper. **[CHANGED]** The plaintext-processing role moves from "trusted server" to "attested enclave the operator cannot read."

---

## PART 2 — BIOMETRIC VERIFICATION

### 2.1 WHERE PROCESSING HAPPENS

| Step | v1 location | v2 location |
|---|---|---|
| Camera capture | Browser | Browser *(unchanged)* |
| Face mesh / liveness / ArcFace embedding | Browser (ONNX/MediaPipe) | Browser *(unchanged)* |
| BCH fuzzy extractor (enroll/verify) | Server `bch_integration.js` | **[CHANGED] Inside enclave** |
| Match / enroll decision | Server controllers | **[CHANGED] Inside enclave** |
| Store templates | Mongo `faceData[]` plaintext-usable | **[CHANGED] Mongo `faceData[]` KMS-wrapped** |
| PII decrypt (`getIdentity`) | Server RAM | **[CHANGED] Inside enclave** |
| Field filter (`buildSharedUserData`) | Server | **[CHANGED] Inside enclave** |

### 2.2 REGISTRATION SCAN (50 FRAMES)

Client flow (capture → 50 ArcFace embeddings → hybridEncrypt → POST) is **unchanged**.

Server-side, **[CHANGED]**:
- `hybridDecrypt` happens **inside the enclave**, not on the parent. The parent relays `{encryptedData, encryptedAESKey, iv}` over vsock untouched.
- The RSA private key for hybrid decryption is **KMS-wrapped and released only to the enclave** (it must never sit on the parent as it does today).
- `enrollFaceDataInBackground` runs in the enclave: `embeddingToBits → registerBiometricFromBits(bits, salt)` → BCH template → **template encrypted to the enclave's KMS key before it leaves to Mongo.**
- PII envelope for Drive is built and encrypted **in the enclave**; parent only relays the ciphertext to Google.

**[NEW] What is stored after register (v2):**
- Mongo: **KMS-wrapped** BCH templates, salt, hashes, Drive pointer, **KMS-wrapped** OAuth token.
- Google Drive: AES-GCM PII envelope *(unchanged)*, but the DEK is now per-user and enclave-bound (see 3.2).
- Client: stop persisting BCH registration in `localStorage` for any production path **[CHANGED — remove demo leakage]**.

### 2.3 LOGIN / VERIFY SCAN (2 FRAMES)
Client capture unchanged. **[CHANGED]** `hybridDecrypt`, `phoneHash` lookup result, and `verifyFace` BCH matching all execute in the enclave; only a signed `{verified: true/false}` plus a JWT-mint instruction leave the enclave.

### 2.4 / 2.5 IN-PERSON & REMOTE CONSENT
Consent state machine (PENDING → biometric → ACTIVE → REVOKED) unchanged in logic. **[CHANGED]**:
- `verifyFace(minMatches=3)` for the consenting face runs in the enclave.
- **[NEW]** All consent state-change routes must be hybrid-encrypted + signed (v1 line 173 notes some are "not encrypted in simple body" — close this).
- **[NEW]** Each consent event appends a hash-chained audit entry (see Part 4.5).

### 2.6 BCH (FUZZY EXTRACTOR) — v2
Pipeline logic unchanged. **[CHANGED]** Both `registerBiometricFromBits` and `verifyBiometricFromBits` execute inside the enclave; `helperData/ecc/hashOfSecret` are sealed under the enclave KMS key at rest. **[NEW]** Validate the scheme against **ISO/IEC 24745** before asserting "irreversible" to regulators.

### 2.7 VOICE
**[CHANGED]** The separate Python FastAPI path (`ecapa_server.py`) is a second plaintext processing surface. Either (a) move voice scoring into the enclave too, or (b) explicitly scope voice as out-of-enclave and document the weaker guarantee. Do not silently leave it as a plaintext side-channel.

---

## PART 3 — ENCRYPTION LAYERS (v2)

### 3.1 HYBRID RSA + AES (CLIENT ↔ ENCLAVE)
**[CHANGED]** Client encryption unchanged, but the **RSA private key moves off the parent into KMS**, released only to the attested enclave. Decryption therefore happens in the enclave, not in a parent request handler. Replay headers (`x-api-timestamp`, `x-api-nonce`) retained — **[NEW]** enforce server-side TTL + nonce-replay rejection in Redis (Lua atomic check).

### 3.2 PER-USER DEK FOR DRIVE PII — **[CHANGED, critical]**

**v1 (remove):** `key = HKDF(DRIVE_MASTER_KEY, salt=userId)` — one master key, derivable for every user, readable by any server-access path.

**v2 (target):**
```
Per-user DEK never exists outside the enclave.

Wrapping:  DEK  --wrapped by-->  KMS CMK
           KMS CMK policy: kms:Decrypt allowed ONLY when
             RecipientAttestation:PCR0 == <byosync-enclave-PCR0>

Optional defense-in-depth (recommended):
  Final unwrap of DEK inside enclave also requires the
  BCH-recovered secret S from a LIVE matching face.
  → No live face → no S → DEK cannot be formed
  → Even KMS access alone is insufficient
```
Result: neither a stolen env var, a Mongo dump, nor parent root access can decrypt any user's PII. Reconstruction requires (attested enclave) AND (KMS release) AND (optionally a live biometric).

### 3.3 OAUTH REFRESH TOKEN — **[CHANGED]**
Wrap under KMS; unwrap only in the enclave. The enclave mints a short-lived Google access token; the **parent performs the actual HTTPS fetch** (enclave has no network) but receives back only the **encrypted Drive blob**, which it hands to the enclave to decrypt. Parent never holds the DEK or the refresh token in clear.

### 3.4 IDENTIFIER HASHING
Unchanged (`phoneHash`, `emailHash` for lookup). Lookups remain on the parent — they operate on hashes only, no plaintext.

---

## PART 4 — USER → COMPANY DATA FLOW (v2)

### 4.1 PREREQUISITES
Unchanged, plus **[NEW]**: company has registered a **public key** with ByoSync for end-to-end encryption of shared fields.

### 4.2 FLOW A — IN-PERSON (v2 sequence)
```
[User device]            [Parent EC2 = blind relay]      [Enclave]            [KMS]   [Mongo] [Drive] [Company]
   |                            |                            |                  |        |       |        |
   | employee face (encrypted)  |---- vsock ciphertext ----->| hybridDecrypt    |        |       |        |
   |                            |                            | verify employee  |<--unwrap template (PCR-gated)
   | user face 2 frames (enc)   |---- vsock ciphertext ----->| BCH match user   |<--unwrap|        |        |
   |                            |                            | consent ACTIVE   |---------write-->|        |
   |                            |  fetch encrypted blob <-------(enclave asks)   |        |       |        |
   |                            |---- Google fetch (cipher) ------------------------------------>|        |
   |                            |  encrypted blob ---------->| decrypt PII      |        |       |        |
   |                            |                            | filter sharedFields                       |
   |                            |                            | ENCRYPT subset TO COMPANY PUBKEY          |
   |                            |                            | sign w/ enclave key                       |
   |<-- 200 {consentId} --------|<-- signed result ----------|                  |        |       |        |
   |                            |                            |  (enclave memory wiped)                   |
```

### 4.2b COMPANY VIEWING SHARED DATA (v2) — **[CHANGED]**
For each ACTIVE consent, the enclave produces `sharedData` **already encrypted to the company's public key**. The parent relays this ciphertext; **the company decrypts it client-side with its private key.** ByoSync's API tier never sees plaintext shared PII (closes v1 line 308).

### 4.3 FLOW B — REMOTE REQUEST
Same as v1, with the enclave handling all decrypt/verify/filter steps as in 4.2.

### 4.4 buildSharedUserData — **[CHANGED]** runs inside enclave; output is encrypted-to-company, not raw JSON.

### 4.5 REVOCATION + **[NEW] AUDIT**
Revocation unchanged (face → REVOKED → company API stops returning data). **[NEW]** Every event (NOTICE_SENT, CONSENT_GIVEN, ACCESSED, REVOKED, ERASED) appends an entry:
```
entry_n = { event, consentId, ts, prevHash }
prevHash = SHA256(entry_{n-1})
```
Tamper-evident chain; any edit breaks the chain. Export-able for DPDP audits.

---

## PART 5 — MARKETING vs PRODUCTION — **[CHANGED]**
v1 noted the demo (on-device fuzzy extractor, UMK/DEK vault, Secure Enclave) was "education only" and not matched in production. **In v2 this gap closes:** the enclave + per-user enclave-bound DEK (3.2) make the production system consistent with the architecture the marketing site already shows. Update `system-flow-demo.tsx` only if any wording over-claims beyond what the enclave actually delivers.

---

## PART 6 — END-TO-END SEQUENCE (v2 ASCII)

```
REGISTRATION
  [Browser] 50 embeddings → hybridEncrypt → [Parent relay]
     → vsock → [ENCLAVE: hybridDecrypt, hash, BCH register,
                build PII envelope, wrap templates+token under KMS]
     → templates/token (wrapped) → [Mongo]
     → PII envelope (cipher) → [Parent] → [Google Drive]

LOGIN
  [Browser 2 frames] → hybridEncrypt → [Parent relay]
     → vsock → [ENCLAVE: BCH verify] → signed {verified} → JWT mint

SHARE TO COMPANY
  [Employee + User face] → enc → [Parent relay] → vsock
     → [ENCLAVE: verify, decrypt Drive blob, filter,
                 encrypt-to-company, sign] → ciphertext
     → [Company decrypts with own private key]

INVARIANT
  Parent EC2 / Mongo / operator root: ciphertext only, never plaintext PII or biometric bits.
```

---

## PART 7 — KEY FILES TO ADD / CHANGE

**[NEW] Enclave application** (recommend Rust for memory-safety + reliable wipe):
- `enclave/src/main.rs` — vsock listener; dispatch by op (register/verify/share)
- `enclave/src/kms.rs` — attestation doc + `kms:Decrypt` calls (proxied via parent)
- `enclave/src/bch.rs` — port of `bch_integration.js` logic (or call existing WASM in-enclave)
- `enclave/src/pii.rs` — Drive blob decrypt, field filter, encrypt-to-company
- `enclave/Dockerfile` → `nitro-cli build-enclave` → capture **PCR0/1/2**

**[NEW] Parent-side proxies:**
- `api/enclave/vsockClient.js` — relay ciphertext to/from enclave
- `api/enclave/kmsProxy.js` — forward enclave KMS calls (vsock ↔ KMS)
- `api/enclave/googleProxy.js` — perform Google fetch on enclave's behalf (cipher only)

**[CHANGED] Existing files become relays / wrappers:**
- `user.controller.js`, `consent.controller.js`, `company.controller.js` → stop decrypting; forward to enclave
- `drive.service.js` → fetch ciphertext only; remove `DRIVE_MASTER_KEY` usage
- `crypto/aes.js` (server) → RSA private key removed; KMS-in-enclave instead

**[NEW] Infra:**
- KMS CMK + key policy with `RecipientAttestation:PCR0` condition
- CI/CD step: on enclave code change → rebuild EIF → update KMS policy with new PCR0 (else lockout)

---

## PART 8 — SECURITY SUMMARY TABLE (v2)

| Data type | At rest | In transit | Who decrypts |
|---|---|---|---|
| Face photo | Not stored | Not sent | N/A |
| Face embedding | Ephemeral in browser | Inside hybrid ciphertext | **Enclave only** *(was: server)* |
| BCH template | **Mongo, KMS-wrapped** *(was: plain)* | N/A | **Enclave only** |
| PII (name, phone…) | Drive AES-GCM, **enclave-bound DEK** | TLS; register cipher | **Enclave only** *(was: server)* |
| OAuth refresh | **Mongo, KMS-wrapped** | TLS | **Enclave only** *(was: server)* |
| Consent metadata | Mongo + **hash-chained audit** | TLS | N/A |
| Shared fields to co. | N/A | **Encrypted to company pubkey** *(was: plain JSON)* | **Company only** *(was: server-filtered plaintext)* |

---

## MIGRATION ORDER (do in this sequence)

1. **KMS-gate `DRIVE_MASTER_KEY` first** — highest leverage, smallest change. Move master key to KMS with PCR condition even before the full enclave app is done; this alone removes your worst exposure.
2. **Stand up the enclave; move `verifyFace` + `getIdentity` + `buildSharedUserData` inside.** Closes the "ByoSync sees everything" gap (Phase 1).
3. **Per-user enclave-bound DEK + optional BCH-secret binding** (3.2). Makes the demo's UMK/DEK story真 true.
4. **Encrypt-to-company** for shared fields (4.2b). Closes the plaintext-JSON hole.
5. **Liveness / device-binding / hash-chained audit** hardening.
6. **Voice path decision** (enclose or explicitly scope out).

## COMPLIANCE CHECKLIST (industry standard)

- [ ] CERT-In empanelled VAPT report
- [ ] KMS key-rotation + PCR-update runbook in CI/CD
- [ ] DPDP breach-notification flow (with timelines), beyond mailer
- [ ] Provable right-to-erasure: Drive blob + Mongo records + audit tombstone
- [ ] Data residency review (Drive = Google infra; India-region for some BFSI)
- [ ] ISO/IEC 24745 biometric template-protection conformance
- [ ] Remove `localStorage` BCH persistence from production client paths

---

*This is a target-state specification. Nothing here is implemented yet. Build in the migration order above; each phase is independently shippable and each closes a specific gap between the production code and the "zero data, not even ByoSync" claim.*
