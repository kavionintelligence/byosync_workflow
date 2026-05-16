"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Smartphone, Cpu } from 'lucide-react';
import React from "react";

const FEATURE_DATA = [
  { icon: <ShieldCheck />, title: "Privacy First", desc: "Zero-data-sharing architecture." },
  { icon: <Smartphone />, title: "Hardware Free", desc: "Runs on any smartphone OS." },
  { icon: <Cpu />, title: "OS Layer", desc: "Foundational trust layer integration." },
];

export const Features = () => {
  return (
    <section 
      className="relative py-24 px-6 overflow-hidden"
      style={{ background: 'transparent' }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 h-10">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center text-xs font-mono uppercase tracking-[0.3em] text-blue-500/80 mb-0"
        >
          Foundational Trust Layer for Digital Bharat
        </motion.p>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {FEATURE_DATA.map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="group relative p-8 rounded-[2rem] bg-white border border-blue-100 backdrop-blur-2xl shadow-md hover:shadow-xl transition-shadow"
          >
            {/* Interactive Gradient Glow on Hover */}
            <div className="absolute inset-0 rounded-[2rem] bg-linear-to-br from-blue-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center mb-8 text-blue-600 group-hover:scale-110 transition-transform duration-300">
              {React.cloneElement(f.icon as React.ReactElement<any>, { size: 28 })}
            </div>

            <h3 className="text-2xl font-bold mb-4 text-blue-950 tracking-tight">{f.title}</h3>
            <p className="text-blue-800 text-sm leading-relaxed font-sans">
              {f.desc}
            </p>

            {/* Subtle bottom accent line */}
            <div className="absolute bottom-6 left-8 right-8 h-px bg-linear-to-r from-blue-400/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};