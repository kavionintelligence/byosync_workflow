"use client";

import { motion } from "framer-motion";
import { DEMO } from "@/lib/landing-demo-theme";

interface ScanPulseProps {
  size?: number;
  color?: string;
  rings?: number;
  className?: string;
}

export function ScanPulse({
  size = 80,
  color = DEMO.primary,
  rings = 3,
  className = "",
}: ScanPulseProps) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {Array.from({ length: rings }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: size * (0.4 + i * 0.25),
            height: size * (0.4 + i * 0.25),
            borderColor: color,
            borderWidth: 1,
          }}
          animate={{
            scale: [1, 1.6 + i * 0.2],
            opacity: [0.7 - i * 0.15, 0],
          }}
          transition={{
            duration: 2.4,
            ease: "easeOut",
            repeat: Infinity,
            delay: i * 0.5,
            repeatDelay: 0.3,
          }}
        />
      ))}
      <div
        className="relative z-10 rounded-full"
        style={{
          width: size * 0.32,
          height: size * 0.32,
          background: `radial-gradient(circle, ${color}60 0%, ${color}20 100%)`,
          border: `1px solid ${color}80`,
        }}
      />
    </div>
  );
}
