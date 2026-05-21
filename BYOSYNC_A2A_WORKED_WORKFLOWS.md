# BYOSYNC × A2A — WORKED AGENT-TO-AGENT WORKFLOWS

**Status:** TARGET design — worked examples companion to `BYOSYNC_FLOW_V3_LINEAGE_A2A_COMPLIANCE.md` (Part 10).
**Purpose:** Show the *concrete* step-by-step flow when a user's agent processes personal data with another agent — instantiated for astrology, payment, and shopping, then all three in one request.

---

## 0 — REFINEMENT: THREE DATA CLASSES (replaces v3's binary rule)

v3 said "external agents get boolean only." That's too strict — an astrology agent *needs* your real birth date. So data is classified in **three tiers**, and the tier decides who can receive it and how:

| Class | Examples | Who may receive raw | Protection |
|---|---|---|---|
| **VERIFY** | age ≥ 18, in-serviceable-area, citizenship | Nobody gets raw — boolean only | Argon2id hash → yes/no |
| **OPERATE-STANDARD** | birth date/time/place, delivery address, email, phone | Any **KYA-verified** agent, with scoped consent | Consent + TTL + deletion callback + lineage |
| **OPERATE-SENSITIVE** | bank/card, health records, govt ID number, biometric | **Enclave-attested agents only**, or never to 3rd parties | Above + attestation gate; or refuse |

The gate lives in the KYA credential's `dataClasses` field. An external astrology agent is allowed OPERATE-STANDARD (birth data) but **never** OPERATE-SENSITIVE. Payment instruments are OPERATE-SENSITIVE and **never shared at all** — payment is handled as *intent authorization* (Example B).

### The control model in one line

ByoSync does **not** claim "the agent never sees your data." It claims: **the user is informed before any share, can cut off the agent's future access instantly, and directs deletion of what was shared — which ByoSync verifies.** That is informed consent + ongoing control, which is exactly the DPDP/GDPR model. Split precisely:

- **Guaranteed (ByoSync's side):** informed before sharing · future access killed instantly on revoke.
- **Directed + verified (recipient's side):** deletion of the already-delivered copy — requested via callback, confirmation recorded, non-confirmation flagged.
- **Carries the weight:** minimization — the agent only ever receives the few fields it was authorized to, so even a non-deleting agent holds the minimum, not a profile.

---

## 1 — THE ACTORS

- **User** — data principal; has a ByoSync identity, an encrypted vault, and a biometric.
- **User Agent** — the A2A *client*; the user's personal assistant agent acting on their behalf.
- **Remote Agent** — an A2A *server* (astrology / shopping / payment), published with an Agent Card.
- **ByoSync** — Consent Manager + enclave + KYA issuer + lineage ledger. Never holds plaintext outside the enclave.

---

## 2 — THE GENERIC FLOW (reusable pattern, 6 phases)

Every personal-data A2A interaction follows these six phases. The examples in §3–§5 just fill in the specifics.

```
PHASE 0  AUTHORIZE          User → biometric → User Agent gets a scoped session mandate
PHASE 1  DISCOVER + TRUST   User Agent finds remote agent, verifies card + KYA + revocation
PHASE 2  CLASSIFY + CONSENT Decide what data is needed; user gives scoped consent; mint token
PHASE 3  DISPATCH (A2A)     Send A2A task with consent token; raw data NOT in the task
PHASE 4  UNLOCK AT RUNTIME  Remote agent redeems token at ByoSync enclave for scoped data
PHASE 5  PROCESS + ARTIFACT Remote agent works, returns artifact; lineage edge written
PHASE 6  REVOKE / DELETE    User cuts off future access instantly (guaranteed) +
                            directs & verifies deletion of already-shared copy (requested)
```

### Step-by-step explanation

**Phase 0 — Authorize the User Agent.**
The user taps biometric once to authorize their own agent for a goal ("plan my evening", "do my shopping"), with a scope and a TTL. This produces a **session mandate** — the User Agent can now act, but only within those bounds. *Why: the agent's authority is bounded and revocable from the start, not open-ended.*

**Phase 1 — Discover and establish trust.**
The User Agent fetches the remote agent's Agent Card from `/.well-known/agent-card.json`. It then runs three checks before trusting it:
1. **A2A signature** (v1.0 signed card) — proves the card really belongs to that domain (anti-forgery).
2. **KYA credential** — proves the agent is bound to a verified principal (a real, KYC'd company/human), and declares which `dataClasses` and `scopes` it may handle.
3. **Revocation status** — calls the KYA `revocationEndpoint`; a revoked agent is rejected.
*Why: in an open marketplace, identity and authority of the counterparty must be verified before any data moves — A2A alone proves "who published the card", KYA proves "who's accountable and what they're allowed."*

**Phase 2 — Classify data and get scoped consent.**
The User Agent figures out exactly what fields the task needs and classifies each (VERIFY / OPERATE-STANDARD / OPERATE-SENSITIVE). For OPERATE fields it checks the remote agent's `dataClasses` permit them. ByoSync then shows the user a **scoped consent prompt** — "Astrology Agent wants your birth date, time, and city for a reading" — and the user approves with a biometric tap. ByoSync mints a **purpose-bound consent token** (JWT with `jti`, `context_id`, the exact `fields`, `purpose`, and a TTL). *Why: consent is specific (these fields, this agent, this purpose, this long), not a blanket "allow". Minimization is enforced here — the agent can only ever ask for what's in the token.*

**Phase 3 — Dispatch the A2A task.**
The User Agent sends an A2A task message to the remote agent. The task carries the **tokenized/minimized context** and the **consent token in metadata** — but **not the raw personal data**. *Why: raw data doesn't travel in the task itself; only a redeemable claim does. If the task is logged or intercepted, no PII leaks.*

**Phase 4 — Unlock at runtime.**
To actually use the data, the remote agent presents the consent token back to ByoSync. The **enclave** checks: token valid? not revoked? scope matches the request? still in TTL? Only if all pass does it release the scoped fields — decrypted from the vault and **re-encrypted to the remote agent's public key** (or processed inside the enclave if the agent runs there). *Why: this is the enforcement teeth — data access is checked at the moment of use, not just at grant time. Revoke the token and the next unlock fails closed.*

**Phase 5 — Process and return the artifact.**
The remote agent does its work and returns an A2A **artifact** (the result — a reading, an order confirmation, a payment receipt). ByoSync writes a **lineage edge** recording that this agent received these fields for this purpose at this time. *Why: the ledger is the system of record for DPDP "who received what, when."*

**Phase 6 — Revoke and delete (the control model, stated honestly).**
This phase is not "prevent the agent from seeing the data" — by this point the agent has seen what it was authorized to see. It is **informed sharing + ongoing control**, which is exactly what DPDP/GDPR require. Be precise about what is *guaranteed* versus what is *requested*, because an auditor will press on this:

**Two things ByoSync guarantees (enforced on its own side):**
1. **Informed before sharing** — the user saw exactly which fields, which agent, and what purpose in Phase 2, and approved with biometric. Nothing was shared silently.
2. **Future access cut off instantly on revoke** — revoking kills the consent token; the next runtime unlock (Phase 4) fails closed. The agent can obtain *nothing further*. This is airtight because it's on ByoSync's side of the line.

**One thing ByoSync directs and verifies (depends on the recipient):**
3. **Deletion of the already-delivered copy** — on TTL expiry or revoke, the **deletion callback** fires and the agent must call `confirmDeletion(jti)`. ByoSync cannot physically force erasure on someone else's system, so it does the next best, audit-grade thing: it *requires* confirmation, *records* whether the agent confirmed, and *flags non-confirmation* in the audit log as a contract breach it can act on.

*Why this framing matters: "we delete it from the agent" is false — the agent deletes it, on the user's instruction, and we verify. "You're informed before it's shared, you can cut off access instantly, and you direct deletion which we track" is true and survives audit. The honest claim is the stronger claim.*

*Why minimization carries the weight: because deletion can't be physically forced, the real protection is that the agent only ever received the minimum. Even an agent that ignores the delete request is sitting on just the few fields it was authorized to see, for a purpose the user agreed to — not a full profile.*

Revocation also **cascades**: all downstream delegated tokens invalidate and deletion webhooks fire across the lineage chain (v3 §11.3).

---

## 3 — EXAMPLE A: ASTROLOGY AGENT (OPERATE-STANDARD, strict minimization)

**Goal:** User asks for a personalized astrology reading.
**Data needed:** birth date, birth time, birth city. **Not needed:** name, phone, address, anything financial.

```
[User] ──biometric──> [User Agent]      (Phase 0: mandate "get astrology reading", TTL 1h)
   │
[User Agent]
   │ Phase 1: fetch astrology agent card
   │   ✓ A2A signature valid
   │   ✓ KYA credential: principal = did:byosync:astrocorp,
   │       dataClasses = [VERIFY, OPERATE-STANDARD]   ← may receive birth data
   │       NOT permitted OPERATE-SENSITIVE
   │   ✓ revocation status: active
   │
   │ Phase 2: needs {dob, birthTime, birthCity} = OPERATE-STANDARD
   │   → all within agent's permitted class ✓
   │   → ByoSync prompts user: "AstroCorp wants birth date, time, city for a reading"
   │   → user biometric approve
   │   → consent token: fields=[dob,birthTime,birthCity], purpose=astrology_reading, TTL=1h
   │
   │ Phase 3: A2A task → astrology agent
   │   parts: [ {kind:"data", ref:"byosync://vault/birthset"} ]
   │   metadata: { byosyncConsentToken }     ← no raw birth data in the task
   ▼
[Astrology Agent]
   │ Phase 4: presents token to ByoSync enclave
   │   enclave verifies token + scope + TTL → releases ONLY {dob,birthTime,birthCity}
   │   encrypted to astrology agent's key
   │ Phase 5: computes chart → returns artifact {reading, gemstoneRecommendation}
   ▼
[ByoSync] writes lineage edge: USER → AstroCorp, fields=[birth*], purpose=astrology, ts
   │
   │ Phase 6: TTL 1h expiry → deletion callback → AstroCorp confirms delete
```

**Teaching points:**
- The agent gets birth fields and **nothing else** — name, contacts, payment are never in scope. That's minimization in action.
- Birth data is OPERATE-STANDARD (you *want* the agent to see it), so an external agent is fine — protection is scoped consent + short TTL + deletion, not refusing the share.
- Had the agent's card requested `dob` for VERIFY only, it would have gotten a boolean — but astrology needs the real value, so OPERATE-STANDARD is correct.

---

## 4 — EXAMPLE B: PAYMENT (intent authorization — NO instrument data)

**Goal:** Pay ₹499 to a merchant agent.
**Critical rule:** ByoSync **never** touches card / bank / UPI credentials (OPERATE-SENSITIVE, prohibited). Payment is handled as a **signed intent**, not a data share.

```
[User Agent] wants to pay ₹499 to merchant M
   │
   │ Phase 2: this is NOT a PII share — it's an authorization
   │   → ByoSync prompts user: "Authorize payment of ₹499 to MerchantM?"
   │   → user biometric approve
   │   → ByoSync mints a PAYMENT INTENT token (signed):
   │       { principal: verified user, amount: 499, payee: M,
   │         purpose: "order #1234", ts, jti, TTL: 5min }
   │   ← contains NO card/bank data — only the authorization
   ▼
[Merchant / Payment Agent]  (A2A AP2 commerce extension)
   │ Phase 4/5: presents intent token to the PAYMENT RAIL (Razorpay/processor)
   │   - rail confirms with ByoSync the intent is valid + not revoked
   │   - rail charges the user's instrument (which the rail holds, ByoSync never sees)
   │   - returns payment receipt artifact
   ▼
[ByoSync] lineage edge: records the AUTHORIZATION EVENT only
   (verified human authorized ₹499 to M at T) — never the instrument
```

**Teaching points:**
- The card/bank/UPI detail never enters the A2A flow or ByoSync. The processor owns it.
- ByoSync's contribution is *"a verified, live human authorized exactly this payment"* — binding biometric presence to the payment intent. That's the fraud-prevention value, with zero instrument exposure.
- The intent token has a very short TTL (minutes) and single-use `jti` — it can't be replayed.

---

## 5 — EXAMPLE C: SHOPPING (all three data classes in one task)

**Goal:** Order an age-restricted item, deliver to home, pay from wallet.
**Data:** age check (VERIFY), delivery address (OPERATE-STANDARD), payment (intent).

```
[User Agent] → shopping agent (card verified: KYA dataClasses=[VERIFY,OPERATE-STANDARD])
   │
   │ Phase 2: task needs three things, three different handlings:
   │   (a) age 18+        → VERIFY            → boolean, agent never sees DOB
   │   (b) delivery addr  → OPERATE-STANDARD  → consented share, TTL until delivered+7d
   │   (c) payment ₹X     → INTENT            → authorization, no instrument
   │   → ByoSync shows ONE consolidated consent screen listing all three
   │   → user biometric approve once
   │   → mints: verify-token(age), consent-token(address, TTL=delivery+7d),
   │            intent-token(payment, TTL=5min)
   ▼
[Shopping Agent]
   │ (a) redeems verify-token → ByoSync enclave → "age18plus: true"   (no DOB leaves)
   │ (b) redeems consent-token → enclave → delivery address (enc to agent)
   │ (c) routes intent-token → payment rail (Example B path)
   │ → places order, returns artifact {orderId, eta}
   ▼
[ByoSync] lineage edges:
   USER → ShopCo (age:VERIFY, ts)
   USER → ShopCo (address:OPERATE, purpose:delivery, expires:delivery+7d)
   USER → ShopCo (payment intent, ts)
   │
   │ Phase 6: on delivery+7d → deletion callback for address → ShopCo confirms delete
```

**Teaching points:**
- One user tap, three data classes, three different protections — the user isn't bombarded; ByoSync consolidates into a single scoped consent screen.
- Age is proven without revealing DOB (VERIFY). Address is shared but auto-expires after delivery (OPERATE-STANDARD). Payment never exposes the instrument (intent).
- Each field has its **own TTL** — address lives days, payment intent lives minutes.

---

## 6 — ALL THREE ORCHESTRATED: ONE REAL REQUEST

**User says to their assistant:** *"Get me an astrology reading and order the recommended gemstone, pay from my wallet."*

This fans one goal out to three remote agents, each with different data needs — a true multi-agent, multi-hop A2A flow.

```
[User] ──biometric──> [User Agent]   mandate: "astrology + buy gemstone + pay", TTL 1h
   │
   ├─(1)─> [Astrology Agent]   §3 flow
   │           gets birth data (OPERATE-STANDARD, scoped)
   │           returns: reading + "recommended: yellow sapphire"
   │
   ├─(2)─> [Shopping Agent]    §5 flow, for the yellow sapphire
   │           (a) age check if needed → VERIFY boolean
   │           (b) delivery address → OPERATE-STANDARD, TTL=delivery+7d
   │           returns: order draft, total ₹499
   │
   └─(3)─> [Payment]           §4 flow
               authorize ₹499 intent → rail charges → receipt

MULTI-HOP CONSENT RULE (from v3 §10.4):
   - User Agent holds the session mandate.
   - Each remote agent gets its OWN narrowed consent token (scope can only shrink).
   - Astrology token (birth data) ≠ Shopping token (address) ≠ Payment intent.
   - No token is reusable across agents; each is purpose- and agent-bound.
   - Revoke the session → all three downstream tokens invalidate (cascade).

LINEAGE (what the user sees on their dashboard afterwards):
   Birth data    → AstroCorp   (astrology, 21 May, deleted 21 May 14:30)
   Address       → ShopCo      (delivery, 21 May, deletes 28 May)
   Payment ₹499  → MerchantM   (authorized 21 May, instrument never shared)
```

---

## 7 — WHAT EACH TOKEN / CRYPTO DOES (quick reference)

| Element | Role in the flow |
|---|---|
| **Session mandate** | Bounds what the User Agent may do on the user's behalf (goal, scope, TTL) |
| **KYA credential** (JWS, in Agent Card) | Proves remote agent's verified principal + permitted data classes |
| **A2A signed card** | Proves the card belongs to the claimed domain (anti-forgery) |
| **Consent token** (JWT, jti, context_id, TTL) | Redeemable claim for specific fields, agent, purpose — minted on biometric consent |
| **Verify-token** | Unlocks a boolean answer only (VERIFY class) |
| **Intent token** | Authorizes a payment without any instrument data |
| **Enclave unlock** | Runtime check (valid/not-revoked/in-scope/in-TTL) before any raw data is released |
| **Encrypt-to-agent** (ECIES / RSA-OAEP + AES-GCM) | Scoped data leaves the enclave encrypted to the receiving agent's key only |
| **Lineage edge** (hash-chained) | System-of-record entry for DPDP "who received what, when" |
| **Deletion callback** | *Requests* erasure on TTL/revoke; records confirmation; flags non-confirmation (verify, not force) |

---

## 8 — HONEST FLAGS

- **The claim is informed-consent-plus-control, NOT prevention.** The astrology agent really does see your birth date; the shopping agent really sees your address. Don't claim otherwise. The defensible claim has two guarantees and one verified request:
  - *Guaranteed:* the user is **informed before** any share (Phase 2), and their **future access is cut off instantly** on revoke (Phase 4 fails closed). Both are airtight — they're on ByoSync's side.
  - *Directed + verified:* deletion of the **already-delivered copy** is requested via callback and **confirmation is recorded**; non-confirmation is flagged as a breach. ByoSync cannot physically force erasure on a third party's system — saying "we delete it from the agent" is false; "the user directs deletion and we verify it" is true.
  - *Wording for pitch/consent screens:* say "you control what's shared and can revoke and request deletion anytime" — never "your data is never exposed." The first survives an audit; the second collapses the moment an agent legitimately needs a real value.
- **Minimization carries the real weight.** Because deletion can't be forced, the strongest protection is that the agent only ever received the minimum (astrology got 3 birth fields, nothing else). A non-compliant agent that ignores the delete request holds only what it was authorized to see, for a purpose the user agreed to — not a profile.
- **OPERATE-SENSITIVE to external agents is still a hard no.** Health, financial, govt-ID, biometric never go to a non-enclave third-party agent. Payment is the proof of the pattern: don't share the instrument, authorize the intent.
- **Multi-hop is where leaks hide.** Enforce the shrink-only delegation rule strictly — a downstream agent must never end up with broader scope than the user granted. This is the most likely place to get it wrong.
- **A2A is still maturing.** Build to v1.0 signed cards + the auth hook, but keep A2A specifics behind an adapter so spec changes don't ripple through your consent logic.
- **The consent screen is a UX problem, not just a crypto one.** Example C consolidates three data classes into one tap — if you instead prompt three times, users will rubber-stamp. Good consolidated consent UX is part of the security model.

---

*Target-state worked examples. Assumes v2 (enclave) and v3 (lineage + KYA + consent tokens) are in place. The enclave is what makes "unlock at runtime, never held by ByoSync" real — without it, these flows degrade to ordinary data-sharing with a log.*
