"use client";

import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WaveBackground } from "./WaveBackground";
import { ScanPulse } from "@/components/landing/shared/scan-pulse";
import { LANDING_HERO } from "@/lib/landing-content";
import { DEMO } from "@/lib/landing-demo-theme";

const TrustAgentDemo = dynamic(
  () => import("@/components/landing/trust-agent-demo").then((m) => ({ default: m.TrustAgentDemo })),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[480px] w-full items-center justify-center rounded-2xl border border-blue-200 bg-white/80"
        aria-busy="true"
        aria-label="Loading demo"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" aria-hidden />
          <p className="font-mono text-xs text-blue-600">Loading Trust Agent...</p>
        </div>
      </div>
    ),
  }
);

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: `${10 + (i * 5.7) % 80}%`,
  y: `${5 + (i * 7.3) % 70}%`,
  size: 1 + (i % 3) * 0.7,
  duration: 4 + (i % 5),
  delay: (i % 4) * 0.9,
  dx: ((i % 5) - 2) * 20,
  dy: -40 - (i % 6) * 10,
}));

function AnimatedHeadline({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, li) => (
        <span key={li} className="block overflow-hidden">
          <motion.span
            className="block"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ duration: 0.72, delay: 0.22 + li * 0.14, ease: [0.16, 1, 0.3, 1] }}
          >
            {li === lines.length - 1 ? <span className="text-blue-600">{line}</span> : line}
          </motion.span>
        </span>
      ))}
    </>
  );
}

export const Hero = () => {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const ringX = useSpring(useTransform(mouseX, (v) => v * 0.015), { stiffness: 60, damping: 18 });
  const ringY = useSpring(useTransform(mouseY, (v) => v * 0.015), { stiffness: 60, damping: 18 });
  const ringX2 = useSpring(useTransform(mouseX, (v) => v * -0.022), { stiffness: 40, damping: 16 });
  const ringY2 = useSpring(useTransform(mouseY, (v) => v * -0.022), { stiffness: 40, damping: 16 });

  useEffect(() => {
    if (prefersReduced) return;
    const section = sectionRef.current;
    if (!section) return;
    const onMove = (e: MouseEvent) => {
      const r = section.getBoundingClientRect();
      mouseX.set(e.clientX - r.left - r.width / 2);
      mouseY.set(e.clientY - r.top - r.height / 3);
    };
    section.addEventListener("mousemove", onMove, { passive: true });
    return () => section.removeEventListener("mousemove", onMove);
  }, [prefersReduced, mouseX, mouseY]);

  return (
    <header
      ref={sectionRef}
      className="relative min-h-screen overflow-x-clip pb-16 pt-28 sm:pt-32 md:pt-36"
      style={{ background: "transparent" }}
      aria-labelledby="hero-heading"
    >
      <WaveBackground />

      {!prefersReduced && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-blue-400"
              style={{ left: p.x, top: p.y, width: p.size, height: p.size, opacity: 0 }}
              animate={{ y: [0, p.dy], x: [0, p.dx], opacity: [0, 0.5, 0.3, 0], scale: [1, 0.5] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeOut" }}
            />
          ))}
        </div>
      )}

      {!prefersReduced && (
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-24" aria-hidden>
          <motion.div style={{ x: ringX, y: ringY }} className="absolute flex items-center justify-center">
            {[980, 760, 540].map((size, i) => (
              <motion.div
                key={size}
                className="absolute rounded-full border border-blue-300/20"
                style={{ width: size, height: size, borderColor: `rgba(37,99,235,${0.04 + i * 0.015})` }}
                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 80 + i * 30, ease: "linear", repeat: Infinity }}
              />
            ))}
          </motion.div>
          <motion.div style={{ x: ringX2, y: ringY2 }} className="absolute flex items-center justify-center">
            <motion.div
              className="absolute rounded-full border border-blue-300/25"
              style={{ width: 360, height: 360 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 50, ease: "linear", repeat: Infinity }}
            />
          </motion.div>
          <ScanPulse size={430} color={DEMO.primary} rings={3} className="opacity-15" />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, delay: 0.08 }}>
            <Badge className="mb-8 border border-blue-200/70 bg-blue-50/90 px-3 py-1 text-xs font-medium text-blue-700 backdrop-blur-md">
              <motion.span
                className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-blue-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                aria-hidden
              />
              {LANDING_HERO.eyebrow}
            </Badge>
          </motion.div>

          <h1
            id="hero-heading"
            className="mx-auto mb-6 max-w-5xl text-balance text-[clamp(1.85rem,5vw+1rem,4.5rem)] font-extrabold leading-[1.08] tracking-tighter text-blue-950"
          >
            <AnimatedHeadline text={LANDING_HERO.headline} />
          </h1>

          <motion.p
            className="mx-auto mb-4 max-w-3xl text-balance text-base leading-relaxed text-blue-800 sm:text-lg md:text-xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.52 }}
          >
            {LANDING_HERO.subline}
          </motion.p>

          <motion.p
            className="mx-auto mb-10 max-w-xl text-balance text-sm font-medium text-blue-700/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.66 }}
          >
            {LANDING_HERO.supporting}
          </motion.p>

          <motion.div
            className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.78 }}
          >
            <Button asChild size="lg" className="h-12 rounded-xl bg-blue-600 px-8 text-white shadow-lg hover:bg-blue-700 sm:h-14">
              <a href="#waitlist">
                Join Waitlist
                <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} aria-hidden>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </motion.span>
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-xl border-blue-200 bg-white/80 text-blue-800 hover:bg-blue-50 sm:h-14">
              <a href="#how-it-works">
                <FileText className="mr-2 h-4 w-4" aria-hidden />
                See the workflow
              </a>
            </Button>
          </motion.div>

          <motion.div
            className="mx-auto mb-10 flex max-w-4xl flex-wrap justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            role="list"
            aria-label="Key features"
          >
            {LANDING_HERO.proofStrip.map((item, i) => (
              <motion.span
                key={item}
                role="listitem"
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-white/85 px-3 py-1.5 text-xs text-blue-700 shadow-sm backdrop-blur-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.92 + i * 0.05, duration: 0.4 }}
                whileHover={{ borderColor: "rgba(37,99,235,0.35)", color: "#1e40af" }}
              >
                <span className="h-1 w-1 shrink-0 rounded-full bg-blue-500" aria-hidden />
                {item}
              </motion.span>
            ))}
          </motion.div>
        </div>

        <div className="mx-auto flex max-w-6xl items-start gap-3 xl:gap-4">
          <motion.div
            className="pointer-events-none mt-14 hidden w-44 shrink-0 flex-col rounded-2xl border border-red-100 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md xl:flex"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 1.05 }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-blue-500">before</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-blue-950">
              raw PII scattered across app, DB, consent, logs
            </p>
          </motion.div>

          <motion.div
            className="animate-orbital-drift min-w-0 flex-1"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <TrustAgentDemo />
          </motion.div>

          <motion.div
            className="pointer-events-none mb-14 mt-auto hidden w-44 shrink-0 flex-col rounded-2xl border border-blue-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md xl:flex"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-blue-600">after</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-blue-950">
              vault, token, approval, revocation, proof in one runtime
            </p>
          </motion.div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
        aria-hidden
        style={{ background: "linear-gradient(to bottom, transparent 0%, white 100%)" }}
      />
    </header>
  );
};
