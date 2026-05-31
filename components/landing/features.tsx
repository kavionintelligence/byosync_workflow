"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Smartphone, Cpu } from 'lucide-react';
import React from "react";

const FEATURE_DATA = [
  { icon: <ShieldCheck />, title: "Vault + tokens", desc: "Private vault · tokenized access · less raw PII at partners." },
  { icon: <Smartphone />, title: "Live human approval", desc: "Face + voice + device-bound intent — not a checkbox." },
  { icon: <Cpu />, title: "Proof + revoke", desc: "Purpose-bound proof tokens, webhooks, and audit evidence." },
];

export const Features = () => {
  return (
    <section 
      className="relative overflow-x-clip py-16 md:py-24"
      style={{ background: 'transparent' }}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-0 text-center text-[10px] font-mono uppercase tracking-[0.25em] text-blue-500/80 sm:text-xs sm:tracking-[0.3em]"
        >
          Foundational trust stack for digital Bharat
        </motion.p>
      </div>

      <div className="relative z-10 mx-auto mt-8 grid max-w-7xl grid-cols-1 gap-6 px-4 sm:mt-10 sm:px-6 md:grid-cols-3 md:gap-8">
        {FEATURE_DATA.map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="group relative rounded-3xl border border-blue-100 bg-white p-6 shadow-md backdrop-blur-2xl transition-shadow hover:shadow-xl sm:rounded-[2rem] sm:p-8"
          >
            {/* Interactive Gradient Glow on Hover */}
            <div className="absolute inset-0 rounded-[2rem] bg-linear-to-br from-blue-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center mb-8 text-blue-600 group-hover:scale-110 transition-transform duration-300">
              {React.cloneElement(f.icon as React.ReactElement<any>, { size: 28 })}
            </div>

            <h3 className="mb-3 text-xl font-bold tracking-tight text-blue-950 sm:mb-4 sm:text-2xl">{f.title}</h3>
            <p className="text-blue-800 text-sm leading-relaxed font-sans">
              {f.desc}
            </p>

            {/* Subtle bottom accent line */}
            <div className="absolute bottom-4 left-6 right-6 h-px origin-left scale-x-0 bg-linear-to-r from-blue-400/50 to-transparent transition-transform duration-500 group-hover:scale-x-100 sm:bottom-6 sm:left-8 sm:right-8" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};