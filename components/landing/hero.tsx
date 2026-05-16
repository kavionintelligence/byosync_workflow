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
      className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden min-h-screen flex items-center"
      style={{ background: 'transparent' }}
    >
      <WaveBackground />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT: CONTENT */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-blue-50 border-blue-200/70 text-blue-700 py-1 px-4 text-xs font-mono backdrop-blur-md">
              PROOF OF HUMAN PRESENCE INFRASTRUCTURE
            </Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-[1.05] text-blue-950">
              The Trust Bridge <br />
              <span className="text-blue-600">Between Users and Platforms.</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-800 mb-10 max-w-xl leading-relaxed">
              Users control what they share. Platforms get the proof and data they need — with consent and logs built in.
            </p>
            <div className="flex gap-4 items-center">
              <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 h-14 px-10 text-lg rounded-xl shadow-xl transition-transform active:scale-95">
                Join Waitlist
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          {/* RIGHT: THE STABLE DEVICE CONTAINER */}
          <div className="relative flex justify-center items-center h-[500px] w-full">
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
                  <div className="w-[260px] h-[520px] bg-slate-900/95 backdrop-blur-2xl rounded-[3rem] border-[8px] border-slate-800 shadow-2xl relative p-6 flex flex-col items-center">
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
                      <div className="h-full flex flex-col items-center justify-center p-8">
                         <div className="bg-blue-500/10 border border-blue-400/20 p-6 rounded-2xl flex items-center gap-6">
                            <Laptop className="w-12 h-12 text-blue-400" />
                            <div className="space-y-1">
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