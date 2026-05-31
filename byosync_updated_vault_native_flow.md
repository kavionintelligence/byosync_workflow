# ByoSync — Updated System Flow

## Vault-Native, Partner-DB-less, Consent-Bound, Face-Verified Data Infrastructure

**Purpose:** This updated flow reflects the clarified ByoSync model: partner companies do not build or operate their own raw customer PII database. ByoSync becomes the managed data infrastructure layer for startups, MSMEs, and platforms. User data lives in encrypted personal vaults. Partners access data only through purpose-bound tokens, verified claims, or controlled employee viewing sessions.

**Core positioning:**

> ByoSync is a managed compliance-ready data infrastructure layer. Partners build their product on top of ByoSync instead of building their own PII database, consent system, encryption stack, access-control layer, rights workflow, and audit trail.

**Important boundary:** ByoSync is not positioning itself as a registered Consent Manager. ByoSync provides consent-proof, vault, verification, access-control, revocation, lineage, and audit infrastructure used by partner businesses.

---

# 1. Core Invariants

These are the non-negotiable design rules.

| No. | Invariant | Meaning |
|---|---|---|
| 1 | Partner has no raw PII database by default | Partner does not store customer KYC, identity documents, DOB, address, PAN, bank data, or raw user profile fields in its own DB. |
| 2 | User data lives in personal vaults | User PII and documents are stored as encrypted vault envelopes, not as plaintext partner records. |
| 3 | ByoSync parent is blind | Parent servers, MongoDB, and operators see CIPHER + META only. Plaintext does not exist in parent application memory. |
| 4 | Plaintext is temporary | Plaintext exists only briefly inside a trusted execution environment or a controlled employee viewing session, then is cleared. |
| 5 | Every access is purpose-bound | Access requires company, employee, purpose, fields, ticket/use case, expiry, and active consent/legal basis. |
| 6 | Employee access requires face verification | A permitted company member must complete face/liveness verification before viewing sensitive user data. |
| 7 | User consent controls the link | User approval creates the token/link. User revocation kills future access. |
| 8 | Onward sharing goes through lineage | Company A cannot silently forward access to Company B. Any onward share must create a new lineage edge and, where required, fresh user consent. |
| 9 | Revocation stops future access | Revocation kills tokens, sessions, and lineage-based access. It cannot erase what was already lawfully viewed. |
| 10 | Boolean proof is the default | Partners should receive verified claims like `age18plus: true` instead of raw DOB or documents whenever possible. |

---

# 2. Data-State Legend

| Symbol | State | Description |
|---|---|---|
| **NONE** | Nothing transmitted | Local UI, notice, or pre-consent state. |
| **LOCAL** | Device-only processing | Biometrics processed on the user or employee device. Raw samples are zeroed. |
| **CIPHER** | Encrypted data | AES-GCM / hybrid encrypted data in transit and at rest. |
| **META** | Metadata only | Consent IDs, proof IDs, vault pointers, hashes, policy IDs, JWS assertions, timestamps, booleans. No underlying PII. |
| **TEE-PLAIN** | Plaintext inside enclave only | Data decrypted briefly inside Nitro enclave / TEE for compute, filtering, rendering, or re-encryption. Zeroed after use. |
| **VIEW** | Controlled render stream/session | Watermarked, session-bound data display. No file download. No partner DB write. |
| **SESSION-PLAIN** | Temporary endpoint plaintext | Plaintext appears only inside authorised employee viewer memory after face scan + token check. No server persistence. Cleared on expiry. |
| **TOKEN** | Redeemable capability | Purpose-bound `verify_token`, `consent_token`, `view_token`, `intent_token`, `jti`, TTL. |

---

# 3. Main Actors

| Actor | Role | What they hold |
|---|---|---|
| **User / Data Principal** | Owns personal vault and gives/revokes consent | Vault access, biometric presence, device keys, consent dashboard |
| **Partner Company** | Runs product/service and defines business purpose | Product logic, user reference IDs, role config, policy config, proof IDs, order IDs, ticket IDs |
| **Partner Employee** | Permitted staff member who may view data | Employee account, device/session key, face/liveness proof, role-based permissions |
| **ByoSync SDK/API** | Embedded trust layer inside partner app/site | Consent UI, verification trigger, proof exchange, token validation |
| **ByoSync Parent Plane** | Blind control plane | CIPHER + META only: policy, routing, token status, lineage, audit, webhooks |
| **ByoSync Enclave Plane** | Trusted compute plane | Temporary plaintext only for decrypt/filter/compute/render/re-encrypt, then zeroed |
| **User Vault** | Encrypted personal data store | AES-GCM field envelopes, encrypted documents, KMS-wrapped DEKs, versioned records |
| **Audit/Lineage Ledger** | Compliance evidence layer | Who accessed what, why, when, for how long, under which consent/ticket/token |
| **Payment Processor** | PCI-compliant payment rail | PAN/CVV/payment credentials if payments are involved; ByoSync receives token references only |

---

# 4. Partner Responsibility vs ByoSync Responsibility

## Partner still does

| Partner task | Why it remains with partner |
|---|---|
| Define business purpose | Partner decides why data is needed. |
| Define product/service rules | Partner owns the business use case. |
| Configure required fields | Partner selects minimum fields required for each workflow. |
| Configure team roles | Partner decides which employees can request which data. |
| Maintain privacy policy and grievance contact | Partner remains accountable for its user-facing business. |
| Sign DPA/service contract with ByoSync | Needed because ByoSync operates data infrastructure for the partner. |
| Train employees | Humans can misuse viewed data or take screenshots. |
| Respond to users/regulator for business decisions | ByoSync supports evidence, but partner remains accountable for its own purpose/use. |

## ByoSync does for partner

| ByoSync task | Burden removed from partner |
|---|---|
| Vault-backed user database | Partner does not build raw PII DB. |
| Encryption and key handling | Partner does not build encryption stack. |
| User biometric verification | Partner does not store biometric samples/templates. |
| Employee face verification | Sensitive access requires live staff presence proof. |
| Consent capture and proof | Consent is recorded with purpose, fields, expiry, and token. |
| Purpose-bound access | Data access is limited to approved purpose and fields. |
| Controlled plaintext view | Employee can view data temporarily without partner DB storage. |
| Revocation and token kill | User revocation disconnects future access. |
| Onward-share lineage | Every Company A → Company B access path is tracked. |
| Audit logs and receipts | Evidence is available for compliance and disputes. |
| Rights workflow support | Access, correction, update, erasure, nomination, grievance support. |
| Breach evidence support | Identify affected users, tokens, fields, employees, and lineage. |

---

# 5. Updated Master Architecture

```text
Partner App / Website
        |
        | Embedded ByoSync SDK/API
        v
ByoSync Control Plane  --------------------> Audit + Lineage Ledger
(CIPHER + META only)                         consent_id, jti, employee_id,
        |                                    purpose, field list, timestamps
        |
        v
ByoSync Enclave Plane
(TEE-PLAIN briefly, zeroed)
        |
        v
Encrypted User Vault
(AES-GCM field envelopes, encrypted docs)
        |
        v
Controlled Output Modes
- Boolean proof
- Verified claim
- Controlled employee view
- Payment intent proof
- User-approved onward share
```

The partner product talks to ByoSync as its data infrastructure. The partner does not need to create its own raw customer data tables for PII. Its internal DB should only hold non-sensitive application state and references.

---

# Scenario 00 — Partner Setup: ByoSync Builds the Data Layer

**Purpose:** A startup/MSME wants to build a product without creating its own raw PII database, consent stack, encryption system, rights dashboard, and audit system.

| Step | Route | On the wire | At rest | Plaintext boundary |
|---|---|---|---|---|
| 01 | Partner signs up | META | Partner org profile | No PII |
| 02 | Partner describes product workflow | META | Workflow config | Business purpose only |
| 03 | ByoSync AI/data tool proposes data model | META | Virtual schema | No user data yet |
| 04 | Partner selects required fields | META | Purpose-field matrix | No user data yet |
| 05 | Access roles configured | META | Employee role policy | No user data yet |
| 06 | Notice/consent templates generated | META | Draft notice config | No user data yet |
| 07 | Retention and revocation rules configured | META | Policy version | No user data yet |
| 08 | Partner integrates SDK/API | META | Partner app holds SDK keys | No raw PII DB created |

**Partner DB after setup:**

```text
partner_user_ref
byosync_user_token
consent_status
proof_id
workflow_status
order_id / ticket_id
role_config
```

**Partner DB does not store by default:**

```text
name
DOB
address
Aadhaar/PAN/passport details
raw documents
face images
voice recordings
biometric templates
bank/card numbers
full KYC pack
```

---

# Scenario 01 — User Onboarding and Vault Creation

**Purpose:** User joins a partner platform. ByoSync creates or links the user’s personal vault and binds verified identity to live presence.

| Step | Route | On the wire | At rest | Plaintext boundary |
|---|---|---|---|---|
| 01 | User opens partner app | NONE | No user PII in partner DB | — |
| 02 | Partner calls ByoSync SDK | META: partner_id, purpose, fields | Request logged | — |
| 03 | User sees notice | META | Notice version recorded | — |
| 04 | User consents | META: signed consent intent | Consent ACTIVE | — |
| 05 | User verifies via trusted source | CIPHER / issuer flow | Verified claim reference | Plaintext only in trusted flow/enclave as needed |
| 06 | User performs face + voice/liveness | LOCAL | No raw biometric sent | Raw samples zeroed on device |
| 07 | Device key created | LOCAL/META | Device public key registered | Private key non-exportable |
| 08 | Vault envelope created | CIPHER | Encrypted PII/doc fields in vault | TEE-PLAIN briefly, then zeroed |
| 09 | Partner receives onboarding proof | META | Partner stores proof_id/status only | No raw PII |

**Output to partner:**

```json
{
  "byosync_user_token": "usr_tok_xxx",
  "consent_id": "cns_xxx",
  "kyc_status": "verified",
  "proof_id": "prf_xxx",
  "data_storage": "vault_only"
}
```

---

# Scenario 02 — Default Access: Boolean Proof / Verified Claim

**Purpose:** Partner needs a fact, not the raw field. This is the safest and default mode.

Examples:

```text
Is user 18+?           → true
Is KYC verified?       → true
Is address available?  → true
Is phone verified?     → true
```

| Step | Route | On the wire | At rest | Plaintext boundary |
|---|---|---|---|---|
| 01 | Partner requests claim | META: user_token, purpose, claim | Request logged | — |
| 02 | ByoSync checks consent/policy | META | Token state checked | — |
| 03 | Vault ciphertext fetched | CIPHER | Vault remains encrypted | Parent cannot decrypt |
| 04 | Enclave computes claim | CIPHER in, META out | Claim proof logged | TEE-PLAIN briefly, then zeroed |
| 05 | Partner receives proof | META: JWS assertion | Partner stores proof only | No raw PII |

**Partner receives:**

```json
{
  "claim": "age18plus",
  "value": true,
  "consent_id": "cns_xxx",
  "proof_id": "prf_xxx",
  "issued_at": "timestamp",
  "expires_at": "timestamp",
  "signature": "JWS"
}
```

---

# Scenario 03 — Controlled Employee Plaintext View

**Purpose:** A permitted company employee needs to view user data temporarily. The partner company still does not store that data in its own database or server.

This is high-risk and should be used only when boolean proof or verified claims are not enough.

## Key rule

> Plaintext may appear only inside an authorised employee’s controlled viewing session after employee face verification, active user consent/legal basis, role check, purpose check, and token check. No partner server or DB stores plaintext.

| Step | Route | On the wire | At rest | Plaintext boundary |
|---|---|---|---|---|
| 01 | Employee requests view | META: employee_id, role, ticket, fields, duration | Request logged | — |
| 02 | ByoSync checks role policy | META | Access decision logged | — |
| 03 | Employee performs face scan | LOCAL/META | Employee presence proof logged | Raw employee biometric not stored |
| 04 | User consent checked | META | Consent ACTIVE / REVOKED | — |
| 05 | User step-up consent if required | META | Consent/token updated | — |
| 06 | Session key created | LOCAL/META | Ephemeral session key registered | Private session key stays on endpoint |
| 07 | Vault ciphertext fetched | CIPHER | Vault unchanged | Parent cannot decrypt |
| 08 | Enclave filters approved fields | CIPHER in | No partner DB write | TEE-PLAIN briefly |
| 09 | Data encrypted to session/device key | CIPHER | No server plaintext | TEE plaintext zeroed |
| 10 | Employee controlled viewer decrypts | CIPHER → SESSION-PLAIN | No persistent storage | Plaintext only in endpoint/browser/app memory |
| 11 | Watermarked display | VIEW | View event logged | No download / no API export |
| 12 | Session expires/revoked | META | Audit finalised | SESSION-PLAIN cleared |

## Controlled viewer rules

```text
- Watermark: employee name, company, timestamp, ticket ID
- TTL: short session duration
- No file download
- No raw API export
- No partner DB write
- Clipboard disabled where possible
- Cache-control: no-store
- Screen recording/screenshot detection where possible
- Session kill on revocation
- Access receipt visible to user
```

## Honest limit

Revocation can stop future access and kill active sessions. It cannot erase what a human already saw, photographed, copied, or misused outside the controlled flow.

---

# Scenario 04 — User Revocation and Token Disconnect

**Purpose:** User withdraws consent. ByoSync disconnects future access by killing tokens, links, sessions, and lineage edges.

| Step | Route | On the wire | At rest | Result |
|---|---|---|---|---|
| 01 | User opens dashboard | META | Active consents listed | User sees companies and access history |
| 02 | User revokes consent | META: signed revoke intent | Consent marked REVOKED | Future access blocked |
| 03 | Tokens killed | META/internal | `jti` revoked | Live/future calls fail |
| 04 | Sessions terminated | META/internal | Session status CLOSED | Active employee view killed |
| 05 | Lineage cascade | META/internal | All linked edges REVOKED | Company B/C access also blocked |
| 06 | Partner webhook | META | Partner notified | Partner must invalidate references/cache |
| 07 | User receipt | META | Dashboard updated | User sees revoke proof |
| 08 | Future retry | META | 403 logged | `CONSENT_REVOKED` |

**Revocation effect:**

```text
User → revokes Company A consent
Company A → loses future access
Any Company B/C access created through A → revoked if linked under lineage
Any employee sessions → killed
Any view tokens → invalid
Any proof tokens → expire / cannot be refreshed
```

---

# Scenario 05 — Onward Share / Company A to Company B

**Purpose:** Company A wants Company B to access user data. This cannot happen through side-channel forwarding. It must happen through ByoSync lineage and user consent where required.

| Step | Route | On the wire | At rest | Plaintext boundary |
|---|---|---|---|---|
| 01 | Company A requests onward share | META: fromCo, toCo, fields, purpose | Request logged | — |
| 02 | ByoSync checks if onward transfer allowed | META | Policy decision | — |
| 03 | User receives fresh consent prompt | META | Consent c2 pending | — |
| 04 | User approves/rejects | META | Consent c2 ACTIVE/DENIED | — |
| 05 | ByoSync creates lineage edge | META | USER → A → B recorded | — |
| 06 | Company B access mode selected | TOKEN/META | B-specific token issued | No A-side forwarding |
| 07 | B employee views if needed | VIEW / SESSION-PLAIN | B view logged | Same face scan + viewer rules |
| 08 | User revokes | META | A/B lineage revoked | Future B access blocked |

**Important:** Company A never gets a permanent raw data copy to forward. B receives access through ByoSync only.

---

# Scenario 06 — Partner Product Uses ByoSync as Virtual DB

**Purpose:** Partner app needs to behave like it has a database, but sensitive data remains in vaults.

## Partner reads user profile

```text
Partner app asks: get profile summary
ByoSync returns: verified claims + masked fields + allowed display values
Partner stores: proof_id, masked preview, status, timestamp
```

## Partner needs full field temporarily

```text
Partner employee requests field
ByoSync checks role + purpose + consent
Employee face scan required
Controlled viewer opens
No partner DB write
Audit stored
```

## Partner updates business status

```text
Partner updates: order_status, claim_status, ticket_status
This is partner business data
It may be stored in partner DB
It should not include raw PII unless necessary
```

## Practical split

| Data type | Where it lives |
|---|---|
| User PII | Encrypted personal vault |
| Documents | Encrypted personal vault |
| Biometric auth material | Device/local helper + protected metadata, no raw samples |
| Consent records | ByoSync audit/consent layer |
| Access logs | ByoSync audit/lineage layer |
| Partner business state | Partner app DB or ByoSync-managed workspace |
| Proof IDs | Partner DB / ByoSync workspace |
| Employee access policy | ByoSync partner workspace |

---

# Scenario 07 — User Updates Data in Vault

**Purpose:** User corrects or updates data once. Partners do not manually maintain stale copies.

| Step | Route | On the wire | At rest | Result |
|---|---|---|---|---|
| 01 | User opens vault | META | Current encrypted version shown | — |
| 02 | User re-authenticates | LOCAL | Auth event logged | — |
| 03 | User updates field | LOCAL/CIPHER | New encrypted field version | Old DEK retired where applicable |
| 04 | Vault version increments | META | `vault_version = n+1` | — |
| 05 | Partners notified | META webhook | Partner invalidates proof/cache | No raw update payload |
| 06 | Partner re-fetches when needed | META/CIPHER | New proof generated | User consent/policy enforced |

---

# Scenario 08 — Payment Intent / PCI-Scope-Reducing Flow

**Purpose:** ByoSync provides face-verified payment intent proof without becoming the payment rail or card data store.

## Safe design rule

> PAN/CVV should never enter ByoSync or the partner system. Payment credentials should stay with a PCI-compliant payment processor. ByoSync should receive only processor-issued token references and transaction intent.

| Step | Route | On the wire | At rest | PCI boundary |
|---|---|---|---|---|
| 01 | User saves payment method | User → Processor | Processor-controlled | Processor holds sensitive payment data | ByoSync outside CDE |
| 02 | Processor returns token | Processor → Partner/ByoSync | TOKEN | Token reference only | No PAN/CVV |
| 03 | Checkout intent created | Partner → ByoSync | META: amount, merchant, order, token_ref, nonce | Intent logged | No PAN/CVV |
| 04 | User reviews payment | Phone UI | NONE | — | — |
| 05 | User face/liveness scan | LOCAL | Auth proof | No raw biometric stored | — |
| 06 | Device signs intent | META | Signed intent logged | — | — |
| 07 | ByoSync returns SCA proof | META: JWS | Proof stored | Outside card data environment |
| 08 | Partner charges via processor | Partner → Processor | TOKEN + amount + proof | Processor processes payment | Processor CDE |

---

# Scenario 09 — New Device / Device-Agnostic Recovery

**Purpose:** ByoSync is device-agnostic but not device-blind. Identity is anchored to the vault and live presence, not one phone.

| Step | Route | On the wire | At rest | Result |
|---|---|---|---|---|
| 01 | New device install | META | Empty local state | Unknown device |
| 02 | Device key generated | LOCAL/META | New public key pending | Private key non-exportable |
| 03 | Step-up verification | LOCAL/META | Risk event logged | Face/liveness + issuer proof if required |
| 04 | Existing trusted device approval if available | META | Transfer proof | Optional stronger path |
| 05 | Vault key re-wrap | CIPHER | New device trusted | UMK not plaintext on wire |
| 06 | Device registry updated | META | Device list updated | Old device can be retained/revoked |

**Principle:**

```text
Known device = smoother access
New device = step-up verification
Suspicious device = restrict/block
Lost device = revoke device key
```

---

# Scenario 10 — Breach / Suspicious Access Response

**Purpose:** ByoSync provides the evidence layer needed to understand what happened, who was affected, and what access path was used.

| Step | Route | On the wire | At rest | Result |
|---|---|---|---|---|
| 01 | Suspicious event detected | META | Alert created | Token/session frozen |
| 02 | Access path reconstructed | META | Lineage graph queried | User/company/employee/ticket identified |
| 03 | Impacted fields identified | META | Field-level impact report | No guessing |
| 04 | Sessions revoked | META | jti/session killed | Future access blocked |
| 05 | Partner notified | META | Incident record | Partner can act |
| 06 | User notice support | META | Affected-user list | Evidence available |
| 07 | Regulator/evidence pack | META | Report generated | Audit trail export |
| 08 | Remediation | META | Controls updated | Closure proof stored |

---

# Master Reference — What Partner Receives

| Business need | Default ByoSync output | Does partner store raw PII? |
|---|---|---|
| Register user | onboarding proof + user token | No |
| Verify age | JWS boolean | No |
| Verify KYC | JWS verified claim | No |
| View document | controlled employee viewer | No DB/server storage |
| Use address for delivery | field access token / temporary view / approved transfer | Only if explicitly exported under policy |
| Share data with Company B | new lineage + B-specific consent/token | No side-channel sharing |
| Payment approval | signed payment intent proof | No PAN/CVV |
| Revoke user access | token kill + lineage revoke | Future access blocked |
| Update user data | vault update + webhook | No stale partner copy |
| Audit request | evidence pack | Logs from ByoSync |

---

# Master Reference — Where Data Lives

| Data type | Storage location | Partner access mode |
|---|---|---|
| Raw face/voice samples | Not stored; device-only processing | Never |
| Biometric reusable templates | Not stored as raw templates | Never |
| Helper/auth material | Device/local + protected metadata | Never raw |
| Name/DOB/address/KYC | Encrypted personal vault | Claim / view / approved field access |
| Documents | Encrypted personal vault | Controlled viewer by default |
| Consent records | ByoSync consent/audit layer | Proof/receipt |
| Access logs | ByoSync audit/lineage layer | Evidence export |
| Payment PAN/CVV | PCI processor only | Never |
| Payment token ref | Processor/partner/ByoSync metadata | Token only |
| Partner business records | Partner app DB or ByoSync workspace | Non-sensitive business state |

---

# Compliance Positioning

## DPDP positioning

ByoSync helps partners operationalise privacy and data protection by providing:

```text
notice support
purpose-field mapping
consent proof
encrypted vault storage
access controls
revocation
rights workflow support
audit logs
breach evidence
lineage tracking
```

Partner still defines the business purpose and remains accountable for its own use of data.

## SOC 2 positioning

ByoSync reduces the partner’s privacy/confidentiality/security engineering burden by centralising:

```text
encryption
access control
audit evidence
monitoring
rights workflow evidence
incident evidence
vendor/security documentation
```

Partner still needs its own company controls: employee onboarding/offboarding, change management, admin security, endpoint security, availability, and incident response.

## PCI positioning

ByoSync should remain an authentication and intent layer, not a card data store.

```text
PAN/CVV → payment processor only
ByoSync → payment intent proof only
Partner → token reference only
```

This reduces PCI scope for the partner and keeps ByoSync away from cardholder data where possible.

---

# Final Product Statement

> ByoSync gives partner companies a managed data infrastructure layer instead of a raw customer PII database. User data stays in encrypted personal vaults. Partners receive verified claims, purpose-bound tokens, or controlled employee viewing sessions. Every sensitive view requires employee face verification, active user consent or lawful basis, role permission, and full audit logging. Revocation disconnects future access across the lineage chain.

Short version:

> Partner companies define the purpose. ByoSync enforces secure, consent-bound, face-verified, auditable access to user vault data.

