"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export const LogoLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-dark">
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated Outer Ring */}
        <motion.div
          className="absolute inset-0 w-24 h-24 border-2 border-brand-blue/20 rounded-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />

        {/* Rotating Logo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            repeat: Infinity, 
            duration: 2, 
            ease: "linear" 
          }}
          className="relative w-20 h-20"
        >
          <Image
            src="/logo.png"
            alt="Loading ByoSync"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-2">
          <motion.p 
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
            className="text-[10px] font-mono text-brand-blue uppercase tracking-[0.3em]"
          >
            Initializing_Handshake
          </motion.p>
          <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-brand-blue"
               animate={{ x: ["-100%", "100%"] }}
               transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
             />
          </div>
        </div>
      </div>
    </div>
  );
};