"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DEMO } from "@/lib/landing-demo-theme";

const DB_NODES = [
  { id: "users", label: "users", fields: ["id", "name", "aadhaar*", "pan*", "phone*"], risk: true },
  { id: "orders", label: "orders", fields: ["id", "user_id", "amount", "status"], risk: false },
  { id: "kyc", label: "kyc_docs", fields: ["user_id", "doc_path*", "selfie*", "raw_ocr*"], risk: true },
  { id: "logs", label: "access_logs", fields: ["event", "user_id", "ts"], risk: false },
];

interface DatabaseMapProps {
  scanning: boolean;
  highlightRisks: boolean;
}

export function DatabaseMap({ scanning, highlightRisks }: DatabaseMapProps) {
  return (
    <div
      className="relative min-h-[220px] overflow-hidden rounded-xl p-4"
      style={{ background: DEMO.panel, border: `1px solid ${DEMO.border}` }}
      aria-label="Database architecture map"
    >
      <p className="mb-3 font-mono text-xs text-blue-600">Database schema</p>

      <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ top: "2.5rem" }} aria-hidden>
        <line x1="35%" y1="28%" x2="65%" y2="28%" stroke={DEMO.borderLight} strokeWidth="1" strokeDasharray="4 3" />
        <line x1="35%" y1="72%" x2="65%" y2="72%" stroke={DEMO.borderLight} strokeWidth="1" strokeDasharray="4 3" />
        <line x1="35%" y1="28%" x2="35%" y2="72%" stroke={DEMO.borderLight} strokeWidth="1" strokeDasharray="4 3" />
        <line x1="65%" y1="28%" x2="65%" y2="72%" stroke={DEMO.borderLight} strokeWidth="1" strokeDasharray="4 3" />
      </svg>

      <div className="mt-1 grid grid-cols-2 gap-3" role="list">
        <AnimatePresence>
          {DB_NODES.map((node, i) => {
            const isRisk = node.risk && highlightRisks;
            return (
              <motion.div
                key={node.id}
                role="listitem"
                className="rounded-lg p-2.5"
                style={{
                  background: isRisk ? "rgba(254,226,226,0.6)" : DEMO.panelMuted,
                  border: isRisk ? "1px solid rgba(239,68,68,0.35)" : `1px solid ${DEMO.borderLight}`,
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  ...(isRisk && scanning
                    ? {
                        boxShadow: [
                          "0 0 0px rgba(239,68,68,0)",
                          "0 0 12px rgba(239,68,68,0.25)",
                          "0 0 0px rgba(239,68,68,0)",
                        ],
                      }
                    : {}),
                }}
                transition={{
                  duration: 0.35,
                  delay: i * 0.15,
                  ...(isRisk && scanning ? { boxShadow: { duration: 2, repeat: Infinity } } : {}),
                }}
              >
                <p className="mb-1.5 font-mono text-xs font-semibold" style={{ color: isRisk ? DEMO.risk : DEMO.primary }}>
                  {node.label}
                </p>
                <div className="space-y-0.5">
                  {node.fields.map((f) => (
                    <p
                      key={f}
                      className="font-mono text-[10px]"
                      style={{
                        color: f.endsWith("*") ? (isRisk ? "#ef4444" : DEMO.warn) : `${DEMO.muted}AA`,
                      }}
                    >
                      {f.replace("*", "")}
                      {f.endsWith("*") && (
                        <span style={{ color: DEMO.risk }} aria-label="PII field">
                          {" "}
                          ★
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {highlightRisks && (
        <motion.p
          className="mt-3 text-center font-mono text-[10px]"
          style={{ color: DEMO.risk }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ★ = raw PII stored at partner (high exposure)
        </motion.p>
      )}
    </div>
  );
}
