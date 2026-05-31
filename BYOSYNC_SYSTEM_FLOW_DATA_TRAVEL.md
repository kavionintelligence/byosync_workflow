# ByoSync — System Flow: Data Travel (Encrypted vs Unencrypted)

**Source:** `components/landing/system-flow-demo.tsx` (`SCENARIOS` object, animated dossier + live narration)  
**Canonical product model:** `byosync_updated_vault_native_flow.md` (scenario numbers 00–12 align with demo tabs)  
**Technical specs:** `BYOSYNC_FLOW_V2_ENCLAVE_TARGET.md`, `BYOSYNC_FLOW_V3_LINEAGE_A2A_COMPLIANCE.md`, `BYOSYNC_A2A_WORKED_WORKFLOWS.md`  
**Interactive demo:** Landing page (embedded) and `/system-flow` (fullscreen)

> **Note:** Regenerate this file after changing `SCENARIOS` in the demo. Tab order: 00 Partner setup → 01 User+vault → … → 12 Breach.

---

## How to read this document

Each step lists:

| Column | Meaning |
|--------|---------|
| **Route** | Who sends data to whom (Phone, User Agent, ByoSync parent, Nitro enclave, Vault/Drive, Company A/B) |
| **On the wire** | What actually crosses TLS/vsock/A2A — encrypted blob, signed JSON, boolean, or nothing |
| **At rest** | What each store holds after the step |
| **TEE / RAM** | Brief plaintext only inside Secure Enclave (phone) or Nitro enclave (server), then zeroed |

### Data-state legend

| Symbol | State | Description |
|--------|--------|-------------|
| **NONE** | Nothing transmitted | Local UI, notice, or pre-consent |
| **LOCAL** | Device-only | Biometrics processed on phone; raw samples zeroed; only `helper_data` + `k2` / wrapped keys remain |
| **CIPHER** | Encrypted in transit & at rest | Hybrid RSA+AES, AES-GCM field blobs, KMS-wrapped DEKs, encrypt-to-company pubkey |
| **META** | Metadata / identifiers only | Hashes, `user_token`, consent IDs, JWS assertions, booleans — no underlying PII |
| **TEE-PLAIN** | Plaintext inside TEE only | Decrypted inside Nitro or phone Secure Enclave for compute; wiped before response leaves |
| **VIEW** | Watermarked render stream | Not a file download; session-bound; auto-expires |
| **TOKEN** | Redeemable capability | `verify-token`, `consent-token`, `view_token`, `intent-token`, `jti` — not raw fields |
| **SESSION-PLAIN** | Employee endpoint memory only | After decrypt of view cipher; watermarked; no partner DB/server persistence |

**v2 invariant (target):** Parent EC2 / Mongo / operator → **CIPHER + META only**. Enclave → **TEE-PLAIN** briefly, then zeroed. Company → decrypts only ciphertext encrypted for its pubkey.

---

## Diagram actors

| Actor | Role | Typical data held |
|-------|------|-------------------|
| **User phone** | Enrollment, biometrics, consent UI, signing | `helper_data`, wrapped UMK, device key (TEE) |
| **User agent** | A2A orchestration (scenario 06 only) | Session mandate, narrowed delegation tokens |
| **ByoSync parent** | Blind relay, policy, webhooks, googleProxy | Ciphertext in/out, hashes, lineage, wrapped OAuth |
| **Nitro enclave** | Decrypt, BCH, boolean, encrypt-to-company | TEE-PLAIN during request only |
| **User vault / Drive** | Encrypted identity & payment tokens | AES-GCM blobs + KMS-wrapped DEK |
| **Company A / B** | Partner console | JWS proofs, encrypted `sharedData`, or local decrypt |

---

## A2A data classes (scenario 06)

| Class | What moves | What never moves |
|-------|------------|------------------|
| **VERIFY** | Boolean / signed assertion (e.g. `age18plus: true`) | Raw DOB, documents |
| **OPERATE-STANDARD** | Field subset re-encrypted to agent/company pubkey (e.g. address) | Full identity JSON; payment instruments |
| **OPERATE-SENSITIVE** | **Refused** for external agents | PAN, bank, UPI, full KYC pack |
| **INTENT** | Signed payment intent (amount, payee, `jti`, TTL) | Card/bank/UPI numbers |

---

# Scenario 00 — Vault inception (registration)

**Purpose:** One-time setup — auth primitives to ByoSync/Mongo; PII envelope to vault via enclave; parent never sees plaintext.

| Step | Route | On the wire | At rest | TEE / RAM |
|------|-------|-------------|---------|-----------|
| **01** First launch | Phone only | **NONE** | All stores empty | — |
| **02** Face + voice enrollment | Phone only | **LOCAL** — `helper_data`, `k2`; raw face/voice **zeroed** | Nothing sent | Fuzzy extract on device |
| **03** UMK generation | Phone Secure Enclave | **LOCAL** — random UMK → `wrapped_UMK`; UMK/k2 zeroed in app RAM | Enclave holds wrapped UMK | Random 256-bit UMK, not biometric-derived |
| **04** Hybrid register | Phone → Parent → Enclave (vsock) | **CIPHER** — `{ encryptedData, encryptedAESKey, iv }` | Parent: ciphertext only | **TEE-PLAIN:** decrypt enroll payload; BCH templates; phone/email **hashes** to Mongo |
| **05** PII envelope → Drive | Enclave → Parent googleProxy → Drive/Vault | **CIPHER** — identity JSON AES-GCM + `wrapped_DEK` (KMS, PCR-gated) | Drive: `{ v:2, encrypted, iv, tag }`; Mongo: hashes, KMS-wrapped templates, `fileId` | **TEE-PLAIN:** build identity JSON, then encrypt; DEK never given to parent |
| **06** Complete | — | — | Mongo: no plaintext PII; vault: encrypted envelope | Parent invariant: never plaintext embeddings/PII/DEK |
| **07** Future share path (preview) | Parent fetch cipher → Enclave → Company | **CIPHER** out to company pubkey | Lineage/audit **META** | Filter + `encrypt(subset, company_pubkey)` |
| **08** v1 vs v2 | Educational | v1 parent: **TEE-PLAIN** in Node (legacy); v2: **CIPHER** relay only | — | Migration story |
| **09** Ready | — | **NONE** | Foundation for scenarios 01–09 | — |

**Registration payload summary**

```
Phone ──CIPHER──► Parent ──CIPHER (vsock)──► Enclave
                    │                         ├─► Mongo: phoneHash, emailHash, KMS-wrapped BCH, oauth, fileId
                    └─ googleProxy ──CIPHER──► Drive/Vault: identity envelope
```

---

# Scenario 01 — Boolean proof (default)

**Purpose:** Company receives yes/no JWS only — never field values.

| Step | Route | On the wire | At rest | TEE / RAM |
|------|-------|-------------|---------|-----------|
| **01** Partner app open | Phone | **NONE** | — | — |
| **02** Liveness | Phone | **LOCAL** | — | `live_token` from fuzzy extract |
| **03** UMK release | Phone | **LOCAL** | — | Unwrap `wrapped_UMK` if verify OK |
| **04** Boolean request | Company → ByoSync | **META** — mTLS `POST /v1/access-request` (user, purpose, fields[], `mode: boolean`) | — | — |
| **05** Consent prompt | ByoSync → Phone | **META** — consent_id, company, fields, purpose, expiry | — | — |
| **06** Approve | Phone → ByoSync | **META** — signed intent (`consent_id \|\| fields \|\| purpose \|\| nonce \|\| ts`) | Consent ACTIVE | — |
| **07** Vault fetch | Parent googleProxy → Drive; cipher → Enclave | **CIPHER** — Drive blob only | Parent never decrypts | OAuth unwrap enclave-only |
| **08** Compute | Enclave | vsock: **CIPHER** in; **META** out (JWS) | Audit hash-chain **META** | **TEE-PLAIN:** decrypt blob → `{ age_over_18: true, kyc_verified: true }` → **zero plain + DEK** |
| **09** Proof to company | Enclave → Parent → Company | **META** — JWS assertion (~hundreds of bytes) | Company DB: assertion + consent_id only | No PII |

```
Company ──META──► ByoSync ──META──► Phone (consent)
Phone ──META (signed)──► ByoSync
Vault ──CIPHER──► Enclave ──TEE-PLAIN (compute)──► META (JWS) ──► Company
```

---

# Scenario 02 — Face-payment (PCI / SCA)

**Purpose:** Strong customer authentication; partner holds payment **token** only; PAN in vault as **CIPHER**.

| Step | Route | On the wire | At rest | TEE / RAM |
|------|-------|-------------|---------|-----------|
| **01** Checkout | Company | **META** — `tok_card_4382` in partner DB; no PAN | Partner: token ref only | Vault: **CIPHER** PAN/tokens |
| **02** Payment intent | Company → ByoSync | **META** — amount, merchant, order, `payment_token`, `txn_nonce` (mTLS) | — | ByoSync never sees PAN |
| **03** SCA challenge | ByoSync → Phone | **META** — intent string, nonce, expiry | — | — |
| **04** User review | Phone UI | **NONE** (display) | — | — |
| **05** Liveness | Phone | **LOCAL** | — | Face + voice OK |
| **06** Sign intent | Phone → ByoSync | **META** — `DeviceKey.sign(amount \|\| merchant \|\| …)` | — | — |
| **07** SCA proof | ByoSync → Company | **META** — `JWS_sign({ txn_nonce, intent_hash, factors, … })` | — | Outside PCI CDE |
| **08** Tokens in vault | Phone → Vault (narrative) | **CIPHER** — network-tokenized card/bank/UPI, AES per field | Vault: encrypted tokens; ByoSync: `vault_ptr_enc` only | Tokenize once at save |
| **09** Processor charge | Company → Processor | **META** — token + amount + `sca_proof` | Processor CDE de-tokenizes | — |
| **10** Confirm + audit | ByoSync | **META** — hash-chained audit | WORM log | — |
| **11** Boundary | — | **NONE** | — | ByoSync = SCA layer, not payment rail |

---

# Scenario 03 — Plaintext view (high-risk)

**Purpose:** Rare employee view; watermarked stream; honest limits (screenshot risk).

| Step | Route | On the wire | At rest | TEE / RAM |
|------|-------|-------------|---------|-----------|
| **01** Plaintext request | Company → ByoSync | **META** — fields, purpose, ticket, duration | — | — |
| **02** Employee MFA | Company desktop | **LOCAL** / **META** — employee attestation | — | — |
| **03** To control plane | Company → ByoSync | **META** — mTLS + `emp_attestation`, `mode: view_only_watermarked` | — | — |
| **04** High-risk consent | ByoSync → Phone | **META** — employee name, ticket, 15m TTL | — | — |
| **05** Approve | Phone → ByoSync | **META** — sig bound to `emp_id` | Grant tied to Priya·4521 | — |
| **06** Render stream | Vault → Enclave → Company | **CIPHER** fetch; **VIEW** stream to browser (not raw file) | — | **TEE-PLAIN:** decrypt → watermark overlay → stream; no download |
| **07** Session expiry | Enclave | — | — | **zero(plaintext); zero(DEK);** destroy session |
| **08** Receipt | ByoSync → Phone | **META** — who viewed what, duration, count | User dashboard | — |

**Warning:** Revocation cannot un-see what was lawfully viewed. Prefer boolean (scenario 01) by default.

---

# Scenario 04 — Revoke consent + cascade (v3)

**Purpose:** User withdraws consent; lineage edges REVOKED; delegated JWTs dead; webhooks + deletion callbacks.

| Step | Route | On the wire | At rest | TEE / RAM |
|------|-------|-------------|---------|-----------|
| **01** Dashboard | Phone ↔ ByoSync | **META** — list active consents | — | — |
| **02** Revoke sign | Phone → ByoSync | **META** — `REVOKE \|\| consent_id \|\| nonce` + device sig | — | — |
| **03** Invalidate | ByoSync / Enclave | Internal | Consent `REVOKED`; sessions terminated | — |
| **04** Cascade | Enclave + lineage | Internal | All edges `root=c1` → REVOKED; Redis `jti` REVOKED | Fail-closed on next unlock |
| **05** Webhooks | ByoSync → Company A + B | **META** — `consent.revoked`, `deletion_required` + `jti` | Recipients must `confirmDeletion` | — |
| **06** Honest boundary | — | **NONE** | Cannot retract prior lawful view | — |
| **07** Audit | Enclave → ByoSync | **META** — hash-chained `consent_revoked` | WORM 1yr+ | Erasure tombstone |
| **08** Fail-closed | Company/agent retry | **META** — `403 CONSENT_REVOKED` on revoked `jti` | — | OPERATE already delivered cannot be un-forwarded |

---

# Scenario 05 — Lineage re-share (A → B, v3)

**Purpose:** Sanctioned onward transfer through ByoSync — not side-channel forward.

| Step | Route | On the wire | At rest | TEE / RAM |
|------|-------|-------------|---------|-----------|
| **01** A has OPERATE field | — | Company A holds **CIPHER** from prior encrypt-to-company | Lineage edge USER→A **META** | — |
| **02** Re-share request | Company A → ByoSync | **META** — `lineageId`, fromCo, toCo, purpose, fields, tag | — | — |
| **03** Re-consent | ByoSync → Phone (if transferee) | **META** — consent #2; or sub-processor log only | — | — |
| **04** Re-encrypt | Enclave → Company B | **CIPHER** — field F encrypted to B's RSA pubkey | ByoSync: no plaintext address | **TEE-PLAIN:** extract field → zero plain → `RSA_encrypt(f, pubkey_B)` |
| **05** Lineage edge | Enclave → ByoSync | **META** — seq:2 edge, `consentId c2`, `jti`, `prevHash` | 7yr retention | — |
| **06** B decrypts | ByoSync → B | **CIPHER** + consent record | B decrypts locally with privkey | ByoSync never had plaintext |
| **07** Documents default | — | **META** verify preferred | Re-verify, not re-transfer file | — |

---

# Scenario 06 — A2A agent-to-agent (6 phases, 11 steps)

**Purpose:** User Agent orchestrates remote agents; three token types; runtime unlock; lineage per hop.

| Phase / Step | Route | On the wire | At rest | TEE / RAM |
|--------------|-------|-------------|---------|-----------|
| **0 — Mandate** | Phone → User Agent | **META** — signed `goal, scope, ttl, nonce` | Bounded session | Shrink-only delegation later |
| **1 — Discover** | User Agent → Remote (ShopCo) | **META** — Agent Card + KYA JWS (`dataClasses`) | Revocation check ACTIVE | VERIFY / OPERATE-STANDARD / OPERATE-SENSITIVE tiers |
| **2 — Classify + consent** | UA → ByoSync → Enclave → Phone | **META** classify; Phone → **3 tokens**: `verify_token`, `consent_token`, `intent_token` | One biometric tap | No raw PII in consent UI payload |
| **3 — A2A task** | User Agent → Remote | **META** — `parts: [{ ref: byosync://vault/... }]`, tokens in metadata | Intercepted task = no PII | — |
| **4a — VERIFY** | Remote → Enclave | **META** `verify_token` in | **META** `age18plus: true` out | DOB stays in vault |
| **4b — OPERATE-STANDARD** | Remote → Enclave ↔ Vault | **CIPHER** vault fetch; **CIPHER** to agent pubkey | Redis `jti == ACTIVE` | Address only (astrology: dob/time/city only) |
| **4c — INTENT** | Phone → ByoSync → Remote | **META** — ₹499 intent; **no instrument** | Payment rail charges separately | OPERATE-SENSITIVE hard no |
| **5 — Artifact** | Remote → User Agent; lineage ×3 | **META** artifact + lineage edges | USER→ShopCo VERIFY+OPERATE; USER→Merchant intent | — |
| **6a — Revoke** | Phone → ByoSync | **META** — cascade all `jti_*` REVOKED | Future unlock 403 | Guaranteed on ByoSync side |
| **6b — Deletion** | ByoSync → Remote | **META** — `confirmDeletion(jti)` | CONFIRMED \| BREACH audit | Cannot force third-party erase |
| **6 — Dashboard** | ByoSync → Phone | **META** — orchestrated lineage view | Tokens never cross agents | — |

```
Phone ──mandate──► User Agent ──Agent Card──► ShopCo
Phone ──3 tokens──► ByoSync/Enclave
ShopCo ──token redeem──► Enclave ──CIPHER/META──► ShopCo
Payment: INTENT only (no PAN on A2A wire)
```

---

# Scenario 07 — Encrypted field share (in-person, v2)

**Purpose:** Company receives PII as ciphertext encrypted to its pubkey — not plain JSON.

| Step | Route | On the wire | At rest | TEE / RAM |
|------|-------|-------------|---------|-----------|
| **01** Employee verify | Desktop → Enclave | **CIPHER** hybrid face verify | KMS-wrapped templates in Mongo | BCH match in TEE |
| **02** User share-data | Phone → Enclave | **CIPHER** hybrid body | Consent ACTIVE + audit chain | Enclave-only consent |
| **03** Drive fetch | Parent googleProxy → Drive → Enclave | **CIPHER** identity blob | Parent has no DEK | — |
| **04** Encrypt-to-company | Enclave → Parent → Company | **CIPHER** `cipher_co` + enclave signature | Company decrypts locally | **TEE-PLAIN:** subset → zero → RSA to company pubkey |
| **05** Company decrypt | — | **CIPHER** at company API | Plaintext only on company server | ByoSync never stored plain |
| **06** Invariant | — | Parent: cipher in/out only | Operator blindness | v2 target claim |

---

# Scenario 08 — Vault data update

**Purpose:** User corrects KYC; fresh DEKs; direct vault write; partners notified.

| Step | Route | On the wire | At rest | TEE / RAM |
|------|-------|-------------|---------|-----------|
| **01** Update trigger | Phone | **NONE** until re-auth | Vault v1 **CIPHER** | Fields locked |
| **02** Re-auth | Phone | **LOCAL** | — | UMK released via k2 + helper_data |
| **03** Re-encrypt fields | Phone | **LOCAL** — new `DEK_v2`, `ct_v2`, `wDEK_v2`; **zero DEK_v1** | Forward secrecy | Per-field AES-GCM |
| **04** Direct PUT vault | Phone → Vault (**bypass ByoSync**) | **CIPHER** — `PUT vault/.../field` v2 blobs | ByoSync DB unchanged (`vault_ptr_enc` only) | ByoSync excluded from PII path |
| **05** Webhook | ByoSync → Companies | **META** — signed `data.updated`, `fields_changed`, `data_version: 2` | Partners invalidate cache | — |
| **06** Audit | ByoSync | **META** — hash-chained `vault_data_updated` | `vault_version := 2` | — |
| **07** Complete | Phone | **LOCAL** — UMK re-sealed; DEK_v1 irrecoverable | v1 snapshots unreadable | — |

---

# Scenario 09 — New device recovery

**Purpose:** Cross-device UMK re-wrap; old device approves; zero PII in recovery API.

| Step | Route | On the wire | At rest | TEE / RAM |
|------|-------|-------------|---------|-----------|
| **01** New install | New phone | **META** — `user_token` only | Empty enclave | — |
| **02** New keypair | New phone → ByoSync | **META** — `new_device_pubkey`, attestation, nonce | — | Private key non-exportable |
| **03** Approval push | ByoSync → Old phone | **META** — `NEW_DEVICE_APPROVAL`, pubkey preview | — | — |
| **04** Old approves | Old phone → ByoSync | **META** — `transfer_sig` bound to exact new pubkey | MITM prevented | — |
| **05** UMK re-wrap | ByoSync KMS → New phone | **CIPHER** — `new_wrapped_UMK`, `vault_ptr_enc` | UMK never plaintext on wire | KMS TEE: brief unwrap/re-wrap |
| **06** Registry | ByoSync DB | **META** — device_pubkey rotated, audit | Old device pending-revocation | — |
| **07** Complete | New phone + Vault | **LOCAL** new biometrics; decrypt vault with UMK | Full access restored | No PII via ByoSync |

---

# Master reference — encrypted vs never sent

| Data type | Encrypted path | Never on ByoSync parent / wire |
|-----------|----------------|--------------------------------|
| Raw face/voice samples | — | **Never leaves phone** |
| Face embeddings (enroll) | Hybrid cipher → enclave only | Plain on parent (v1 legacy) |
| Name, phone, email, KYC | AES-GCM vault / Drive envelope | Plain JSON to company (v1 hole; v2 fixed) |
| Biometric templates | KMS-wrapped BCH in Mongo | Reversible template on parent |
| Boolean answers | JWS assertion | Underlying field values |
| Payment PAN/CVV | Tokenized + encrypted in vault | At partner or ByoSync |
| A2A task body | Token refs + metadata | Raw DOB, address, instruments in message |
| Employee plaintext view | Watermarked stream | Raw file download to browser |

---

# Quick path chooser

| Business need | Scenario | Company receives |
|---------------|----------|------------------|
| Register user | 00 Vault inception | Hashes + pointers; PII in vault cipher |
| “Is user 18+?” | 01 Boolean | JWS booleans only |
| Pay with face | 02 Payment | SCA proof + processor token |
| Manual KYC review | 03 Plaintext | Watermarked view (15m) |
| User withdraws | 04 Revoke | Webhook; future calls blocked |
| A shares address with B | 05 Lineage re-share | B gets cipher for B's key |
| Shopping + astrology agents | 06 A2A | Tokens + runtime unlock |
| In-person field share | 07 Encrypted share | Cipher for company pubkey |
| User updates address | 08 Data update | Webhook; re-fetch required |
| New phone | 09 New device | Re-wrapped UMK to new device |

---

*Generated from `system-flow-demo.tsx` SCENARIOS (10 tabs: 00–09). For step-by-step animation labels and compliance tags, run the demo and use **Live narration** + **Dossier · current step**.*
