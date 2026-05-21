# BYOSYNC — DATA LINEAGE, AGENT MARKETPLACE (A2A) & COMPLIANCE · v3

**Status:** TARGET architecture — extends v2 (enclave) with multi-party data tracking.
**Companion to:** `BYOSYNC_BIOMETRIC_AND_DATA_FLOW.txt` (v1) and `BYOSYNC_FLOW_V2_ENCLAVE_TARGET.md` (v2).
**Covers:** (9) inter-company PII/document transfer + lineage, (10) AI agent marketplace over Google A2A, (11) revocation/deletion propagation, (12) encryption method reference, (13) DPDP/GDPR/SOC2 compliance matrix.

> **Strategic anchor:** Under DPDP Rules 2025, a **Consent Manager** is an intermediary that lets users grant/manage/withdraw consent across Data Fiduciaries *without reading the underlying personal data*. The v2 enclave is what makes ByoSync technically eligible to register as one. Everything below is designed so ByoSync operates as a **Consent Manager + verification rail**, never as a data holder.

---

## CORE PRINCIPLE FOR MULTI-PARTY FLOWS

ByoSync cannot physically stop a company that already holds plaintext from forwarding it — **no system can.** What ByoSync does:

1. **Make the compliant path the easy path** — re-sharing *through* ByoSync is frictionless; going around it is a contract breach.
2. **Be the system of record** — the consent ledger is the authoritative log of who was authorized to receive what, for what purpose, when.
3. **Minimize what can leak** — prefer **verification-only (boolean)** so the company never holds raw data to forward; for operational data, use **enclave-bound sharing + deletion callbacks**.

> Design rule: classify every field as **VERIFY** (boolean, never leaves enclave as raw) or **OPERATE** (raw value needed — shared with consent, TTL, deletion callback, lineage record). Forwarding risk only exists for OPERATE fields. Keep that set minimal.

---

## PART 9 — INTER-COMPANY DATA TRANSFER & LINEAGE

### 9.1 THE TRANSFER MODEL

When Company A (holds an OPERATE field under consent) needs to pass it to Company B ("transferee Data Fiduciary" in DPDP terms), the **only sanctioned path is a re-share request routed through ByoSync.**

```
User ──consent #1──> Company A   (purpose P1, OPERATE field F)
                         │
                         │ A needs to involve B (e.g. logistics, sub-processor)
                         ▼
                  RE-SHARE REQUEST to ByoSync
                  { dataRef, fromCo: A, toCo: B, purpose: P2, fields: [F] }
                         │
            ByoSync checks: does consent #1 permit onward transfer to B for P2?
                         │
              ┌──────────┴───────────┐
       pre-authorized chain     not authorized
              │                       │
        log + issue token       prompt USER for consent #2
              │                       │ (biometric tap, scoped to B + P2)
              ▼                       ▼
        Enclave re-encrypts F to B's public key
                         │
                         ▼
        Company B receives F (cipher) + its OWN consent record
        Lineage edge A→B written to ledger
```

### 9.2 LINEAGE GRAPH (system of record)

Every shared field carries a **lineage chain** in the consent ledger:

```
lineageId: ln_<uuid>
root:      { principal: userId, field: F, class: OPERATE }
edges: [
  { seq:1, from: USER, to: CompanyA, purpose:P1, consentId:c1, ts, tokenJti, expiresAt },
  { seq:2, from: CompanyA, to: CompanyB, purpose:P2, consentId:c2, ts, tokenJti, expiresAt }
]
status: ACTIVE | REVOKED | EXPIRED | ERASED
prevHash / hash   (hash-chained, see 11.4)
```

- **User dashboard** renders this as a readable chain: "Your address → Acme (delivery, 2 May) → Delhivery (last-mile, 2 May, deletes 9 May)."
- **DPDP requirement satisfied:** logs of consents + "when data is shared with transferee Data Fiduciaries," user-accessible, machine-readable export, 7-year retention.

### 9.3 DOCUMENT DATA (not just fields)

For document artifacts (e.g. a verified degree PDF, a signed KYC pack):
- Documents are **never** forwarded as raw files between companies by default.
- Default = **re-verification, not re-transfer**: Company B asks ByoSync "does this user hold a verified B.Tech?" → enclave answers boolean from the user's vault → B never receives the PDF.
- Raw document transfer is an OPERATE-class exception requiring explicit user consent + TTL + deletion callback + lineage edge.

### 9.4 SUB-PROCESSOR vs TRANSFEREE
Tag each `toCo` as:
- **SUB_PROCESSOR** (acts on behalf of A, e.g. A's logistics vendor) → covered under A's purpose if contract on file; still logged.
- **TRANSFEREE_FIDUCIARY** (independent controller, e.g. a partner lender) → requires fresh user consent (consent #2). DPDP/GDPR treat these differently; the tag drives whether re-consent is forced.

---

## PART 10 — AI AGENT MARKETPLACE OVER GOOGLE A2A

### 10.1 HOW BYOSYNC OVERLAYS ON A2A

A2A gives discovery (Agent Cards at `/.well-known/agent-card.json`), signed cards (v1.0), task lifecycle (submitted → working → completed/failed), artifacts, and an auth/authz hook in the card. **ByoSync does not replace A2A — it adds the trust + consent + audit overlay A2A lacks.**

| A2A primitive | ByoSync overlay |
|---|---|
| Agent Card (signed) | Embed a **KYA credential**: proves the agent is bound to a verified principal (company/human), with scope + data classes it may handle |
| Capability discovery | Client agent verifies A2A signature **and** KYA credential before trusting a remote agent |
| Task message (carries context) | Context is **consent-gated + tokenized** before it leaves the client agent |
| Task auth | Task carries a **purpose-bound consent token (JWT, jti, context_id)** the remote agent must present to ByoSync to unlock OPERATE data |
| Long-running task / SSE | Consent token TTL enforced; revocation checked at each state transition |
| Artifact (result) | De-tokenized only for the authorized destination; lineage edge written |

### 10.2 KYA CREDENTIAL IN THE AGENT CARD

```jsonc
// /.well-known/agent-card.json  (excerpt)
{
  "name": "acme-pricing-agent",
  "capabilities": ["price_quote"],
  "signatures": [ /* A2A v1.0 signed card */ ],
  "byosync": {
    "kyaCredential": "<JWS>",        // signed by ByoSync
    "principal": "did:byosync:acme", // verified company/human binding
    "scopes": ["read:order_summary"],
    "dataClasses": ["VERIFY"],       // may receive booleans only, NOT raw PII
    "attestation": "nitro://PCR0=..",// if agent runs in enclave (for OPERATE class)
    "revocationEndpoint": "https://api.byosync.../kya/status"
  }
}
```

### 10.3 USER-AGENT → REMOTE-AGENT TASK FLOW (consent-gated)

```
[User] authorizes their agent (biometric) for goal G, scope S, TTL
   │
   ▼
[User Agent = A2A client]
   │ 1. discover remote agents (fetch Agent Cards)
   │ 2. verify A2A signature + ByoSync KYA credential + revocation status
   │ 3. classify task data: VERIFY fields vs OPERATE fields
   ▼
[ByoSync consent check + enclave]
   │ - VERIFY fields  → enclave returns booleans (no raw data in task)
   │ - OPERATE fields → require remote agent dataClass=OPERATE + enclave attestation
   │                    + user consent for THIS agent + purpose
   │ - tokenize anything sent; mint purpose-bound consent token (jti, TTL)
   ▼
[A2A task] sent to remote agent:
   parts: [ tokenized context ], metadata: { byosyncConsentToken }
   │
   ▼
[Remote Agent]
   │ - to use OPERATE data: presents consent token to ByoSync → enclave releases
   │   (de-tokenizes) ONLY if token valid, not revoked, scope matches, in TTL
   │ - if agent runs in attested enclave: data usable but creator cannot exfiltrate
   │ - if agent is external (dataClass=VERIFY only): never gets raw PII
   ▼
[Artifact returned] → ByoSync writes lineage edge (UserAgent → RemoteAgent, purpose, ts)
```

### 10.4 MULTI-HOP (agent calls another agent)
A2A tasks can chain. **The consent token does not chain implicitly.** Each hop:
- Requires the calling agent to request a **delegated, narrowed** consent token from ByoSync (scope can only shrink, never widen).
- Writes a new lineage edge.
- Inherits the shortest TTL in the chain.
- If any upstream consent is revoked, all downstream delegated tokens are invalidated (cascade, 11.3).

### 10.5 PAYMENTS (A2A AP2 extension)
If agents transact (AP2), ByoSync does **not** touch card/bank data (prohibited). It authorizes the **payment intent** biometrically and binds it to the verified principal; the payment rail (Razorpay/processor) handles funds. Lineage records the authorization event, never the instrument.

---

## PART 11 — REVOCATION, DELETION & PROPAGATION

### 11.1 REVOCATION (user-initiated, biometric)
- User taps "revoke" on dashboard for a consent / agent / company.
- ByoSync sets consent + any **delegated tokens** to REVOKED.
- All affected companies/agents notified via webhook; their next ByoSync call (data unlock, token present) **fails closed**.

### 11.2 RUNTIME REVOCATION CHECK (the enforcement teeth)
OPERATE data is never "handed over and forgotten." Each use requires a live unlock from ByoSync's enclave, which checks token status in real time (Redis). Revoked token → no unlock. This is OCSP-style: agents/companies must check status at use-time, not just at grant-time.

### 11.3 CASCADE
```
User revokes consent c1 (User→A)
   → c1 REVOKED
   → all lineage edges rooted in c1 marked REVOKED
   → delegated tokens (A→B, B→agent…) invalidated
   → webhooks fire to A, B, agent
   → each must run deletion (11.5) and confirm
```

### 11.4 TAMPER-EVIDENT AUDIT (hash chain)
```
entry_n = { event, lineageId, consentId, actor, ts, prevHash }
prevHash = SHA256(canonical(entry_{n-1}))
```
Any retroactive edit breaks the chain. Exportable, 7-year retention (DPDP), machine-readable (DPDP + GDPR Art 20).

### 11.5 DELETION / ERASURE (right to be forgotten)
- **Deletion callback contract** baked into SDK: on revoke/expiry, recipient must call `confirmDeletion(tokenJti)` within N hours.
- Non-confirmation → flagged in audit + compliance dashboard + (optionally) automated breach-risk escalation.
- ByoSync's own erasure: destroy vault pointer, KMS-wrapped templates, OAuth token; write an **erasure tombstone** (proves deletion happened without retaining the data).
- Provable erasure across the lineage chain is the artifact a DPDP/GDPR auditor will ask for.

---

## PART 12 — ENCRYPTION & METHODS REFERENCE

| Layer | Method | Notes |
|---|---|---|
| Data at rest (vault PII) | **AES-256-GCM**, per-user DEK | DEK enclave-bound + KMS-wrapped (v2 §3.2) |
| Data in transit | **TLS 1.3** | All hops |
| Key management | **AWS KMS envelope encryption**, HSM-backed CMK | `kms:Decrypt` gated on `RecipientAttestation:PCR0` |
| Confidential processing | **Nitro enclave** | BCH match, PII decrypt, field filter, encrypt-to-recipient |
| Biometric template | **BCH fuzzy extractor** | Validate vs **ISO/IEC 24745** before claiming irreversibility |
| PII boolean predicates | **Argon2id** hashes | yes/no, no value disclosed |
| Hash chain / integrity | **SHA-256** | Audit + lineage tamper-evidence |
| Consent token | **JWT** signed **EdDSA/Ed25519**, `jti` + `context_id` (HMAC-SHA256) | Purpose-bound, TTL, replay-protected via Redis |
| Agent identity | **KYA credential = JWS** (Ed25519), embedded in signed A2A card | Bound to verified principal |
| Inter-company / inter-agent payload | **Encrypt-to-recipient public key** (hybrid RSA-OAEP / ECIES + AES-GCM) | ByoSync relays ciphertext only |
| Tokenization (agent context) | **Format-preserving** placeholders + reversible map in vault | De-tokenize only at authorized output |
| Replay protection | timestamp + nonce, **atomic Redis (Lua)** check | Server-side TTL enforced |
| Consent artifact | **Time-stamped, signed** | DPDP BRD requires time-stamped consent artifacts |

---

## PART 13 — DPDP / GDPR / SOC2 COMPLIANCE MATRIX

| Requirement | DPDP 2025 | GDPR | SOC2 (TSC) | How ByoSync meets it |
|---|---|---|---|---|
| Consent before processing | Rule 3/4 | Art 6, 7 | Privacy | Biometric consent event + signed artifact |
| Consent Manager (no data access) | Rule 4 | — | Confidentiality | **Enclave = provably no data read** → eligible to register |
| Purpose limitation | Yes | Art 5(1)(b) | Privacy | Purpose-bound tokens; scope only shrinks |
| Data minimization | Yes | Art 5(1)(c) | Privacy | VERIFY/boolean default; raw data is the exception |
| Logs of consent + transfers | Rule 4 (7-yr, exportable) | Art 30 | Security/Privacy | Hash-chained ledger + lineage graph, machine-readable export |
| Right to withdraw (easy) | Dedicated link | Art 7(3) | Privacy | One-tap revoke + runtime fail-closed |
| Right to erasure | Yes | Art 17 | Privacy | Deletion callbacks + erasure tombstone + cascade |
| Right to portability | — | Art 20 | Privacy | Machine-readable consent/lineage export |
| Breach notification | **72 hours** | Art 33 (72h) | Security | Automated detection + escalation + templates |
| Cross-border transfer control | Rule 15 (govt conditions) | Ch. V (SCC/adequacy) | Confidentiality | Data residency tagging; recipient-key encryption; region pinning |
| Privacy by design | Implied | Art 25 | Privacy | Enclave + minimization are PbD by construction |
| Encryption / safeguards | Yes | Art 32 | Security/Confidentiality | §12 methods table |
| Access control (RBAC) | Yes | Art 32 | Security | Admin RBAC; enclave removes operator data access |
| DPIA / audit (if SDF) | SDF: annual DPIA + audit | Art 35 | Security | DPIA template; independent audit readiness |
| Change management | — | — | Security | PCR-update runbook in CI/CD (enclave changes) |
| Children's data | Verifiable consent | Art 8 | Privacy | Age boolean via Argon2id; flag minors, restrict |
| Monitoring / incident response | Yes | — | Security/Availability | Audit alerts, deletion-confirmation tracking |

### 13.1 SOC2 SPECIFICS TO BUILD (beyond crypto)
- Documented access-control policy + least-privilege + RBAC review cadence
- Change management tied to enclave PCR updates (evidence trail)
- Vendor/sub-processor register (maps to lineage `SUB_PROCESSOR` tags)
- Incident-response runbook + tabletop exercise records
- Logging/monitoring with alerting; evidence retention
- Annual penetration test (CERT-In empanelled VAPT doubles for India)

### 13.2 KEY TIMELINE (plan against)
- **Nov 2025:** DPDP Rules notified; Data Protection Board established.
- **Nov 2026:** Consent Manager registration opens (Rule 4). **→ ByoSync should be ready to register here.**
- **May 2027:** Notices, security, breach, erasure, rights, cross-border, SDF obligations in force. **→ Treat as the hard compliance deadline.**

---

## PART 14 — ADDITIONS TO MIGRATION ORDER (extends v2)

After v2 Phases 1–6:

7. **Lineage ledger + hash chain** (§9.2, §11.4) — system of record for transfers.
8. **Re-share API + transferee/sub-processor tagging** (§9.1, §9.4).
9. **Deletion-callback contract in SDK** (§11.5) — required before any OPERATE sharing.
10. **KYA credential issuance + embed in A2A Agent Card; revocation endpoint** (§10.2).
11. **Consent-token unlock at agent runtime + multi-hop delegation** (§10.3–10.4).
12. **Machine-readable consent/lineage export + user dashboard chain view** (DPDP/GDPR).
13. **Consent Manager registration readiness pack** (target Nov 2026).

---

## OPEN DECISIONS / HONEST FLAGS

- **Forwarding cannot be technically prevented for OPERATE data already delivered.** ByoSync provides the consent rail, audit, and easy compliant path — not DRM. Keep OPERATE set minimal; prefer VERIFY. State this honestly to auditors and partners.
- **A2A is still evolving** (v1.0 is recent; spec marked work-in-progress). Build to v1.0 signed-card + auth hooks, but isolate A2A specifics behind an adapter so spec changes don't ripple.
- **External (non-enclave) agents must be capped at VERIFY/boolean data.** Only enclave-attested agents may touch OPERATE data — otherwise the creator can exfiltrate. This must be enforced at the KYA `dataClass` gate, not left to policy.
- **Consent Manager registration is a strategic fork worth taking:** it's a regulatory moat (registered, audited intermediary status) that competitors without your enclave can't easily claim. But it brings obligations (conflict-of-interest rules, 7-yr logs, audits). Decide deliberately.
- **Cross-border:** if any vault data or processing sits outside India, Rule 15 conditions apply; for GDPR users, you need an Art. V transfer basis. Pin region per data-residency tag.

---

*Target-state specification. Nothing here is implemented yet. v3 assumes v2 (enclave) is in place — the enclave is the precondition for the "Consent Manager that doesn't read data" claim that the entire DPDP positioning rests on.*
