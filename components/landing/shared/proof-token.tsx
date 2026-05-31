"use client";

import { motion } from "framer-motion";
import { DEMO } from "@/lib/landing-demo-theme";

interface ProofTokenProps {
  label?: string;
  value?: string;
  color?: "blue" | "sky" | "warn";
  animate?: boolean;
  className?: string;
}

const colorMap = {
  blue: {
    bg: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.35)",
    text: DEMO.primary,
    glow: "rgba(37,99,235,0.2)",
  },
  sky: {
    bg: "rgba(2,132,199,0.08)",
    border: "rgba(2,132,199,0.35)",
    text: DEMO.sky,
    glow: "rgba(2,132,199,0.2)",
  },
  warn: {
    bg: "rgba(217,119,6,0.08)",
    border: "rgba(217,119,6,0.35)",
    text: DEMO.warn,
    glow: "rgba(217,119,6,0.2)",
  },
};

export function ProofToken({
  label = "proof-token",
  value = "bys_0x4a2f...",
  color = "blue",
  animate = true,
  className = "",
}: ProofTokenProps) {
  const c = colorMap[color];

  return (
    <motion.div
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs ${className}`}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        boxShadow: animate ? `0 0 16px ${c.glow}` : "none",
        color: c.text,
      }}
      animate={
        animate
          ? {
              boxShadow: [
                `0 0 8px ${c.glow}`,
                `0 0 24px ${c.glow}`,
                `0 0 8px ${c.glow}`,
              ],
            }
          : {}
      }
      transition={
        animate
          ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
          : {}
      }
      aria-label={`${label}: ${value}`}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: c.text }}
        aria-hidden
      />
      <span className="font-medium">{label}</span>
      <span style={{ color: `${c.text}80` }}>·</span>
      <span style={{ color: `${c.text}CC` }}>{value}</span>
    </motion.div>
  );
}
