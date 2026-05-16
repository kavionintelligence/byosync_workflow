"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Smartphone, Database, ArrowRightLeft, Lock, Zap } from 'lucide-react';

export const HowItWorks = () => {
  const [method, setMethod] = useState<'traditional' | 'byosync'>('byosync');

  return (
    <section 
      className="relative py-24 px-6 overflow-hidden"
      style={{ 
        // Applying your exact requested gradient
        background: 'linear-gradient(135deg, #003073 0%, #029797 100%)' 
      }}
    >
      {/* Dark Vignette Overlay: This prevents the "too bright" feeling 
          by darkening the edges and focus on the center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,48,115,0.7)_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 tracking-tight text-white">The Evolution of Auth</h2>
          <p className="text-cyan-100/60">See how ByoSync eliminates the vulnerabilities of legacy systems.</p>
          
          {/* Toggle Switch: Using deep navy for high contrast */}
          <div className="flex bg-[#001b3d]/60 border border-white/10 p-1 rounded-full w-fit mx-auto mt-8 backdrop-blur-md">
            <button 
              onClick={() => setMethod('traditional')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                method === 'traditional' ? 'bg-red-500/80 text-white shadow-lg' : 'text-white/40 hover:text-white'
              }`}
            >
              Traditional
            </button>
            <button 
              onClick={() => setMethod('byosync')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                method === 'byosync' ? 'bg-cyan-500 text-[#003073] shadow-lg' : 'text-white/40 hover:text-white'
              }`}
            >
              ByoSync Way
            </button>
          </div>
        </div>

        <div className="relative min-h-[420px]">
          <AnimatePresence mode="wait">
            {method === 'traditional' ? (
              <motion.div 
                key="trad"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid md:grid-cols-3 gap-8"
              >
                <StepCard 
                  icon={<Smartphone className="text-red-400" />}
                  step="01"
                  title="OTP Request"
                  desc="User waits for SMS. High latency and risk of SIM swapping."
                />
                <StepCard 
                  icon={<ArrowRightLeft className="text-red-400" />}
                  step="02"
                  title="Data Transit"
                  desc="Personal info or biometric templates sent to external servers."
                />
                <StepCard 
                  icon={<Database className="text-red-400" />}
                  step="03"
                  title="Custodial Storage"
                  desc="Your data sits in a database, becoming a target for hackers."
                  isLast
                />
              </motion.div>
            ) : (
              <motion.div 
                key="byo"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid md:grid-cols-3 gap-8"
              >
                <StepCard 
                  icon={<Lock className="text-cyan-300" />}
                  step="01"
                  title="Local Handshake"
                  desc="Authentication stays on the OS layer. No data leaves the device."
                  isBrand
                />
                <StepCard 
                  icon={<ShieldCheck className="text-cyan-300" />}
                  step="02"
                  title="Ephemeral Signals"
                  desc="One-time encrypted signals verify the user in real-time."
                  isBrand
                />
                <StepCard 
                  icon={<Zap className="text-cyan-300" />}
                  step="03"
                  title="Instant Token"
                  desc="Platform receives a trust-token. Zero sensitive data stored."
                  isLast
                  isBrand
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const StepCard = ({ icon, step, title, desc, isLast = false, isBrand = false }: any) => (
  <div className="relative group">
    {/* Darkened Glass: Uses 80% opacity navy for the base to keep text readable */}
    <div className={`p-8 rounded-3xl border transition-all group-hover:translate-y-[-4px] backdrop-blur-2xl h-full ${
      isBrand 
        ? 'border-cyan-400/30 bg-[#003073]/40 shadow-xl' 
        : 'border-white/5 bg-[#001b3d]/60'
    }`}>
      <span className={`text-[10px] font-mono mb-4 block ${isBrand ? 'text-cyan-300' : 'text-slate-500'}`}>
        PHASE_{step}
      </span>
      <div className="mb-6">{icon}</div>
      <h4 className="text-xl font-bold mb-3 text-white">{title}</h4>
      <p className="text-sm text-cyan-50/60 leading-relaxed font-sans">{desc}</p>
    </div>
    {!isLast && (
      <div className="hidden md:block absolute top-1/2 -right-4 translate-y-[-50%] z-10">
        <motion.div 
          animate={{ x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ArrowRightLeft className={`w-6 h-6 ${isBrand ? 'text-cyan-400/40' : 'text-white/10'}`} />
        </motion.div>
      </div>
    )}
  </div>
);