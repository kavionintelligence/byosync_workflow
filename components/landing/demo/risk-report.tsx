"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { DEMO } from "@/lib/landing-demo-theme";

export interface RiskItem {
  label: string;
  value: string;
  severity: "high" | "medium" | "low" | "ok";
}

interface RiskReportProps {
  items: RiskItem[];
  phase: "before" | "after";
  title?: string;
}

const severityStyle = {
  high: { bg: "rgba(254,226,226,0.5)", border: "rgba(239,68,68,0.35)", text: DEMO.risk, icon: AlertTriangle },
  medium: { bg: "rgba(254,243,199,0.5)", border: "rgba(217,119,6,0.3)", text: DEMO.warn, icon: AlertTriangle },
  low: { bg: "rgba(254,249,195,0.4)", border: "rgba(234,179,8,0.25)", text: "#ca8a04", icon: AlertTriangle },
  ok: { bg: "rgba(219,234,254,0.6)", border: "rgba(37,99,235,0.3)", text: DEMO.primary, icon: CheckCircle },
};

export function RiskReport({ items, phase, title = "Risk Report" }: RiskReportProps) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: DEMO.panel, border: `1px solid ${DEMO.border}` }}
      aria-label={`${title} - ${phase} ByoSync`}
    >
      <div className="mb-3 flex items-center justify-between border-b pb-3" style={{ borderColor: DEMO.borderLight }}>
        <p className="font-mono text-xs font-semibold text-blue-950">{title}</p>
        <span
          className="rounded-full px-2 py-0.5 font-mono text-[10px]"
          style={{
            background: phase === "after" ? "rgba(37,99,235,0.08)" : "rgba(254,226,226,0.6)",
            border: phase === "after" ? `1px solid ${DEMO.border}` : "1px solid rgba(239,68,68,0.3)",
            color: phase === "after" ? DEMO.primary : DEMO.risk,
          }}
        >
          {phase === "after" ? "improved" : "baseline"}
        </span>
      </div>

      <div className="space-y-2" role="list">
        <AnimatePresence mode="wait">
          {items.map((item, i) => {
            const style = severityStyle[item.severity];
            const Icon = style.icon;
            return (
              <motion.div
                key={`${item.label}-${phase}`}
                role="listitem"
                className="flex items-center justify-between rounded-lg px-3 py-2"
                style={{ background: style.bg, border: `1px solid ${style.border}` }}
                initial={{ opacity: 0, x: phase === "after" ? 12 : -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <Icon size={11} style={{ color: style.text, flexShrink: 0 }} aria-hidden />
                  <span className="font-mono text-xs text-blue-900/80">{item.label}</span>
                </div>
                <span className="font-mono text-xs font-semibold" style={{ color: style.text }}>
                  {item.value}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
