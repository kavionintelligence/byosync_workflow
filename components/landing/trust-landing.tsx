"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CameraOff,
  Check,
  Database,
  Puzzle,
  ShieldX,
  X,
} from "lucide-react";
import {
  LANDING_BEFORE_AFTER,
  LANDING_HOW_IT_WORKS,
  LANDING_PROBLEM,
} from "@/lib/landing-content";
import { GlowCard } from "@/components/landing/ui/glow-card";
import { STEP_COLORS } from "@/lib/landing-demo-theme";

const PROBLEM_ICONS = [ShieldX, CameraOff, Puzzle, Database];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-center text-[10px] font-mono uppercase tracking-[0.28em] text-blue-500/80 sm:text-xs sm:tracking-[0.32em]">
      {children}
    </p>
  );
}

export function ProblemSection() {
  return (
    <section id="problem" className="relative overflow-x-clip bg-white py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.div
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-200/80 bg-red-50 px-3 py-1 text-xs font-medium text-red-600"
          >
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
            {LANDING_PROBLEM.eyebrow}
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mx-auto mb-12 max-w-3xl text-balance text-2xl font-extrabold tracking-tight text-blue-950 sm:text-3xl md:text-4xl"
          >
            {LANDING_PROBLEM.headline}
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          {LANDING_PROBLEM.cards.map((card, i) => {
            const Icon = PROBLEM_ICONS[i] ?? ShieldX;
            return (
              <motion.article
                key={card.title}
                variants={fadeUp}
                className="group rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mb-2 text-lg font-bold text-blue-950">{card.title}</h3>
                <p className="text-sm leading-relaxed text-blue-800/90">{card.body}</p>
              </motion.article>
            );
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-10 max-w-2xl text-center text-sm font-medium text-blue-700 sm:text-base"
        >
          {LANDING_PROBLEM.bottomLine}
        </motion.p>
      </div>
    </section>
  );
}

export function TrustWorkflowSection() {
  const { steps, io, headline } = LANDING_HOW_IT_WORKS;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} id="how-it-works" className="relative overflow-x-clip bg-white py-16 sm:py-20 md:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{ background: "radial-gradient(ellipse 60% 40% at 80% 50%, rgba(37,99,235,0.05) 0%, transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
        >
          <SectionEyebrow>Workflow</SectionEyebrow>
          <motion.h2 variants={fadeUp} className="text-2xl font-extrabold tracking-tight text-blue-950 sm:text-3xl md:text-4xl">
            {headline}
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
        >
          {steps.map((step, i) => {
            const color = STEP_COLORS[i] ?? STEP_COLORS[1];
            return (
              <motion.div key={step.id} variants={fadeUp}>
                <GlowCard glowColor={`${color}12`} className="flex h-full flex-col gap-4 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                  <div className="relative z-10 flex items-center justify-between">
                    <motion.div
                      className="flex h-9 w-9 items-center justify-center rounded-xl font-mono text-sm font-bold"
                      style={{ background: `${color}15`, border: `1px solid ${color}35`, color }}
                      whileHover={{ scale: 1.1, transition: { duration: 0.18 } }}
                      aria-hidden
                    >
                      {step.id}
                    </motion.div>
                    <span
                      className="rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                      style={{ background: `${color}10`, border: `1px solid ${color}25`, color: `${color}AA` }}
                    >
                      {step.tag}
                    </span>
                  </div>
                  <div className="relative z-10">
                    <h3 className="mb-1.5 font-semibold text-blue-950">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-blue-800/90">{step.desc}</p>
                  </div>
                </GlowCard>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="mt-12"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <motion.div
            className="flex flex-col items-start gap-6 rounded-xl border border-blue-100 bg-blue-50/50 p-6 md:flex-row md:items-center"
            whileHover={{ borderColor: "rgba(37,99,235,0.25)", transition: { duration: 0.25 } }}
          >
            <div className="flex-1">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-blue-500">Input</p>
              <div className="flex flex-wrap gap-2">
                {io.input.map((item) => (
                  <span key={item} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-mono text-xs text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} aria-hidden>
              <ArrowRight size={20} className="mx-auto hidden shrink-0 text-blue-400 md:block" />
            </motion.div>
            <div className="flex-1">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-blue-500">Output</p>
              <div className="flex flex-wrap gap-2">
                {io.output.map((item) => (
                  <span key={item} className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 font-mono text-xs text-blue-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function BeforeAfterSection() {
  return (
    <section id="before-after" className="relative overflow-x-clip bg-blue-50/30 py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center text-2xl font-extrabold tracking-tight text-blue-950 sm:text-3xl"
        >
          {LANDING_BEFORE_AFTER.headline}
        </motion.h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-red-100 bg-red-50/50 p-6 sm:p-7"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-100">
                <X className="h-4 w-4 text-red-500" aria-hidden />
              </div>
              <h3 className="font-semibold text-red-700">Without ByoSync</h3>
            </div>
            <ul className="space-y-3">
              {LANDING_BEFORE_AFTER.before.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-red-900/70">
                  <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-blue-200 bg-blue-50 p-6 sm:p-7"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-100">
                <Check className="h-4 w-4 text-blue-600" aria-hidden />
              </div>
              <h3 className="font-semibold text-blue-700">With ByoSync</h3>
            </div>
            <ul className="space-y-3">
              {LANDING_AFTER_LIST()}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function LANDING_AFTER_LIST() {
  return LANDING_BEFORE_AFTER.after.map((item) => (
    <li key={item} className="flex items-start gap-2.5 text-sm text-blue-900/80">
      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" aria-hidden />
      {item}
    </li>
  ));
}
