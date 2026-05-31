"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { canUseWebGL, prefersReducedMotion } from "@/lib/webgl-support";

const TrustNucleusCanvas = dynamic(
  () => import("./trust-nucleus-canvas").then((m) => ({ default: m.TrustNucleusCanvas })),
  { ssr: false, loading: () => null }
);

export function usePremium3dEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setEnabled(canUseWebGL() && !prefersReducedMotion());
  }, []);
  return enabled;
}

interface HeroTrustNucleusProps {
  mouse: { x: number; y: number };
}

/** Single hero WebGL layer — vault core, proof orbits, wave field, bloom */
export function HeroTrustNucleus({ mouse }: HeroTrustNucleusProps) {
  const enabled = usePremium3dEnabled();
  if (!enabled) return null;

  return (
    <TrustNucleusCanvas
      mouse={mouse}
      className="pointer-events-none absolute inset-0 z-[2] h-full min-h-[520px] w-full opacity-[0.92]"
    />
  );
}
