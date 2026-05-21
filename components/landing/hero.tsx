"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Smartphone, Fingerprint, Laptop, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WaveBackground } from "./WaveBackground";

export const Hero = () => {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');

  useEffect(() => {
    const interval = setInterval(() => {
      setDevice((prev) => (prev === 'mobile' ? 'desktop' : 'mobile'));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header 
      className="relative flex min-h-screen items-center overflow-x-clip px-4 pb-16 pt-28 sm:px-6 sm:pt-32 md:min-h-0 md:pb-24 md:pt-40 lg:pt-48"
      style={{ background: 'transparent' }}
    >
      <WaveBackground />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          
          {/* LEFT: CONTENT */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-4 border border-blue-200/70 bg-blue-50 px-3 py-1 text-[10px] font-mono text-blue-700 backdrop-blur-md sm:mb-6 sm:px-4 sm:text-xs">
              PROOF OF HUMAN PRESENCE INFRASTRUCTURE
            </Badge>
            <h1 className="mb-4 text-[clamp(1.85rem,5vw+1rem,4.5rem)] font-extrabold leading-[1.08] tracking-tighter text-blue-950 sm:mb-6">
              Your identity. Your data. <br />
              <span className="text-blue-600">Your control.</span>
            </h1>
            <p className="mb-8 max-w-xl text-base leading-relaxed text-blue-800 sm:mb-10 sm:text-lg md:text-xl">
              Users control what they share. Platforms get the proof and data they need — with consent and logs built in.
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Button size="lg" className="h-12 rounded-xl bg-blue-600 px-8 text-base text-white shadow-xl hover:bg-blue-700 active:scale-95 sm:h-14 sm:px-10 sm:text-lg">
                Join Waitlist
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </motion.div>

          {/* RIGHT: THE STABLE DEVICE CONTAINER */}
          <div className="relative flex h-[min(520px,72vw)] w-full min-h-[280px] items-center justify-center sm:h-[480px] md:h-[500px]">
            <AnimatePresence mode="wait">
              {device === 'mobile' ? (
                <motion.div 
                  key="mobile" 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: -20, scale: 0.95 }} 
                  transition={{ duration: 0.5 }}
                  className="absolute"
                >
                  {/* MOBILE MOCKUP */}
                  <div className="relative flex h-[min(520px,85vw)] w-[min(260px,78vw)] scale-90 flex-col items-center rounded-[3rem] border-[6px] border-slate-800 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-2xl sm:scale-100 sm:border-[8px] sm:p-6">
                    <div className="w-20 h-6 bg-slate-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl" />
                    <div className="mt-12 w-full space-y-6">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-blue-300 uppercase tracking-widest">
                        <Smartphone className="w-3 h-3" /> Secure_Vault
                      </div>
                      <div className="h-28 w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                         <Fingerprint className="w-10 h-10 text-blue-300 animate-pulse" />
                         <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2, repeat: Infinity }} className="h-full bg-blue-400" />
                         </div>
                      </div>
                      <div className="flex justify-center pt-4">
                         <CheckCircle2 className="w-16 h-16 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
                      </div>
                      <p className="text-center text-[10px] text-slate-400 font-mono uppercase tracking-[0.2em]">Auth Verified</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="desktop" 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: -20, scale: 0.95 }} 
                  transition={{ duration: 0.5 }}
                  className="absolute w-full max-w-[500px]"
                >
                  {/* LAPTOP MOCKUP */}
                  <div className="relative group">
                    {/* Screen */}
                    <div className="relative w-full aspect-[16/10] bg-slate-950 rounded-t-xl border-[6px] border-slate-800 overflow-hidden shadow-2xl backdrop-blur-xl bg-opacity-90">
                      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <div className="flex gap-1.5">
                           <div className="w-2 h-2 rounded-full bg-red-500/50" />
                           <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                           <div className="w-2 h-2 rounded-full bg-green-500/50" />
                        </div>
                        <div className="text-[9px] font-mono text-slate-500">byosync_cloud_portal.exe</div>
                      </div>
                    <div className="flex flex-col items-center justify-center p-4 sm:p-8 md:flex-row md:items-center md:gap-6">
                         <div className="flex flex-col items-center gap-4 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4 sm:flex-row sm:gap-6 sm:p-6">
                            <Laptop className="h-10 w-10 text-blue-400 sm:h-12 sm:w-12" />
                            <div className="space-y-1 text-center sm:text-left">
                               <p className="text-sm font-bold text-white">Trust Link Established</p>
                               <p className="text-[10px] text-slate-500 font-mono">NODE: BYO-LAPTOP-01</p>
                            </div>
                         </div>
                      </div>
                    </div>
                    {/* Keyboard Base */}
                    <div className="relative h-4 w-[110%] -left-[5%] bg-slate-800 rounded-b-xl shadow-xl border-t border-white/10" />
                    <div className="relative h-2 w-[30%] mx-auto bg-slate-900 rounded-b-xl" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </header>
  );
};