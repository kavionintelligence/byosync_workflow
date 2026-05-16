"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── types ─────────────────────────────────────────────────────────────────────
type Lang  = "kotlin" | "swift" | "react";
type Slide = {
  num:   string;
  badge: string;
  color: string;
  title: string;
  desc:  string;
  codes: Record<Lang, string>;
};

// ── 13 integration slides · 3 languages each ─────────────────────────────────
const SLIDES: Slide[] = [
  {
    num: "01 / 13", badge: "INSTALL", color: "#22d3ee",
    title: "Add the SDK dependency",
    desc:  "One package for your backend. An optional thin client for mobile/web captures the user-side biometric handshake.",
    codes: {
      kotlin:
`// build.gradle.kts
dependencies {
    implementation("io.byosync:byosync-sdk:1.0.0")
    implementation("io.byosync:byosync-webhooks:1.0.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
}
repositories {
    mavenCentral()
    maven("https://packages.byosync.io/maven")
}`,
      swift:
`// Package.swift — Swift Package Manager
dependencies: [
    .package(
        url: "https://github.com/byosync/byosync-swift.git",
        from: "1.0.0"
    )
],
targets: [
    .target(
        name: "YourApp",
        dependencies: ["ByoSyncSDK"]
    )
]`,
      react:
`# npm
npm install @byosync/web-sdk

# yarn
yarn add @byosync/web-sdk

# peer deps
npm install jose`,
    },
  },
  {
    num: "02 / 13", badge: "INIT", color: "#22d3ee",
    title: "Initialise the client",
    desc:  "Create a singleton client with your API key. Server-side only — never expose the key to the client bundle.",
    codes: {
      kotlin:
`import io.byosync.ByoSyncClient
import io.byosync.Environment

// Singleton — Spring @Bean or Ktor module level
val byoSync = ByoSyncClient(
    apiKey        = System.getenv("BYOSYNC_API_KEY"),
    environment   = Environment.PRODUCTION,
    webhookSecret = System.getenv("BYOSYNC_WEBHOOK_SECRET")
)`,
      swift:
`import ByoSyncSDK

// AppDelegate / @main — server-side (Vapor)
let byoSync = ByoSyncClient(
    apiKey:        Environment.get("BYOSYNC_API_KEY")!,
    environment:   .production,
    webhookSecret: Environment.get("BYOSYNC_WEBHOOK_SECRET")!
)`,
      react:
`import { ByoSyncClient } from '@byosync/web-sdk';

// server/lib/byosync.ts  (Next.js server only)
export const byoSync = new ByoSyncClient({
    apiKey:        process.env.BYOSYNC_API_KEY!,
    environment:   'production',
    webhookSecret: process.env.BYOSYNC_WEBHOOK_SECRET!,
});`,
    },
  },
  {
    num: "03 / 13", badge: "ENROLL USER", color: "#a78bfa",
    title: "Register a user vault",
    desc:  "One-time per user. The SDK handles biometric capture on-device and sends ByoSync only the auth primitives. You receive a user_token via webhook.",
    codes: {
      kotlin:
`// Ktor webhook receiver
post("/webhooks/byosync") {
    val sig   = call.request.header("Byosync-Signature") ?: return@post
    val body  = call.receiveText()
    val event = byoSync.webhooks.verify(body, sig)

    if (event.type == "user.enrolled") {
        val userToken = event.data["user_token"] as String
        // Only handle you'll ever need — no PII
        userRepository.saveByoSyncToken(
            userId   = session.userId,
            byoToken = userToken
        )
    }
    call.respond(mapOf("received" to true))
}`,
      swift:
`// Vapor route
app.post("webhooks", "byosync") { req async throws -> Response in
    let sig   = req.headers.first(name: "Byosync-Signature") ?? ""
    let event = try byoSync.webhooks.verify(req.body.string ?? "", sig)

    if event.type == "user.enrolled",
       let userToken = event.data["user_token"] as? String {
        try await userRepo.saveByoSyncToken(
            userId:   session.userId,
            byoToken: userToken
        )
    }
    return .init(status: .ok, body: .init(string: #"{"received":true}"#))
}`,
      react:
`// app/api/webhooks/byosync/route.ts
export async function POST(req: Request) {
    const sig  = req.headers.get('byosync-signature') ?? '';
    const body = await req.text();
    const event = await byoSync.webhooks.verify(body, sig);

    if (event.type === 'user.enrolled') {
        const { user_token } = event.data;
        // Only handle you'll ever need — no PII
        await db.users.update(
            { id: session.userId },
            { byosync_token: user_token }
        );
    }
    return Response.json({ received: true });
}`,
    },
  },
  {
    num: "04 / 13", badge: "CONSENT DESIGN", color: "#34d399",
    title: "Design a reusable consent template",
    desc:  "Define once: which fields, the purpose, expiry, delivery channel, and the exact copy the user reads on their phone.",
    codes: {
      kotlin:
`import io.byosync.consent.*

val template = byoSync.consent.createTemplate(
    ConsentTemplate(
        name        = "KYC Onboarding – AcmePay",
        purpose     = "worker_onboarding",
        fields      = listOf("age_over_18", "kyc_verified"),
        mode        = ConsentMode.BOOLEAN,
        expiresIn   = Duration.ofMinutes(10),
        notifyVia   = listOf(NotifyChannel.APP_PUSH, NotifyChannel.EMAIL),
        language    = "en",
        userMessage = "AcmePay wants to verify your identity for onboarding."
    )
)
// template.id = "tmpl_kyc_v1"`,
      swift:
`import ByoSyncSDK

let template = try await byoSync.consent.createTemplate(
    ConsentTemplate(
        name:        "KYC Onboarding – AcmePay",
        purpose:     "worker_onboarding",
        fields:      ["age_over_18", "kyc_verified"],
        mode:        .boolean,
        expiresIn:   .minutes(10),
        notifyVia:   [.appPush, .email],
        language:    "en",
        userMessage: "AcmePay wants to verify your identity for onboarding."
    )
)
// template.id == "tmpl_kyc_v1"`,
      react:
`const template = await byoSync.consent.createTemplate({
    name:        'KYC Onboarding – AcmePay',
    purpose:     'worker_onboarding',
    fields:      ['age_over_18', 'kyc_verified'],
    mode:        'boolean',       // never returns raw PII
    expiresIn:   '10m',
    notifyVia:   ['app_push', 'email'],
    language:    'en',
    userMessage: 'AcmePay wants to verify your identity for onboarding.',
});
// template.id = 'tmpl_kyc_v1'`,
    },
  },
  {
    num: "05 / 13", badge: "SEND CONSENT", color: "#34d399",
    title: "Send consent to user (push + email)",
    desc:  "Trigger a request. ByoSync delivers it as a push notification AND email — you control the subject line and body copy.",
    codes: {
      kotlin:
`val request = byoSync.consent.request(
    ConsentRequest(
        userToken   = user.byoSyncToken,
        templateId  = "tmpl_kyc_v1",
        notifyVia   = listOf(NotifyChannel.APP_PUSH, NotifyChannel.EMAIL),
        callbackUrl = "https://acmepay.com/webhooks/byosync",
        emailSubject = "Action needed: verify your identity",
        emailBody   = """
            Hi {{user_name}},
            AcmePay needs to verify your KYC.
            Tap below — expires in 10 minutes.
            {{consent_link}}
        """.trimIndent()
    )
)
// request.consentId = "con_5af23e"`,
      swift:
`let request = try await byoSync.consent.request(
    ConsentRequest(
        userToken:    user.byoSyncToken,
        templateId:   "tmpl_kyc_v1",
        notifyVia:    [.appPush, .email],
        callbackURL:  URL(string: "https://acmepay.com/webhooks/byosync")!,
        emailSubject: "Action needed: verify your identity",
        emailBody:    """
            Hi {{user_name}},
            AcmePay needs to verify your KYC.
            Tap below — expires in 10 minutes.
            {{consent_link}}
            """
    )
)
// request.consentId == "con_5af23e"`,
      react:
`const request = await byoSync.consent.request({
    userToken:    user.byosync_token,
    templateId:   'tmpl_kyc_v1',
    notifyVia:    ['app_push', 'email'],
    callbackUrl:  'https://acmepay.com/webhooks/byosync',
    emailSubject: 'Action needed: verify your identity',
    emailBody: \`Hi {{user_name}},
AcmePay needs to verify your KYC.
Tap below — expires in 10 minutes.
{{consent_link}}\`,
});
// request.consentId = 'con_5af23e'`,
    },
  },
  {
    num: "06 / 13", badge: "IN-APP CONSENT UI", color: "#34d399",
    title: "Embed the consent widget in your app",
    desc:  "For in-app flows: get a signed widget URL and render it in a WebView. User approves inside your app — no external redirect.",
    codes: {
      kotlin:
`val widget = byoSync.consent.getWidgetUrl(
    consentId   = request.consentId,
    userToken   = user.byoSyncToken,
    redirectUrl = "https://acmepay.com/onboarding/complete",
    theme = mapOf(
        "primaryColor"    to "#22d3ee",
        "backgroundColor" to "#0f172a",
        "fontFamily"      to "Inter, sans-serif"
    )
)
// Render widget.url in an Android WebView
// widget.expiresAt — valid for 5 minutes only`,
      swift:
`let widget = try await byoSync.consent.getWidgetUrl(
    consentId:   request.consentId,
    userToken:   user.byoSyncToken,
    redirectURL: URL(string: "https://acmepay.com/onboarding/complete")!,
    theme: [
        "primaryColor":    "#22d3ee",
        "backgroundColor": "#0f172a",
        "fontFamily":      "SF Pro Display, sans-serif"
    ]
)
// Load widget.url in WKWebView
// widget.expiresAt — valid for 5 minutes only`,
      react:
`// React component — renders consent widget inline
export function ConsentWidget({ consentId, userToken }) {
    const [widgetUrl, setWidgetUrl] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/consent/widget-url', {
            method: 'POST',
            body: JSON.stringify({ consentId, userToken }),
        })
        .then(r => r.json())
        .then(d => setWidgetUrl(d.widgetUrl));
    }, [consentId]);

    if (!widgetUrl) return <div>Loading...</div>;
    // Renders inside your UI — no external browser
    return <iframe src={widgetUrl} className="w-full h-96 border-0 rounded-xl" />;
}`,
    },
  },
  {
    num: "07 / 13", badge: "VERIFY PROOF", color: "#34d399",
    title: "Receive and verify the signed assertion",
    desc:  "ByoSync delivers a JWS to your webhook. Verify the signature — the result is a boolean map, never raw PII.",
    codes: {
      kotlin:
`post("/webhooks/byosync") {
    val event = byoSync.webhooks.verify(body, sig)

    if (event.type == "consent.approved") {
        val proof = byoSync.assertions.verify(
            event.data["assertion_jws"] as String
        )
        // proof.result = mapOf(
        //   "age_over_18" to true,
        //   "kyc_verified" to true
        // )
        accessService.grant(proof.consentId, proof.result)
    }
}`,
      swift:
`app.post("webhooks", "byosync") { req async throws -> Response in
    let event = try byoSync.webhooks.verify(body, sig)

    if event.type == "consent.approved",
       let jws = event.data["assertion_jws"] as? String {
        let proof = try await byoSync.assertions.verify(jws)
        // proof.result = ["age_over_18": true, "kyc_verified": true]
        try await accessService.grant(proof.consentId, proof.result)
    }
    return .ok
}`,
      react:
`// app/api/webhooks/byosync/route.ts
if (event.type === 'consent.approved') {
    const proof = await byoSync.assertions.verify(
        event.data.assertion_jws
    );
    // proof.result = { age_over_18: true, kyc_verified: true }
    // No PII — only signed booleans
    await grantAccess(proof.consentId, proof.result);
}`,
    },
  },
  {
    num: "08 / 13", badge: "PAYMENT SCA", color: "#fbbf24",
    title: "Trigger face-payment SCA",
    desc:  "Create a payment intent. ByoSync pushes it to the user's device for face + voice approval. You receive a signed SCA proof to forward to your processor.",
    codes: {
      kotlin:
`// Step 1 — create intent on checkout backend
val intent = byoSync.payment.createIntent(
    PaymentIntent(
        userToken    = user.byoSyncToken,
        amount       = 250000,       // paise
        currency     = "INR",
        merchant     = "AcmePay",
        orderId      = "#4421",
        paymentToken = "tok_card_4382"   // vault token, not PAN
    )
)
// Step 2 — SCA proof arrives via webhook
if (event.type == "payment.authorized") {
    val scaProof = event.data["sca_proof"] as String
    processor.charge(paymentToken, scaProof, amount)
}`,
      swift:
`// Step 1 — create intent
let intent = try await byoSync.payment.createIntent(
    PaymentIntent(
        userToken:    user.byoSyncToken,
        amount:       250000,
        currency:     "INR",
        merchant:     "AcmePay",
        orderId:      "#4421",
        paymentToken: "tok_card_4382"
    )
)
// Step 2 — receive proof
if event.type == "payment.authorized",
   let scaProof = event.data["sca_proof"] as? String {
    try await processor.charge(paymentToken, scaProof, amount)
}`,
      react:
`// Step 1 — your checkout API route
const intent = await byoSync.payment.createIntent({
    userToken:    user.byosync_token,
    amount:       250000,         // paise
    currency:     'INR',
    merchant:     'AcmePay',
    orderId:      '#4421',
    paymentToken: 'tok_card_4382', // vault token, not PAN
});

// Step 2 — webhook for 'payment.authorized'
if (event.type === 'payment.authorized') {
    const { sca_proof } = event.data;
    await processor.charge({ paymentToken, scaProof: sca_proof, amount });
}`,
    },
  },
  {
    num: "09 / 13", badge: "EMPLOYEE REGISTER", color: "#f87171",
    title: "Register an employee with access policy",
    desc:  "Only employees registered with ByoSync can ever request plaintext. Role, allowed fields, MFA requirement — all enforced server-side.",
    codes: {
      kotlin:
`import io.byosync.employees.*

val employee = byoSync.employees.register(
    EmployeeRegistration(
        employeeId = "emp_priya_4521",
        name       = "Priya S.",
        email      = "priya@acmepay.com",
        role       = EmployeeRole.KYC_REVIEWER,
        accessPolicy = AccessPolicy(
            allowedFields   = listOf("address_proof", "kyc_document"),
            requireMfa      = true,
            requireTicket   = true,
            maxViewDuration = Duration.ofMinutes(15),
            viewMode        = ViewMode.VIEW_ONLY_WATERMARKED
        )
    )
)
// employee.token = "emp_tok_priya_4521"`,
      swift:
`let employee = try await byoSync.employees.register(
    EmployeeRegistration(
        employeeId: "emp_priya_4521",
        name:       "Priya S.",
        email:      "priya@acmepay.com",
        role:       .kycReviewer,
        accessPolicy: AccessPolicy(
            allowedFields:   ["address_proof", "kyc_document"],
            requireMfa:      true,
            requireTicket:   true,
            maxViewDuration: .minutes(15),
            viewMode:        .viewOnlyWatermarked
        )
    )
)`,
      react:
`const employee = await byoSync.employees.register({
    employeeId: 'emp_priya_4521',
    name:       'Priya S.',
    email:      'priya@acmepay.com',
    role:       'kyc_reviewer',
    accessPolicy: {
        allowedFields:   ['address_proof', 'kyc_document'],
        requireMfa:      true,
        requireTicket:   true,
        maxViewDuration: '15m',
        viewMode:        'view_only_watermarked',
    },
});
// employee.token = 'emp_tok_priya_4521'`,
    },
  },
  {
    num: "10 / 13", badge: "EMPLOYEE ACCESS", color: "#f87171",
    title: "Employee requests plaintext view",
    desc:  "Employee triggers a view session. ByoSync gets user consent, decrypts in-enclave, overlays the watermark, and streams a render. Never raw bytes.",
    codes: {
      kotlin:
`suspend fun requestPlaintextView(
    employeeId: String,
    userId: String,
    ticket: String
): PlaintextSession {
    return byoSync.access.requestPlaintext(
        PlaintextRequest(
            userToken  = user.byoSyncToken,
            fields     = listOf("address_proof"),
            purpose    = "manual_kyc_review",
            ticket     = ticket,           // JIRA-4421
            duration   = Duration.ofMinutes(15),
            mode       = ViewMode.VIEW_ONLY_WATERMARKED,
            employeeId = employeeId        // baked into watermark
        )
    )
    // session.streamUrl → render in your viewer
}`,
      swift:
`func requestPlaintextView(
    employeeId: String,
    userId: String,
    ticket: String
) async throws -> PlaintextSession {
    return try await byoSync.access.requestPlaintext(
        PlaintextRequest(
            userToken:  user.byoSyncToken,
            fields:     ["address_proof"],
            purpose:    "manual_kyc_review",
            ticket:     ticket,
            duration:   .minutes(15),
            mode:       .viewOnlyWatermarked,
            employeeId: employeeId
        )
    )
    // session.streamURL → load in WKWebView
}`,
      react:
`// Admin tool API route
const session = await byoSync.access.requestPlaintext({
    userToken:  user.byosync_token,
    fields:     ['address_proof'],
    purpose:    'manual_kyc_review',
    ticket:     'JIRA-4421',
    duration:   '15m',
    mode:       'view_only_watermarked',
    employeeId: currentEmployee.id,
});
// Render in an iframe — no download, no clipboard
return { viewUrl: session.streamUrl, expiresAt: session.expiresAt };`,
    },
  },
  {
    num: "11 / 13", badge: "ACCESS MANAGEMENT", color: "#f87171",
    title: "Update and list employee access policies",
    desc:  "Narrow or revoke an employee's access at any time. Every policy change is itself audit-logged and WORM-stored.",
    codes: {
      kotlin:
`// Narrow allowed fields
byoSync.employees.updatePolicy(
    employeeId   = "emp_priya_4521",
    accessPolicy = AccessPolicy(
        allowedFields   = listOf("address_proof"),
        requireMfa      = true,
        requireTicket   = true,
        maxViewDuration = Duration.ofMinutes(10),
        allowedIpRange  = "192.168.1.0/24"
    )
)
// List all employees with active grants
val active = byoSync.employees.listActive()
active.forEach { emp ->
    println("\${emp.name} — last: \${emp.lastActive}")
}`,
      swift:
`try await byoSync.employees.updatePolicy(
    employeeId: "emp_priya_4521",
    accessPolicy: AccessPolicy(
        allowedFields:   ["address_proof"],
        requireMfa:      true,
        requireTicket:   true,
        maxViewDuration: .minutes(10),
        allowedIPRange:  "192.168.1.0/24"
    )
)
let active = try await byoSync.employees.listActive()
for emp in active {
    print("\(emp.name) — last: \(emp.lastActive)")
}`,
      react:
`await byoSync.employees.updatePolicy('emp_priya_4521', {
    allowedFields:   ['address_proof'],
    requireMfa:      true,
    requireTicket:   true,
    maxViewDuration: '10m',
    allowedIpRange:  '192.168.1.0/24',
});

const active = await byoSync.employees.listActive();
active.forEach(emp => {
    console.log(\`\${emp.name} — last: \${emp.lastActive}\`);
});`,
    },
  },
  {
    num: "12 / 13", badge: "AUDIT LOGS", color: "#a78bfa",
    title: "Query employee access audit logs",
    desc:  "Every view, every consent request, every policy change is WORM-logged and hash-chained. Filterable by employee, user, event type, and date range.",
    codes: {
      kotlin:
`val logs = byoSync.audit.getEmployeeLogs(
    employeeId = "emp_priya_4521",
    filter = AuditFilter(
        from   = Instant.now() - Duration.ofDays(30),
        to     = Instant.now(),
        events = listOf("plaintext_viewed", "consent_requested")
    )
)
logs.forEach { entry ->
    println("""
        Event:    \${entry.event}
        Employee: \${entry.employeeId}
        Field:    \${entry.field}
        Duration: \${entry.durationActual}
        Hash:     \${entry.eventHash}
    """.trimIndent())
}`,
      swift:
`let logs = try await byoSync.audit.getEmployeeLogs(
    employeeId: "emp_priya_4521",
    filter: AuditFilter(
        from:   Date().addingTimeInterval(-30 * 86400),
        to:     Date(),
        events: ["plaintext_viewed", "consent_requested"]
    )
)
for entry in logs {
    print("""
        Event:    \(entry.event)
        Employee: \(entry.employeeId)
        Field:    \(entry.field)
        Hash:     \(entry.eventHash)
    """)
}`,
      react:
`const logs = await byoSync.audit.getEmployeeLogs({
    employeeId: 'emp_priya_4521',
    filter: {
        from:   new Date(Date.now() - 30 * 86400_000).toISOString(),
        to:     new Date().toISOString(),
        events: ['plaintext_viewed', 'consent_requested'],
    },
});
logs.forEach(entry => {
    console.log({
        event:    entry.event,
        employee: entry.employeeId,
        field:    entry.field,
        hash:     entry.eventHash,   // WORM chain
    });
});`,
    },
  },
  {
    num: "13 / 13", badge: "REVOCATION", color: "#f87171",
    title: "Handle consent revocation",
    desc:  "ByoSync fires a signed webhook the instant a user revokes. Purge cached tokens, live sessions, and stored assertions immediately.",
    codes: {
      kotlin:
`post("/webhooks/byosync") {
    val event = byoSync.webhooks.verify(body, sig)

    when (event.type) {
        "consent.revoked" -> {
            val consentId = event.data["consent_id"] as String
            val userToken = event.data["user_token"] as String
            cacheService.delete("assertion:\$consentId")
            tokenRepository.deleteByConsentId(consentId)
            sessionService.revokeAll(userToken)
            auditService.log(AuditEvent.CONSENT_REVOKED, event.data)
        }
    }
    call.respond(mapOf("received" to true))
}`,
      swift:
`app.post("webhooks", "byosync") { req async throws -> Response in
    let event = try byoSync.webhooks.verify(body, sig)

    if event.type == "consent.revoked",
       let consentId = event.data["consent_id"] as? String,
       let userToken = event.data["user_token"] as? String {
        try await cacheService.delete("assertion:\(consentId)")
        try await tokenRepo.deleteByConsentId(consentId)
        try await sessionService.revokeAll(userToken)
    }
    return .init(status: .ok, body: .init(string: #"{"received":true}"#))
}`,
      react:
`if (event.type === 'consent.revoked') {
    const { consent_id, user_token } = event.data;
    // 1. invalidate cached assertions
    await cache.del(\`assertion:\${consent_id}\`);
    // 2. remove stored tokens
    await db.tokens.deleteMany({ consent_id });
    // 3. terminate live sessions
    await sessions.revokeAll(user_token);
}
return Response.json({ received: true });`,
    },
  },
];

const STEP_PX = 320;

// ── Kotlin / Swift / React syntax colouring ───────────────────────────────────
const KW_KOTLIN = /^(val|var|fun|class|data|object|suspend|when|if|else|return|import|for|in)\b/;
const KW_SWIFT  = /^(let|var|func|class|struct|guard|if|else|return|import|for|in|try|await)\b/;
const KW_REACT  = /^(const|let|var|function|async|await|return|if|else|import|export|from)\b/;

function lineColor(line: string, lang: Lang): string {
  const t = line.trim();
  if (!t || t === " ") return "#e2e8f0";
  if (t.startsWith("//") || t.startsWith("/*") || t.startsWith("*") || t.startsWith("#"))
    return "#475569";
  if (t.startsWith("implementation(") || t.startsWith("maven(") || t.startsWith(".package(") ||
      t.startsWith(".target(") || t.startsWith("npm ") || t.startsWith("yarn "))
    return "#34d399";
  const kw = lang === "kotlin" ? KW_KOTLIN : lang === "swift" ? KW_SWIFT : KW_REACT;
  if (kw.test(t)) return "#93c5fd";
  if (/\bbyoSync\b/.test(t)) return "#22d3ee";
  if (/\b(ByoSyncClient|ConsentTemplate|ConsentRequest|AccessPolicy|EmployeeRegistration|PlaintextRequest|PaymentIntent|AuditFilter)\b/.test(t))
    return "#fbbf24";
  if (/\b(post|get|app\.post|app\.get|route)\b/.test(t)) return "#a78bfa";
  return "#e2e8f0";
}

const LANGS: { id: Lang; label: string }[] = [
  { id: "kotlin", label: "Kotlin"   },
  { id: "swift",  label: "Swift"    },
  { id: "react",  label: "React.js" },
];

// ── component ─────────────────────────────────────────────────────────────────
export const CodePreview = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);   // direct DOM for sticky — no React re-render per frame
  const [activeIdx, setActiveIdx] = useState(0);
  const [lang, setLang]           = useState<Lang>("kotlin");

  // JS sticky via direct DOM (bypasses React reconciler on every scroll tick)
  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const sec   = sectionRef.current;
        const panel = panelRef.current;
        if (!sec || !panel) return;

        const rect     = sec.getBoundingClientRect();
        const scrolled = -rect.top;
        const viewH    = window.innerHeight;
        const maxTop   = Math.max(0, sec.offsetHeight - viewH);
        const newTop   = Math.min(Math.max(0, scrolled), maxTop);

        // Direct style mutation — zero React overhead
        panel.style.transform = `translateY(${newTop}px)`;

        // Step index — only setState when it actually changes
        const idx = scrolled <= 0
          ? 0
          : Math.min(Math.floor(scrolled / STEP_PX), SLIDES.length - 1);
        setActiveIdx(prev => {
          const next = Math.max(0, idx);
          return prev === next ? prev : next;
        });
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const slide    = SLIDES[activeIdx];
  const progress = SLIDES.length > 1 ? (activeIdx / (SLIDES.length - 1)) * 100 : 0;
  const lines    = slide.codes[lang].split("\n");

  return (
    <section
      ref={sectionRef}
      style={{ height: `calc(${SLIDES.length * STEP_PX}px + 100vh)` }}
      className="relative"
    >
      {/* Panel — position:absolute top:0, then translateY is updated by the scroll listener */}
      <div
        ref={panelRef}
        className="absolute top-0 w-full h-screen flex items-center py-10 px-6 overflow-hidden"
        style={{ background: '#FFFFFF', willChange: "transform" }}
      >
        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-[1fr_1.2fr] gap-10 items-center">

          {/* ── LEFT ─────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            <div className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-600 text-xs font-mono">
              <Terminal className="w-3 h-3" />
              Developer Integration
            </div>

            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight text-blue-950">
              A single handshake for <br />
              <span className="text-blue-600">total identity trust.</span>
            </h2>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
                <span
                  className="inline-flex w-fit px-3 py-0.5 rounded-full text-[11px] font-mono border tracking-widest"
                  style={{ borderColor: slide.color, color: slide.color, background: `${slide.color}18` }}
                >
                  {slide.badge}
                </span>
                <h3 className="text-2xl font-bold text-blue-950 leading-snug">{slide.title}</h3>
                <p className="text-blue-800 text-sm leading-relaxed font-sans">{slide.desc}</p>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots + bar */}
            <div className="mt-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-2">
                <span>{activeIdx + 1} / {SLIDES.length}</span>
                    <span className="flex items-center gap-1 text-slate-400">
                  <motion.span
                    animate={{ y: [0, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="inline-block"
                  >↓</motion.span>
                  scroll through
                </span>
              </div>
              <div className="flex gap-1.5 items-center mb-2">
                {SLIDES.map((s, i) => (
                  <motion.div
                    key={i}
                    className="rounded-full"
                    animate={{
                      width:      i === activeIdx ? 20 : 5,
                      height:     5,
                      background: i === activeIdx ? s.color : "rgba(100,116,139,0.3)",
                    }}
                    transition={{ duration: 0.25 }}
                  />
                ))}
              </div>
              <div className="h-px bg-blue-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: slide.color }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT: TERMINAL ──────────────────────────────────────── */}
          <div className="relative">
            <motion.div
              className="absolute -inset-1 rounded-2xl blur opacity-25"
              animate={{ background: `linear-gradient(135deg, ${slide.color}70, #3b82f670)` }}
              transition={{ duration: 0.5 }}
            />
            <div className="relative bg-[#0b0e14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

              {/* ── Chrome bar with language tabs ── */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
                {/* Traffic lights */}
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>

                {/* Language selector tabs */}
                <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-1 border border-white/5">
                  {LANGS.map(l => (
                    <button
                      key={l.id}
                      onClick={() => setLang(l.id)}
                      className="relative px-3 py-1 rounded-md text-[11px] font-mono transition-colors duration-150"
                      style={{
                        color: lang === l.id ? "#0f172a" : "#475569",
                      }}
                    >
                      {lang === l.id && (
                        <motion.span
                          layoutId="lang-pill"
                          className="absolute inset-0 rounded-md"
                          style={{ background: slide.color }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{l.label}</span>
                    </button>
                  ))}
                </div>

                {/* Step indicator */}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="text-[10px] font-mono text-slate-600 shrink-0"
                  >
                    {slide.num}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* ── Code block ── */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeIdx}-${lang}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="p-5 font-mono text-[12.5px] leading-relaxed overflow-y-auto"
                  style={{ maxHeight: "370px" }}
                >
                  {lines.map((line, i) => (
                    <div key={i} className="flex gap-3 min-h-[1.5rem]">
                      <span className="text-slate-700 select-none w-6 shrink-0 text-right text-[11px] pt-px">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span style={{ color: lineColor(line, lang) }}>{line || "\u00a0"}</span>
                    </div>
                  ))}

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: slide.color }}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                    />
                    <span className="text-[11px] font-mono tracking-widest" style={{ color: slide.color }}>
                      {slide.badge.replace(/ /g, "_")}_READY
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
