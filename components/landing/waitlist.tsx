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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WaveBackground } from "./WaveBackground";
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
      <WaveBackground />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          
          {/* LEFT: DARK MOBILE MOCKUP */}
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-blue-950 tracking-tight">System Benchmark</h3>
              <p className="text-blue-500/80 text-sm font-mono">Real-time Auth Latency</p>
            </div>

            {/* Dark Glass Phone Mockup */}
            <div className="relative mx-auto aspect-[280/520] w-[min(280px,88vw)] overflow-hidden rounded-[3rem] border-[8px] border-white/10 bg-slate-950/80 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-3xl sm:w-[280px]">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-b-2xl z-30 border-x border-b border-white/5" />
              
              <AnimatePresence mode="wait">
                {demoState === 'traditional' ? (
                  <motion.div 
                    key="trad"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="p-8 pt-16 h-full flex flex-col bg-red-950/20"
                  >
                    <div className="flex items-center gap-2 text-red-500 text-[10px] font-mono mb-6 font-bold uppercase tracking-widest">
                      <XCircle className="w-3 h-3" /> Legacy OTP
                    </div>
                    <div className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-red-500/20">
                       <p className="text-[10px] text-red-400 font-mono text-center animate-pulse tracking-tighter">WAITING_FOR_SMS...</p>
                       <div className="mt-3 flex justify-center gap-2">
                         {[1,2,3,4].map(i => <div key={i} className="w-6 h-8 bg-slate-800 border border-white/5 rounded" />)}
                       </div>
                    </div>
                    <p className="text-[10px] text-white/20 mt-auto text-center uppercase">Dropped Sessions: High</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="byo"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="p-0 h-full flex flex-col relative"
                  >
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="h-full w-full bg-blue-950/25 p-8 pt-16 flex flex-col items-center justify-center"
                    >
                        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/35 shadow-[0_0_30px_-5px_rgba(37,99,235,0.35)]">
                           <CheckCircle2 className="w-12 h-12 text-blue-400" />
                        </div>
                        <h4 className="text-white font-bold text-xl mb-1">Verified</h4>
                        <p className="text-blue-300/50 text-[10px] font-mono uppercase tracking-[0.2em]">Zero_Knowledge_OK</p>
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 0.5, duration: 1 }}
                          className="h-1 bg-blue-500/50 rounded-full mt-12 w-full shadow-[0_0_10px_rgba(59,130,246,0.45)]" 
                        />
                    </motion.div>
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