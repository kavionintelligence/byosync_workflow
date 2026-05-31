"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { LANDING_SOLUTION } from "@/lib/landing-content";
import { DEMO, LAYER_COLORS } from "@/lib/landing-demo-theme";
import { Layers, ChevronDown, Lock, Code2, Terminal } from "lucide-react";

const LAYER_DETAIL: Record<
  number,
  { encryption?: string; note: string; json: Record<string, unknown>; code: string; codeLabel: string }
> = {
  1: {
    note: "Scans your codebase, API routes, and DB schema to identify trust gaps, then generates a precise SDK integration plan.",
    json: {
      agent_id: "agt_bys_7f2a91",
      scan_targets: ["github_repo", "db_schema", "api_routes"],
      findings: { pii_fields_exposed: 12, risk_score: 78, severity: "HIGH" },
      action: "generate_sdk_integration_plan",
    },
    code: `import ByoSync from '@byosync/sdk';

const agent = new ByoSync.TrustAgent({
  apiKey: process.env.BYO_API_KEY,
  scanMode: 'full',
});

const report = await agent.scan({
  targets: ['repo', 'db', 'api'],
});`,
    codeLabel: "SDK · Node.js",
  },
  2: {
    note: "Private vault stores user PII. Partners receive purpose-bound tokens. No raw PII leaves the vault.",
    encryption: "AES-256-GCM · HKDF-SHA256",
    json: {
      vault_id: "bvlt_9f4a2e81",
      access_token: { type: "purpose_bound", ttl_seconds: 3600, purpose: "loan_application_v2" },
      raw_pii_at_partner: false,
    },
    code: `const token = await byosync.vault.tokenize({
  userId: user.id,
  fields: ['name', 'phone'],
  purpose: 'loan_application',
  ttl: '1h',
});
return { accessToken: token.id };`,
    codeLabel: "API · REST",
  },
  3: {
    note: "Face liveness + voice print + device binding creates proof that a real human approved this exact action.",
    encryption: "Ed25519 device key · TLS 1.3",
    json: {
      approval_id: "apr_7f2b1c3d",
      methods: ["face_liveness", "voice_print", "device_bound"],
      liveness: { confidence: 0.98, FAR: "< 0.001%" },
    },
    code: `const challenge = await byosync.approval.create({
  userId: user.id,
  purpose: 'loan_application',
  methods: ['face', 'voice', 'device'],
});
const result = await challenge.verify();`,
    codeLabel: "SDK · React Native",
  },
  4: {
    note: "Ed25519-signed proof token. Immutable consent receipts. Revoke webhook fires instantly on user request.",
    encryption: "Ed25519 · SHA-256 hash chain",
    json: {
      proof_token: "bys_pt_0x9f4a2e81c3d7",
      signature_algo: "Ed25519",
      revoke_webhook: "POST /webhook/byosync/revoke",
    },
    code: `const proof = await byosync.proof.verify({
  token: req.headers['x-bys-proof'],
  expectedPurpose: 'loan_application',
});
byosync.webhooks.on('revoke', async (event) => {
  await db.revokeAccess(event.userId);
});`,
    codeLabel: "API · Webhooks",
  },
  5: {
    note: "Tamper-proof audit logs, access history, and breach-impact mapping — pre-built for DPDP, SOC2, and CERT-In.",
    encryption: "Append-only log · SHA-256 Merkle",
    json: {
      frameworks: ["DPDP", "SOC2_TypeII", "CERT-In"],
      evidence_summary: { total_events: 24713, compliance_score: 94 },
      tamper_proof: true,
    },
    code: `const evidence = await byosync.evidence.query({
  dateRange: { from: '2024-01-01' },
  frameworks: ['DPDP', 'SOC2'],
});
const pdf = await evidence.export({ format: 'PDF' });`,
    codeLabel: "API · Compliance",
  },
};

function JsonValue({ val, depth = 0 }: { val: unknown; depth?: number }) {
  if (val === null) return <span className="text-slate-500">null</span>;
  if (typeof val === "boolean") return <span className="text-red-600">{String(val)}</span>;
  if (typeof val === "number") return <span className="text-amber-600">{val}</span>;
  if (typeof val === "string") return <span className="text-blue-600">&quot;{val}&quot;</span>;
  if (Array.isArray(val)) {
    return (
      <>
        <span className="text-slate-500">[</span>
        {val.map((item, i) => (
          <span key={i} className="block pl-4">
            <JsonValue val={item} depth={depth + 1} />
            {i < val.length - 1 && <span className="text-slate-500">,</span>}
          </span>
        ))}
        <span className="text-slate-500">]</span>
      </>
    );
  }
  if (typeof val === "object" && val !== null) {
    const entries = Object.entries(val as Record<string, unknown>);
    return (
      <>
        <span className="text-slate-500">{"{"}</span>
        {entries.map(([k, v], i) => (
          <span key={k} className="block pl-4">
            <span className="text-blue-900">&quot;{k}&quot;</span>
            <span className="text-slate-500">: </span>
            <JsonValue val={v} depth={depth + 1} />
            {i < entries.length - 1 && <span className="text-slate-500">,</span>}
          </span>
        ))}
        <span className="text-slate-500">{"}"}</span>
      </>
    );
  }
  return <span>{String(val)}</span>;
}

function LayerDetail({ layerId, color }: { layerId: number; color: string }) {
  const detail = LAYER_DETAIL[layerId];
  if (!detail) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div className="mx-4 mb-2 overflow-hidden rounded-2xl border bg-white" style={{ borderColor: `${color}33` }}>
        <div className="flex items-start gap-3 border-b px-5 py-3" style={{ borderColor: `${color}14` }}>
          <Lock size={12} style={{ color, flexShrink: 0, marginTop: 3 }} aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-xs leading-relaxed text-blue-800">{detail.note}</p>
            {detail.encryption && (
              <p className="mt-1.5 font-mono text-[10px]" style={{ color }}>
                {detail.encryption}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
          <div className="border-b border-blue-100 lg:border-r lg:border-b-0">
            <div className="flex items-center gap-2 border-b border-blue-100 px-4 py-2">
              <Terminal size={10} style={{ color }} aria-hidden />
              <span className="font-mono text-[9px] uppercase tracking-widest text-blue-500">Payload · JSON</span>
            </div>
            <div className="max-h-[240px] overflow-auto px-4 py-3">
              <pre className="whitespace-pre font-mono text-[10px] leading-relaxed text-slate-600">
                <JsonValue val={detail.json} />
              </pre>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 border-b border-blue-100 px-4 py-2">
              <Code2 size={10} style={{ color }} aria-hidden />
              <span className="font-mono text-[9px] uppercase tracking-widest text-blue-500">{detail.codeLabel}</span>
            </div>
            <div className="relative max-h-[240px] overflow-auto px-4 py-3">
              <div
                className="pointer-events-none absolute left-0 right-0 h-5"
                style={{
                  background: "linear-gradient(180deg, transparent 0%, rgba(37,99,235,0.04) 50%, transparent 100%)",
                  animation: "scan-line 4s linear infinite",
                }}
                aria-hidden
              />
              <pre className="font-mono text-[10px] leading-relaxed text-blue-900/90" style={{ whiteSpace: "pre-wrap" }}>
                {detail.code.split("\n").map((line, i) => {
                  const isComment = line.trim().startsWith("//");
                  const isKeyword = /^(import|const|let|var|await|async|return|export|new)\b/.test(line.trim());
                  return (
                    <motion.span
                      key={i}
                      className="block"
                      style={{ color: isComment ? DEMO.muted : isKeyword ? DEMO.primaryDark : DEMO.textSoft }}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.04, duration: 0.25 }}
                    >
                      {line || " "}
                    </motion.span>
                  );
                })}
                <motion.span
                  className="ml-0.5 inline-block h-3 w-1.5"
                  style={{ background: DEMO.primary, verticalAlign: "text-bottom" }}
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  aria-hidden
                />
              </pre>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function SolutionStackSection() {
  const [expandedLayer, setExpandedLayer] = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const toggle = (id: number) => setExpandedLayer((prev) => (prev === id ? null : id));

  return (
    <section ref={ref} id="solution" className="relative overflow-x-clip bg-blue-50/40 py-16 sm:py-20 md:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(37,99,235,0.06) 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: "rgba(37,99,235,0.08)", border: `1px solid ${DEMO.border}`, color: DEMO.primary }}
          >
            <Layers size={12} aria-hidden />
            Trust Runtime
          </div>
          <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-blue-950 sm:text-3xl md:text-4xl">
            {LANDING_SOLUTION.headline}
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-blue-800 sm:text-lg">{LANDING_SOLUTION.subline}</p>
          <p className="mt-3 text-xs text-blue-500">Click any layer to see the data format, encryption, and SDK</p>
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-0"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {LANDING_SOLUTION.layers.map((layer, i) => {
            const widths = ["100%", "88%", "76%", "64%", "52%"];
            const width = widths[i] ?? "100%";
            const isFirst = i === 0;
            const isLast = i === LANDING_SOLUTION.layers.length - 1;
            const isExpanded = expandedLayer === layer.id;
            const color = LAYER_COLORS[i] ?? DEMO.primary;
            const detail = LAYER_DETAIL[layer.id];

            return (
              <motion.div key={layer.id} className="relative w-full" style={{ maxWidth: width }}>
                <motion.button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  style={{
                    background: isFirst ? "rgba(219,234,254,0.6)" : DEMO.panel,
                    border: `1px solid ${isExpanded ? color + "55" : color + "30"}`,
                    borderBottom: !isLast && !isExpanded ? "none" : undefined,
                    borderRadius: isFirst ? "16px 16px 0 0" : isLast && !isExpanded ? "0 0 16px 16px" : "0",
                    boxShadow: isExpanded ? `0 0 32px ${color}18` : "none",
                  }}
                  onClick={() => toggle(layer.id)}
                  whileHover={{ background: isFirst ? "rgba(219,234,254,0.85)" : DEMO.panelBlue }}
                  whileTap={{ scale: 0.995 }}
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold"
                      style={{ background: `${color}18`, border: `1px solid ${color}40`, color }}
                      animate={{ scale: isExpanded ? 1.08 : 1, rotate: isExpanded ? 3 : 0 }}
                      transition={{ duration: 0.22 }}
                      aria-hidden
                    >
                      {layer.id}
                    </motion.div>
                    <div className="text-left">
                      <p className="text-sm font-semibold" style={{ color }}>
                        {layer.label}
                      </p>
                      <p className="mt-0.5 text-xs text-blue-600">{layer.desc}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {detail?.encryption && (
                      <span
                        className="hidden items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] sm:inline-flex"
                        style={{ background: `${color}0F`, border: `1px solid ${color}25`, color: `${color}99` }}
                      >
                        <Lock size={8} aria-hidden />
                        {detail.encryption.split(" · ")[0]}
                      </span>
                    )}
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.22 }}>
                      <ChevronDown size={14} style={{ color: color + "80" }} aria-hidden />
                    </motion.div>
                  </div>
                </motion.button>

                <AnimatePresence>{isExpanded && <LayerDetail layerId={layer.id} color={color} />}</AnimatePresence>

                {isLast && isExpanded && (
                  <div className="h-2 rounded-b-2xl bg-white" style={{ borderRadius: "0 0 16px 16px" }} />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="inline-block rounded-xl px-6 py-4"
            style={{ background: DEMO.panel, border: `1px solid ${DEMO.border}` }}
            whileHover={{ borderColor: DEMO.primary + "55", transition: { duration: 0.22 } }}
          >
            <p className="mb-2 text-xs font-medium text-blue-600">What the CTO gets</p>
            <p className="font-mono text-sm text-blue-700">{LANDING_SOLUTION.ctoBox}</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
