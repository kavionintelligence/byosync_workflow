"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  glowColor?: string;
}

export function GlowCard({
  children,
  className = "",
  style,
  glowColor = "rgba(37,99,235,0.08)",
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mouse-x", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--mouse-y", `${e.clientY - r.top}px`);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      className={`landing-glow-card ${className}`}
      style={{ "--glow-color": glowColor, ...style } as CSSProperties}
      whileHover={{ scale: 1.015, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
      whileTap={{ scale: 0.99 }}
    >
      {children}
    </motion.div>
  );
}
