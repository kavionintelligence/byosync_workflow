"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  User,
  Mail,
  Phone,
  Link as LinkIcon,
  XCircle,
  ArrowLeft,
  Fingerprint,
  Mic,
  Lock,
  Clock,
} from "lucide-react";
import { ScanPulse } from "@/components/landing/shared/scan-pulse";
import { DEMO } from "@/lib/landing-demo-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CircuitBackground } from "./CircuitBackground";
import { LANDING_FINAL_CTA } from "@/lib/landing-content";

export const WaitlistSection = () => {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
  });
  const [demoState, setDemoState] = useState<"traditional" | "byosync">("traditional");

  useEffect(() => {
    const timer = setInterval(() => {
      setDemoState(prev => prev === 'traditional' ? 'byosync' : 'traditional');
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!formData.email || !formData.name || !formData.phone.trim()) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          linkedin: formData.linkedin.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        hint?: string;
      };
      if (!res.ok) {
        const parts = [data.error, data.hint].filter(
          (x): x is string => typeof x === "string" && x.length > 0,
        );
        setSubmitError(
          parts.length ? parts.join("\n\n") : "Something went wrong.",
        );
        setStatus("idle");
        return;
      }
      setStatus("success");
    } catch {
      setSubmitError("Network error. Check your connection and try again.");
      setStatus("idle");
    }
  };

  return (
    <section 
      className="relative overflow-x-clip px-4 py-20 sm:px-6 sm:py-28 md:py-32"
      style={{ background: 'transparent' }}
    >
      <CircuitBackground pulseCount={40} intensity={0.85} />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          
          {/* LEFT: trust benchmark phone mockup */}
          <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold tracking-tight text-blue-950">Human Trust Benchmark</h3>
              <p className="font-mono text-sm text-blue-600/80">Legacy signup friction vs sub-second live approval</p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  demoState === "traditional"
                    ? "border border-red-200 bg-red-50 text-red-600"
                    : "border border-blue-100 bg-white/80 text-blue-400"
                }`}
              >
                Old way
              </span>
              <span
                className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  demoState === "byosync"
                    ? "border border-blue-200 bg-blue-50 text-blue-700"
                    : "border border-blue-100 bg-white/80 text-blue-400"
                }`}
              >
                ByoSync
              </span>
            </div>

            <div className="relative mx-auto aspect-[280/520] w-[min(280px,88vw)] overflow-hidden rounded-[3rem] border-[8px] border-blue-100 bg-white shadow-xl shadow-blue-100/60 sm:w-[280px]">
              <div className="absolute left-1/2 top-0 z-30 h-6 w-28 -translate-x-1/2 rounded-b-2xl border-x border-b border-blue-100 bg-blue-50" />

              <AnimatePresence mode="wait">
                {demoState === "traditional" ? (
                  <motion.div
                    key="trad"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.35 }}
                    className="flex h-full flex-col overflow-y-auto px-5 pb-6 pt-14"
                  >
                    <div className="mb-4 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-red-600">
                      <XCircle className="h-3 w-3 shrink-0" aria-hidden />
                      Legacy auth · 30–90s
                    </div>

                    <div className="mb-3 rounded-xl border border-red-200 bg-red-50/80 p-3">
                      <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-red-500">1 · Register</p>
                      <div className="space-y-2">
                        {["Full name", "Email", "Phone"].map((label) => (
                          <div
                            key={label}
                            className="h-7 rounded-lg border border-red-200/80 bg-white px-2.5 py-1.5 text-[10px] text-red-400/90"
                          >
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3 rounded-xl border border-red-200 bg-red-50/60 p-3">
                      <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-red-500">2 · Login</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 rounded-lg border border-red-200/80 bg-white px-2.5 py-1.5">
                          <Mail className="h-3 w-3 text-red-400" aria-hidden />
                          <span className="text-[10px] text-red-400/90">user@company.com</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border border-red-200/80 bg-white px-2.5 py-1.5">
                          <Lock className="h-3 w-3 text-red-400" aria-hidden />
                          <span className="text-[10px] tracking-widest text-red-400/90">••••••••</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-red-300 bg-red-100/70 p-3">
                      <p className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-red-600">
                        <Clock className="h-3 w-3" aria-hidden />
                        3 · OTP · waiting
                      </p>
                      <p className="mb-2 animate-pulse text-center font-mono text-[10px] text-red-600">
                        WAITING_FOR_SMS…
                      </p>
                      <div className="flex justify-center gap-1.5">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="h-8 w-7 rounded border border-red-300 bg-white"
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-center font-mono text-[9px] text-red-500/80">
                        Resend in 0:42 · session at risk
                      </p>
                    </div>

                    <p className="mt-auto pt-3 text-center font-mono text-[9px] uppercase text-red-500/70">
                      No proof of live human intent
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="byo"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.35 }}
                    className="flex h-full flex-col items-center justify-center bg-linear-to-b from-blue-50 to-white px-5 pb-8 pt-14"
                  >
                    <div className="mb-3 flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-[10px] text-blue-700">
                      <motion.span
                        className="h-1.5 w-1.5 rounded-full bg-blue-500"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        aria-hidden
                      />
                      Live human trust · &lt;1s
                    </div>

                    <div className="relative mb-5 flex h-28 w-28 items-center justify-center">
                      <ScanPulse size={112} color={DEMO.primary} rings={3} />
                      <div className="absolute flex items-center gap-1.5">
                        <Fingerprint className="h-7 w-7 text-blue-600" aria-hidden />
                        <Mic className="h-5 w-5 text-blue-500" aria-hidden />
                      </div>
                    </div>

                    <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-blue-500">
                      Face + voice scan
                    </p>
                    <motion.p
                      className="mb-4 font-mono text-2xl font-bold tabular-nums text-blue-600"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      0.8s
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="w-full rounded-xl border border-blue-200 bg-white p-4 text-center shadow-sm"
                    >
                      <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-blue-600" aria-hidden />
                      <h4 className="text-base font-bold text-blue-950">Human trust verified</h4>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-blue-600">
                        LIVE_HUMAN_APPROVED
                      </p>
                      <p className="mt-2 text-[10px] leading-relaxed text-blue-700/80">
                        Purpose-bound · device-bound · revocable
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="mt-5 h-1 rounded-full bg-blue-500/40 shadow-[0_0_10px_rgba(37,99,235,0.35)]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: DARK CONTAINER WAITLIST */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {status !== 'success' ? (
                <motion.div 
                  key="form" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl backdrop-blur-2xl sm:p-8 md:p-12"
                >
                  <h2 className="mb-4 text-3xl font-extrabold leading-tight tracking-tighter text-blue-950 sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
                    {LANDING_FINAL_CTA.headline.split("\n").map((line, i, arr) => (
                      <span key={i} className="block">
                        {i === arr.length - 1 ? (
                          <span className="text-blue-600">{line}</span>
                        ) : (
                          line
                        )}
                      </span>
                    ))}
                  </h2>
                  <p className="mb-8 max-w-md text-base leading-relaxed text-blue-800 sm:mb-10 sm:text-lg md:text-xl">
                    {LANDING_FINAL_CTA.subline}
                  </p>
                  <p className="mb-8 text-xs text-blue-600/70">{LANDING_FINAL_CTA.legalNote}</p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {submitError && (
                      <div className="whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {submitError}
                      </div>
                    )}
                    <div className="space-y-4">
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          type="text"
                          required
                          autoComplete="name"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-14 pl-12 bg-white border-blue-200 text-blue-950 placeholder:text-blue-400 rounded-2xl focus:ring-blue-400 focus:border-blue-400/60 transition-all"
                        />
                      </div>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="Work Email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-14 pl-12 bg-white border-blue-200 text-blue-950 placeholder:text-blue-400 rounded-2xl focus:ring-blue-400 focus:border-blue-400/60 transition-all"
                        />
                      </div>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          type="tel"
                          required
                          autoComplete="tel"
                          placeholder="Contact number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="h-14 pl-12 bg-white border-blue-200 text-blue-950 placeholder:text-blue-400 rounded-2xl focus:ring-blue-400 focus:border-blue-400/60 transition-all"
                        />
                      </div>
                      <div className="relative group">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          type="text"
                          inputMode="url"
                          placeholder="LinkedIn URL (founder or company)"
                          value={formData.linkedin}
                          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                          className="h-14 pl-12 bg-white border-blue-200 text-blue-950 placeholder:text-blue-400 rounded-2xl focus:ring-blue-400 focus:border-blue-400/60 transition-all"
                        />
                      </div>
                      <p className="pl-1 text-xs leading-relaxed text-blue-600/80">
                        LinkedIn is optional. Submissions send a real email to our team (with your
                        address as <strong className="text-blue-900">Reply-To</strong> so we can
                        reach you). Optional: we also keep a copy in our database for export.
                      </p>
                    </div>
                    <Button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-bold shadow-[0_0_20px_-5px_rgba(37,99,235,0.35)] transition-all active:scale-95"
                    >
                      {status === "submitting" ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Request Early Access"
                      )}
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="success" 
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  className="rounded-[2.5rem] border border-blue-100 bg-white p-8 text-center shadow-xl sm:p-10 lg:text-left"
                >
                  <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-8 border border-blue-500/30 mx-auto lg:mx-0">
                    <CheckCircle2 className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl md:text-4xl">Request Logged</h3>
                  <p className="text-blue-800 text-lg">Welcome to the future of auth, {formData.name.split(' ')[0]}.</p>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setStatus("idle");
                      setSubmitError(null);
                    }}
                    className="mt-8 text-blue-400/70 hover:text-blue-600 hover:bg-transparent p-0"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Submit another request
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};