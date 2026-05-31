"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { DEMO } from "@/lib/landing-demo-theme";

interface TrustScoreProps {
  score: number;
  label?: string;
  showDelta?: boolean;
  delta?: number;
}

export function TrustScore({ score, label = "Trust Score", showDelta, delta }: TrustScoreProps) {
  const springScore = useSpring(0, { stiffness: 80, damping: 20 });

  useEffect(() => {
    springScore.set(score);
  }, [score, springScore]);

  const circumference = 2 * Math.PI * 36;
  const strokeDash = useTransform(springScore, [0, 100], [0, circumference]);
  const strokeDashoffset = useTransform(strokeDash, (v) => circumference - v);

  const color = score >= 70 ? DEMO.primary : score >= 40 ? DEMO.warn : DEMO.risk;
  const bgColor =
    score >= 70 ? "rgba(219,234,254,0.5)" : score >= 40 ? "rgba(254,243,199,0.4)" : "rgba(254,226,226,0.4)";

  return (
    <div
      className="flex flex-col items-center gap-3 rounded-xl p-5"
      style={{ background: bgColor, border: `1px solid ${color}30` }}
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label}: ${score} out of 100`}
    >
      <p className="text-xs font-medium text-blue-600">{label}</p>

      <div className="relative" style={{ width: 88, height: 88 }} aria-hidden>
        <svg width="88" height="88" viewBox="0 0 88 88" className="absolute inset-0 -rotate-90">
          <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(37,99,235,0.08)" strokeWidth="6" />
          <motion.circle
            cx="44"
            cy="44"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span className="text-2xl font-bold" style={{ color }}>
            {Math.round(score)}
          </motion.span>
        </div>
        <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 24px ${color}30` }} />
      </div>

      {showDelta && delta !== undefined && (
        <motion.div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{
            background: delta > 0 ? "rgba(37,99,235,0.08)" : "rgba(254,226,226,0.5)",
            border: delta > 0 ? `1px solid ${DEMO.border}` : "1px solid rgba(239,68,68,0.25)",
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <span className="font-mono text-xs font-semibold" style={{ color: delta > 0 ? DEMO.primary : DEMO.risk }}>
            {delta > 0 ? "+" : ""}
            {delta} pts
          </span>
        </motion.div>
      )}
    </div>
  );
}
