"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Key, Lock, Eye, EyeOff,
  CheckCircle2, XCircle, Building2, User,
  Activity, ArrowRightLeft,
} from 'lucide-react';

type View = 'user' | 'company';

export const DeviceDemo = () => {
  const [view, setView] = useState<View>('user');

  return (
    <section
      className="relative py-24 px-6 overflow-hidden"
      style={{ background: 'transparent' }}
    >
      <div className="relative z-10 max-w-5xl mx-auto">

        {/* ── Section header ── */}
        <div className="text-center mb-16">
          <p className="text-[11px] font-mono tracking-[0.3em] uppercase text-blue-500/80 mb-4">
            PERSPECTIVE SHIFT
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-blue-950 mb-4">
            Seamless Cross-Device Trust
          </h2>
          <p className="text-blue-800 max-w-lg mx-auto text-sm">
            One handshake. Two completely different dashboards. Zero shared raw data — by design.
          </p>

          {/* Toggle pill */}
          <div className="flex bg-white border border-blue-100 p-1 rounded-full w-fit mx-auto mt-8 shadow-sm">
            <button
              onClick={() => setView('user')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                view === 'user'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-blue-600/70 hover:text-blue-950'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              User Dashboard
            </button>
            <button
              onClick={() => setView('company')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                view === 'company'
                  ? 'bg-blue-700 text-white shadow-lg'
                  : 'text-blue-600/70 hover:text-blue-950'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Company Dashboard
            </button>
          </div>
        </div>

        {/* ── Dashboard panels ── */}
        <div className="relative min-h-[480px]">
          <AnimatePresence mode="wait">
            {view === 'user' ? (
              <motion.div
                key="user"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.28 }}
              >
                <UserDashboard />
              </motion.div>
            ) : (
              <motion.div
                key="company"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28 }}
              >
                <CompanyDashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Bottom label ── */}
        <div className="flex items-center justify-center gap-3 mt-10">
          <div className="h-px w-16 bg-blue-200/60" />
          <p className="text-[10px] font-mono text-blue-500 tracking-widest uppercase">
            same verification event · different information
          </p>
          <div className="h-px w-16 bg-blue-200/60" />
        </div>

      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  USER DASHBOARD                                                      */
/* ─────────────────────────────────────────────────────────────────── */
const UserDashboard = () => (
  <div className="space-y-4">

    {/* Status bar */}
    <div className="bg-[#001b3d]/70 border border-white/10 rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
          <User className="w-4 h-4 text-cyan-300" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none mb-0.5">usr_8a2f</p>
          <p className="text-cyan-300/60 text-[10px] font-mono">Identity Vault · Enrolled</p>
        </div>
      </div>
      <div className="flex items-center gap-5 text-[10px] font-mono">
        <span className="text-cyan-100/40">4 fields encrypted</span>
        <span className="text-cyan-100/40">3 active consents</span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          KEY ON DEVICE
        </span>
      </div>
    </div>

    {/* Three dashboard cards */}
    <div className="grid md:grid-cols-3 gap-4">

      {/* ── Card 1: Vault ── */}
      <div className="bg-[#001b3d]/60 border border-cyan-400/20 rounded-2xl p-5 backdrop-blur-md group hover:-translate-y-1 transition-transform">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-cyan-300 text-[10px] font-mono uppercase tracking-widest">My Vault</h3>
        </div>
        <p className="text-[9.5px] text-cyan-100/35 font-mono mb-4">AES-256-GCM · PER-FIELD DEK</p>

        <div className="space-y-2">
          {[
            { label: 'Full Name',     enc: '4a2f…', color: 'text-blue-400 bg-blue-500/10' },
            { label: 'Date of Birth', enc: '9bc1…', color: 'text-cyan-400 bg-cyan-500/10' },
            { label: 'Address Proof', enc: 'e302…', color: 'text-emerald-400 bg-emerald-500/10' },
            { label: 'KYC Status',    enc: '7d8a…', color: 'text-amber-400 bg-amber-500/10' },
          ].map((f) => (
            <div key={f.label} className="flex items-center justify-between rounded-lg px-3 py-2 bg-white/[0.02] border border-white/5">
              <span className="text-cyan-50/60 text-xs">{f.label}</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${f.color}`}>
                {f.enc}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[9px] text-cyan-100/30 font-mono mt-4 pt-3 border-t border-white/5 leading-relaxed">
          Only you hold the master key.
          <br />ByoSync sees only ciphertext.
        </p>
      </div>

      {/* ── Card 2: Active Consents ── */}
      <div className="bg-[#001b3d]/60 border border-white/10 rounded-2xl p-5 backdrop-blur-md group hover:-translate-y-1 transition-transform">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-cyan-400" />
          <h3 className="text-cyan-300 text-[10px] font-mono uppercase tracking-widest">Active Consents</h3>
        </div>
        <p className="text-[9.5px] text-cyan-100/35 font-mono mb-4">YOU CONTROL EVERY ACCESS</p>

        <div className="space-y-2.5">
          {[
            { company: 'AcmePay', fields: 'age_over_18, kyc', dot: 'bg-emerald-400', active: true },
            { company: 'NeoBank', fields: 'address_proof',    dot: 'bg-emerald-400', active: true },
            { company: 'ZipCart', fields: 'age_over_18',      dot: 'bg-slate-600',   active: false },
          ].map((c) => (
            <div
              key={c.company}
              className={`rounded-xl p-3 flex items-center justify-between ${
                c.active
                  ? 'bg-white/[0.04] border border-white/10'
                  : 'bg-white/[0.01] border border-white/5'
              }`}
            >
              <div>
                <p className="text-white text-xs font-bold leading-none mb-1">{c.company}</p>
                <p className="text-[9.5px] text-slate-500 font-mono">{c.fields}</p>
              </div>
              <span className={`w-2 h-2 rounded-full ${c.dot}`} />
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2">
          <XCircle className="w-3 h-3" />
          Revoke AcmePay
        </button>
      </div>

      {/* ── Card 3: Audit Trail ── */}
      <div className="bg-[#001b3d]/60 border border-white/10 rounded-2xl p-5 backdrop-blur-md group hover:-translate-y-1 transition-transform">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-cyan-300 text-[10px] font-mono uppercase tracking-widest">My Audit Trail</h3>
        </div>
        <p className="text-[9.5px] text-cyan-100/35 font-mono mb-4">EVERY ACCESS · TIMESTAMPED</p>

        <div className="space-y-3">
          {[
            { event: 'AcmePay verified',   type: 'boolean', time: '14:31 IST', ok: true },
            { event: 'NeoBank verified',   type: 'boolean', time: '09:15 IST', ok: true },
            { event: 'ZipCart revoked',    type: 'revoke',  time: 'yesterday', ok: false },
            { event: 'Vault inception',    type: 'setup',   time: '03-15',     ok: true },
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                a.ok ? 'bg-emerald-500/20' : 'bg-red-500/15'
              }`}>
                {a.ok
                  ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  : <XCircle     className="w-3 h-3 text-red-400" />
                }
              </div>
              <div>
                <p className="text-cyan-50/80 text-xs font-medium leading-none mb-0.5">{a.event}</p>
                <p className="text-[9.5px] text-slate-500 font-mono">{a.type} · {a.time}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[9px] text-cyan-100/30 font-mono mt-4 pt-3 border-t border-white/5">
          You see every access. Revoke at any time.
          <br />No company can hide their activity.
        </p>
      </div>

    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────── */
/*  COMPANY DASHBOARD                                                   */
/* ─────────────────────────────────────────────────────────────────── */
const CompanyDashboard = () => (
  <div className="space-y-4">

    {/* Status bar */}
    <div className="bg-[#001b3d]/70 border border-white/10 rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-blue-300" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none mb-0.5">AcmePay × ByoSync SDK</p>
          <p className="text-blue-300/70 text-[10px] font-mono">Enterprise Portal · v2.1.4</p>
        </div>
      </div>
      <div className="flex items-center gap-5 text-[10px] font-mono">
        <span className="text-cyan-100/40">3 verifications today</span>
        <span className="text-cyan-100/40">0 PII stored</span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          API OPERATIONAL
        </span>
      </div>
    </div>

    {/* Three dashboard cards */}
    <div className="grid md:grid-cols-3 gap-4">

      {/* ── Card 1: Latest Verification ── */}
      <div className="bg-[#001b3d]/60 border border-blue-400/20 rounded-2xl p-5 backdrop-blur-md group hover:-translate-y-1 transition-transform">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
          <h3 className="text-blue-300 text-[10px] font-mono uppercase tracking-widest">Latest Verification</h3>
        </div>
        <p className="text-[9.5px] text-blue-100/40 font-mono mb-4">BOOLEAN MODE · NO PII RETURNED</p>

        <div className="space-y-2">
          {[
            { key: 'user_token',    val: 'usr_8a2f',    accent: 'text-cyan-300' },
            { key: 'mode',          val: 'boolean',     accent: 'text-slate-400' },
            { key: 'consent_id',    val: 'con_5af23e',  accent: 'text-cyan-300' },
            { key: 'age_over_18',   val: 'true  ✓',     accent: 'text-emerald-400' },
            { key: 'kyc_verified',  val: 'true  ✓',     accent: 'text-emerald-400' },
            { key: 'expires',       val: '10 min',      accent: 'text-amber-300' },
          ].map((r) => (
            <div key={r.key} className="flex items-center justify-between">
              <span className="text-slate-500 text-[10px] font-mono">{r.key}</span>
              <span className={`text-[10px] font-mono font-bold ${r.accent}`}>{r.val}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-white/5">
          <p className="text-[9px] text-blue-100/45 font-mono">
            Only signed booleans received.
            <br />Name, DOB, Aadhaar → never transmitted.
          </p>
        </div>
      </div>

      {/* ── Card 2: Signed Assertion ── */}
      <div className="bg-[#001b3d]/60 border border-white/10 rounded-2xl p-5 backdrop-blur-md group hover:-translate-y-1 transition-transform">
        <div className="flex items-center gap-2 mb-1">
          <Key className="w-4 h-4 text-cyan-400" />
          <h3 className="text-cyan-300 text-[10px] font-mono uppercase tracking-widest">Signed Assertion</h3>
        </div>
        <p className="text-[9.5px] text-cyan-100/35 font-mono mb-4">CRYPTOGRAPHIC PROOF · TAMPER-EVIDENT</p>

        <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-3 mb-3 space-y-1.5">
          {[
            ['issued_at',  '18:20 IST'],
            ['expires_at', '18:30 IST'],
            ['signed_by',  'ByoSync HSM'],
            ['sig',        '0x9af1…e302'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between">
              <span className="text-slate-500 text-[10px] font-mono">{k}</span>
              <span className="text-cyan-300 text-[10px] font-mono">{v}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-cyan-100/50 leading-relaxed">
          Store only the <span className="text-white font-semibold">assertion ID</span> and{' '}
          <span className="text-white font-semibold">signed result</span>. Discard the token.
          Assertion is non-replayable.
        </p>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
          <ArrowRightLeft className="w-3 h-3 text-blue-400/70" />
          <p className="text-[9px] text-blue-100/45 font-mono">
            Webhook fired · con_5af23e
          </p>
        </div>
      </div>

      {/* ── Card 3: Blind Spot (what they don't get) ── */}
      <div className="bg-[#001b3d]/60 border border-white/10 rounded-2xl p-5 backdrop-blur-md group hover:-translate-y-1 transition-transform">
        <div className="flex items-center gap-2 mb-1">
          <EyeOff className="w-4 h-4 text-slate-400" />
          <h3 className="text-slate-300 text-[10px] font-mono uppercase tracking-widest">Your Blind Spot</h3>
        </div>
        <p className="text-[9.5px] text-slate-400/50 font-mono mb-4">
          BYOSYNC INTENTIONALLY WITHHOLDS
        </p>

        <div className="space-y-2 mb-4">
          {[
            'Aadhaar number',
            'Face scan / raw biometric',
            'Phone number',
            'Home address',
            'Date of birth',
            'PAN card number',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <XCircle className="w-3 h-3 text-red-400/50 flex-shrink-0" />
              <span className="text-slate-500 text-xs line-through decoration-red-500/30">{item}</span>
            </div>
          ))}
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <Eye className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-[9.5px] text-emerald-300/80 font-mono leading-relaxed">
              No PII = no liability under DPDP Rules 2025.
              Your breach surface shrinks to zero for these fields.
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
);
