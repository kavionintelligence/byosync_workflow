"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  Briefcase, 
  Landmark, 
  ShieldCheck, 
  Fingerprint, 
  CheckCircle 
} from 'lucide-react';

const APPS = [
  {
    name: "FinPay",
    icon: <CreditCard className="w-6 h-6 text-emerald-400" />,
    color: "bg-emerald-500/10",
    action: "Verifying Transaction...",
    amount: "₹1,450.00"
  },
  {
    name: "WorkSync",
    icon: <Briefcase className="w-6 h-6 text-blue-400" />,
    color: "bg-blue-500/10",
    action: "Accessing Enterprise Vault...",
    amount: "Internal Access"
  },
  {
    name: "GovPortal",
    icon: <Landmark className="w-6 h-6 text-orange-400" />,
    color: "bg-orange-500/10",
    action: "Digital Identity Check...",
    amount: "e-KYC Verified"
  }
];

export const AppSyncDemo = () => {
  const [appIndex, setAppIndex] = useState(0);
  const [status, setStatus] = useState<'locking' | 'scanning' | 'success'>('locking');

  useEffect(() => {
    const cycle = setInterval(() => {
      setStatus('scanning');
      setTimeout(() => setStatus('success'), 1200);
      setTimeout(() => {
        setStatus('locking');
        setAppIndex((prev) => (prev + 1) % APPS.length);
      }, 3000);
    }, 4000);
    return () => clearInterval(cycle);
  }, []);

  const currentApp = APPS[appIndex];

  return (
    <section className="py-24 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-16">
        
        {/* Left Side: Content */}
        <div className="flex-1 space-y-6">
          <h2 className="text-4xl font-bold tracking-tight leading-tight">
            One Handshake. <br />
            <span className="text-brand-blue">Universal Access.</span>
          </h2>
          <p className="text-slate-400 font-sans leading-relaxed">
            ByoSync sits at the OS layer. Once you're verified, your favorite apps 
            handshake with the infrastructure to authorize you instantly. 
            No more re-entering credentials for every service.
          </p>
          <div className="space-y-3">
            {APPS.map((app, i) => (
              <div key={app.name} className={`flex items-center gap-3 transition-opacity duration-500 ${i === appIndex ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`p-2 rounded-lg ${app.color}`}>{app.icon}</div>
                <span className="text-sm font-semibold">{app.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: The Phone UI */}
        <div className="relative">
          {/* External Phone Frame */}
          <div className="w-[280px] h-[580px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* Status Bar */}
            <div className="h-12 w-full flex items-end justify-between px-8 pb-2 text-[10px] font-bold text-slate-500">
              <span>9:41</span>
              <div className="flex gap-1 items-center">
                <div className="w-4 h-2 rounded-sm bg-slate-700" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={currentApp.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex-1 flex flex-col p-6"
              >
                {/* App Interface Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className={`p-3 rounded-xl ${currentApp.color}`}>
                    {currentApp.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-none">{currentApp.name}</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Secured by ByoSync</p>
                  </div>
                </div>

                {/* Main Interaction Area */}
                <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                  
                  <AnimatePresence mode="wait">
                    {status === 'scanning' ? (
                      <motion.div 
                        key="scanning"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center"
                      >
                        <div className="relative mb-6">
                           <Fingerprint className="w-16 h-16 text-brand-blue" />
                           <motion.div 
                             className="absolute inset-0 bg-brand-blue/20 rounded-full"
                             animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                             transition={{ duration: 1.5, repeat: Infinity }}
                           />
                        </div>
                        <p className="text-xs font-mono text-brand-blue animate-pulse">OS_HANDSHAKE_INIT...</p>
                      </motion.div>
                    ) : status === 'success' ? (
                      <motion.div 
                        key="success"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center"
                      >
                        <CheckCircle className="w-16 h-16 text-emerald-400 mb-4" />
                        <h4 className="text-lg font-bold text-white">{currentApp.amount}</h4>
                        <p className="text-[10px] text-emerald-400 font-mono mt-1 uppercase tracking-widest">Authorized</p>
                      </motion.div>
                    ) : (
                      <motion.div key="locking" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <p className="text-slate-500 text-xs">Waiting for Bio-Trigger</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Footer Detail */}
                <div className="mt-8 pt-6 border-t border-white/5">
                   <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-brand-blue" 
                        initial={{ width: "0%" }}
                        animate={{ width: status === 'success' ? '100%' : '0%' }}
                      />
                   </div>
                   <p className="text-[9px] text-slate-600 mt-2 text-center uppercase tracking-tighter">Zero-Data Verification Protocol</p>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>
    </section>
  );
};