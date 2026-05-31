"use client";

import { motion } from "framer-motion";
import { ScanPulse } from "@/components/landing/shared/scan-pulse";
import { Shield, Eye, Clock, Database, Webhook } from "lucide-react";
import { DEMO } from "@/lib/landing-demo-theme";

interface ConsentApprovalCardProps {
  phase: "request" | "scanning" | "approved";
}

const CONSENT_DETAILS = [
  { icon: Shield, label: "Purpose", value: "SDK/API integration plan" },
  { icon: Database, label: "Data moved to vault", value: "aadhaar · pan · phone · selfie" },
  { icon: Eye, label: "APIs added", value: "vault-route · proof-token · revoke" },
  { icon: Clock, label: "Expiry", value: "30 days · renewable" },
  { icon: Webhook, label: "Revoke webhook", value: "partner-webhook.byosync.in" },
];

export function ConsentApprovalCard({ phase }: ConsentApprovalCardProps) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: DEMO.panel,
        border: phase === "approved" ? `1px solid ${DEMO.primary}66` : "1px solid rgba(217,119,6,0.3)",
        boxShadow: phase === "approved" ? "0 0 32px rgba(37,99,235,0.1)" : "0 0 32px rgba(217,119,6,0.06)",
      }}
      role="region"
      aria-label="Consent approval request"
    >
      <div className="mb-4 flex items-start justify-between border-b pb-4" style={{ borderColor: DEMO.borderLight }}>
        <div>
          <p className="mb-1 text-sm font-semibold text-blue-950">Approve ByoSync SDK/API plan?</p>
          <p className="font-mono text-xs text-blue-600">Requested by Trust Integration Agent</p>
        </div>
        {phase === "scanning" && <ScanPulse size={36} color={DEMO.warn} rings={2} />}
        {phase === "approved" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{ background: "rgba(37,99,235,0.08)", border: `1px solid ${DEMO.border}` }}
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: DEMO.primary }}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              aria-hidden
            />
            <span className="font-mono text-xs" style={{ color: DEMO.primary }}>
              approved
            </span>
          </motion.div>
        )}
      </div>

      <div className="mb-4 space-y-2.5">
        {CONSENT_DETAILS.map(({ icon: Icon, label, value }, i) => (
          <motion.div
            key={label}
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Icon size={12} style={{ color: DEMO.muted, flexShrink: 0 }} aria-hidden />
            <span className="min-w-[120px] text-xs text-blue-600">{label}</span>
            <span className="truncate font-mono text-xs text-blue-900/80">{value}</span>
          </motion.div>
        ))}
      </div>

      {phase === "scanning" && (
        <motion.div
          className="rounded-lg p-3 text-center"
          style={{ background: "rgba(254,243,199,0.4)", border: "1px solid rgba(217,119,6,0.25)" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-2 flex justify-center">
            <ScanPulse size={48} color={DEMO.warn} rings={3} />
          </div>
          <p className="font-mono text-xs" style={{ color: DEMO.warn }}>
            Verifying live human presence...
          </p>
          <p className="mt-1 text-[10px] text-blue-600">Face · voice · device binding</p>
        </motion.div>
      )}

      {phase === "approved" && (
        <motion.div
          className="rounded-lg p-3 text-center"
          style={{ background: "rgba(219,234,254,0.5)", border: `1px solid ${DEMO.borderLight}` }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <p className="font-mono text-sm font-semibold" style={{ color: DEMO.primary }}>
            Live human approved
          </p>
          <p className="mt-1 text-[10px] text-blue-600">Purpose-bound · expires 2026-06-30 · revocable</p>
        </motion.div>
      )}

      {phase === "request" && (
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 cursor-pointer rounded-lg py-2 font-mono text-xs font-semibold transition-all duration-200"
            style={{
              background: "rgba(37,99,235,0.08)",
              border: `1px solid ${DEMO.border}`,
              color: DEMO.primary,
            }}
          >
            Review & Approve
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-lg px-4 py-2 font-mono text-xs"
            style={{
              background: "rgba(100,116,139,0.08)",
              border: "1px solid rgba(100,116,139,0.15)",
              color: DEMO.muted,
            }}
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
}
