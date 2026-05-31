"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GitPullRequest, Package, Database, Key, Webhook, FileText, CheckCircle } from "lucide-react";
import { DEMO } from "@/lib/landing-demo-theme";

const STEPS = [
  { icon: GitPullRequest, label: "PR generated", desc: "trust-runtime-integration", color: DEMO.warn },
  { icon: Package, label: "SDK inserted", desc: "byosync-sdk@2.1.0", color: DEMO.primary },
  { icon: Database, label: "Vault route added", desc: "/api/vault/store", color: DEMO.primary },
  { icon: Key, label: "Proof-token endpoint", desc: "/api/proof/generate", color: DEMO.sky },
  { icon: Webhook, label: "Revoke webhook", desc: "POST /webhook/revoke", color: DEMO.primaryDark },
  { icon: FileText, label: "Audit events enabled", desc: "event-stream active", color: DEMO.primary },
];

interface ImplementationTimelineProps {
  progress: number;
}

export function ImplementationTimeline({ progress }: ImplementationTimelineProps) {
  const visibleSteps = Math.min(progress, STEPS.length);

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: DEMO.panel, border: `1px solid ${DEMO.border}` }}
      aria-label="Implementation progress"
      role="region"
    >
      <div className="mb-3 flex items-center justify-between border-b pb-3" style={{ borderColor: DEMO.borderLight }}>
        <p className="font-mono text-xs font-semibold text-blue-950">Implementation</p>
        <span className="font-mono text-xs" style={{ color: DEMO.primary }}>
          {visibleSteps}/{STEPS.length} complete
        </span>
      </div>

      <div className="space-y-2" role="list">
        <AnimatePresence>
          {STEPS.slice(0, visibleSteps).map((step, i) => {
            const Icon = step.icon;
            const isDone = i < visibleSteps - 1;
            const isCurrent = i === visibleSteps - 1;
            return (
              <motion.div
                key={step.label}
                role="listitem"
                className="flex items-center gap-3 rounded-lg px-2.5 py-2"
                style={{
                  background: isCurrent ? `${step.color}0A` : "transparent",
                  border: isCurrent ? `1px solid ${step.color}25` : "1px solid transparent",
                }}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: isDone ? "rgba(37,99,235,0.1)" : `${step.color}12`,
                    border: isDone ? `1px solid ${DEMO.border}` : `1px solid ${step.color}30`,
                  }}
                  aria-hidden
                >
                  {isDone ? (
                    <CheckCircle size={11} style={{ color: DEMO.primary }} />
                  ) : (
                    <Icon size={11} style={{ color: step.color }} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs font-medium" style={{ color: isDone ? DEMO.muted : step.color }}>
                    {step.label}
                  </p>
                  <p className="truncate font-mono text-[10px] text-blue-600">{step.desc}</p>
                </div>
                {isCurrent && (
                  <motion.div
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: step.color }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    aria-hidden
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div
        className="mt-3 h-1 overflow-hidden rounded-full"
        style={{ background: "rgba(37,99,235,0.1)" }}
        role="progressbar"
        aria-valuenow={Math.round((visibleSteps / STEPS.length) * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${DEMO.primary} 0%, ${DEMO.primaryLight} 100%)`,
            boxShadow: "0 0 8px rgba(37,99,235,0.35)",
          }}
          animate={{ width: `${(visibleSteps / STEPS.length) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
