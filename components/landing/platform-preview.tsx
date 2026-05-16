"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import {
  Lock, User, Building2, Activity, CheckCircle2, XCircle,
  Bell, Settings, BarChart3, Fingerprint, Eye,
  Clock, Shield, Key, RefreshCw, Webhook,
  ChevronLeft, ChevronRight,
} from "lucide-react";

// ── Screen metadata ────────────────────────────────────────────────────────────
type Perspective = "user" | "company";
interface ScreenMeta {
  perspective: Perspective;
  badge: string;
  color: string;
  num: string;
  title: string;
  desc: string;
  highlights: string[];
}

const SCREENS: ScreenMeta[] = [
  {
    perspective: "user",
    badge: "USER VAULT",
    color: "#2563EB",
    num: "01 / 06",
    title: "Identity Vault",
    desc: "Every ByoSync user gets an encrypted on-device vault. Each field has its own AES-256-GCM key — the master key never leaves their device.",
    highlights: [
      "Per-field AES-256-GCM encryption",
      "Master key stored on-device only",
      "ByoSync servers hold zero plaintext",
    ],
  },
  {
    perspective: "company",
    badge: "PARTNER PORTAL",
    color: "#1D4ED8",
    num: "02 / 06",
    title: "Verification Hub",
    desc: "Your real-time command centre. Monitor every verification, latency, webhook delivery, and success rate — all without touching any PII.",
    highlights: [
      "Live boolean-proof verification feed",
      "P50 / P95 latency monitoring",
      "Zero PII stored in your systems",
    ],
  },
  {
    perspective: "user",
    badge: "USER VAULT",
    color: "#2563EB",
    num: "03 / 06",
    title: "Consent Manager",
    desc: "A full auditable record of every company with access — what fields, what expiry — and a one-tap revoke button. Users stay in complete control.",
    highlights: [
      "Per-company, per-field consent granularity",
      "One-tap revocation with instant effect",
      "Full history of revoked and expired consents",
    ],
  },
  {
    perspective: "company",
    badge: "PARTNER PORTAL",
    color: "#1D4ED8",
    num: "04 / 06",
    title: "Consent Analytics",
    desc: "Understand your verification funnel from request to proof. Optimise field combinations and reduce drop-off to maximise conversion.",
    highlights: [
      "Approval rate by field combination",
      "Time-to-consent latency distribution",
      "Drop-off insights with actionable causes",
    ],
  },
  {
    perspective: "user",
    badge: "USER VAULT",
    color: "#2563EB",
    num: "05 / 06",
    title: "Consent Request",
    desc: "When a partner requests access, users see a clear plain-language breakdown and approve or deny in one tap — no OTP, no app switch.",
    highlights: [
      "Plain-language field description",
      "Explicit 10-minute expiry per request",
      "No raw data ever leaves the device",
    ],
  },
  {
    perspective: "company",
    badge: "PARTNER PORTAL",
    color: "#1D4ED8",
    num: "06 / 06",
    title: "Access Audit Log",
    desc: "Every employee action is WORM-logged with a cryptographic hash chain. Regulator-ready, tamper-evident, and filterable by any dimension.",
    highlights: [
      "Hash-chained, tamper-evident WORM log",
      "Filter by employee, field, event, date",
      "One-click export for compliance (PDF / CSV)",
    ],
  },
];

// ── Shared sidebar ──────────────────────────────────────────────────────────────
const USER_NAV = [
  { icon: Activity, label: "Dashboard" },
  { icon: Lock,     label: "Vault"     },
  { icon: Shield,   label: "Consents"  },
  { icon: Bell,     label: "Requests"  },
  { icon: Clock,    label: "Audit"     },
  { icon: Settings, label: "Settings"  },
];
const CO_NAV = [
  { icon: Activity,     label: "Overview"  },
  { icon: CheckCircle2, label: "Verify"    },
  { icon: BarChart3,    label: "Analytics" },
  { icon: Eye,          label: "Employees" },
  { icon: Webhook,      label: "Webhooks"  },
  { icon: Settings,     label: "Settings"  },
];

const Sidebar = ({ nav, active, color }: { nav: typeof USER_NAV; active: string; color: string }) => (
  <aside className="w-[68px] border-r border-slate-100 flex flex-col py-2 px-1 bg-slate-50/80 shrink-0">
    <div className="flex items-center gap-1 px-1 mb-3">
      <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center shrink-0">
        <Fingerprint className="w-2.5 h-2.5 text-white" />
      </div>
      <span className="text-[7px] font-bold text-blue-950 truncate">BYO</span>
    </div>
    {nav.map(item => (
      <div
        key={item.label}
        className="flex flex-col items-center gap-0.5 py-1.5 rounded mb-0.5"
        style={item.label === active ? { background: `${color}18`, color } : { color: "#94a3b8" }}
      >
        <item.icon className="w-3 h-3" />
        <span className="text-[6px] font-medium">{item.label}</span>
      </div>
    ))}
  </aside>
);

// ── Screen 1: Vault Home (User) ────────────────────────────────────────────────
const VaultHome = () => (
  <div className="flex h-full overflow-hidden">
    <Sidebar nav={USER_NAV} active="Dashboard" color="#2563EB" />
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100">
        <div>
          <p className="text-[9px] font-bold text-blue-950">Identity Vault</p>
          <p className="text-[6.5px] text-slate-400 font-mono">usr_8a2f · Enrolled</p>
        </div>
        <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-[6.5px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse inline-block" />PROTECTED
            </span>
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[6.5px] font-bold text-blue-600">SA</div>
        </div>
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-hidden p-2 space-y-2">
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: "Fields",   val: "4", cls: "text-blue-600 bg-blue-50 border-blue-100"     },
              { label: "Consents", val: "3", cls: "text-blue-600 bg-blue-50 border-blue-100"},
              { label: "Requests", val: "2", cls: "text-amber-600 bg-amber-50 border-amber-100"   },
              { label: "Breaches", val: "0", cls: "text-emerald-600 bg-emerald-50 border-emerald-100"},
            ].map(s => (
              <div key={s.label} className={`rounded-lg border p-1.5 ${s.cls}`}>
                <p className="text-[13px] font-bold leading-none">{s.val}</p>
                <p className="text-[6.5px] mt-0.5 opacity-70">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-slate-100 overflow-hidden">
            <div className="flex justify-between px-2 py-1 bg-slate-50 border-b border-slate-100">
              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">Encrypted Fields</span>
              <span className="text-[6.5px] text-slate-400 font-mono">AES-256-GCM · PER-FIELD DEK</span>
            </div>
            {[
              { label: "Full Name",     hash: "4a2f…8b91", cls: "text-blue-600"  },
              { label: "Date of Birth", hash: "9bc1…2e44", cls: "text-rose-500"    },
              { label: "Address Proof", hash: "e302…7af0", cls: "text-emerald-500" },
              { label: "KYC Status",    hash: "7d8a…1c93", cls: "text-amber-500"   },
            ].map(f => (
              <div key={f.label} className="flex items-center justify-between px-2 py-1 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-1">
                  <Lock className="w-2 h-2 text-slate-300" />
                  <span className="text-[7.5px] text-slate-700">{f.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[7px] font-mono font-bold ${f.cls}`}>{f.hash}</span>
                  <span className="text-[6px] bg-slate-100 text-slate-400 px-1 py-0.5 rounded">ENC</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-24 border-l border-slate-100 p-2 shrink-0 flex flex-col gap-2 overflow-hidden">
          <p className="text-[7.5px] font-bold text-slate-600">Key Status</p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-1.5">
            <div className="flex items-center gap-1 mb-0.5">
              <Key className="w-2.5 h-2.5 text-emerald-600" />
              <span className="text-[6.5px] font-mono font-bold text-emerald-700">ON DEVICE</span>
            </div>
            <p className="text-[6px] text-emerald-600 leading-relaxed">ByoSync servers see only ciphertext.</p>
          </div>
          {[
            { k: "Integrity",   v: "✓ OK"   },
            { k: "Last access", v: "2h ago" },
            { k: "Algorithm",   v: "AES-256"},
            { k: "Key backup",  v: "iCloud" },
          ].map(i => (
            <div key={i.k} className="flex justify-between">
              <span className="text-[6.5px] text-slate-400">{i.k}</span>
              <span className="text-[6.5px] text-slate-700 font-mono">{i.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── Screen 2: Company Verification Hub ─────────────────────────────────────────
const CompanyVerifHub = () => (
  <div className="flex h-full overflow-hidden">
    <Sidebar nav={CO_NAV} active="Verify" color="#1D4ED8" />
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100">
        <div>
          <p className="text-[9px] font-bold text-blue-950">Verification Hub</p>
          <p className="text-[6.5px] text-slate-400 font-mono">AcmePay × ByoSync SDK · v2.1.4</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-[6.5px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse inline-block" />LIVE
          </span>
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[6.5px] font-bold text-blue-600">AP</div>
        </div>
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-hidden p-2 space-y-2">
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: "Today",      val: "1,247", cls: "text-blue-700 bg-blue-50 border-blue-100" },
              { label: "Success",    val: "99.2%", cls: "text-emerald-700 bg-emerald-50 border-emerald-100"},
              { label: "Avg ms",     val: "82",    cls: "text-sky-700 bg-sky-50 border-sky-100"          },
              { label: "PII Stored", val: "0",     cls: "text-rose-700 bg-rose-50 border-rose-100"       },
            ].map(s => (
              <div key={s.label} className={`rounded-lg border p-1.5 ${s.cls}`}>
                <p className="text-[13px] font-bold leading-none">{s.val}</p>
                <p className="text-[6.5px] mt-0.5 opacity-70">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-slate-100 overflow-hidden">
            <div className="flex justify-between px-2 py-1 bg-slate-50 border-b border-slate-100">
              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">Recent Verifications</span>
              <span className="flex items-center gap-0.5 text-[6.5px] text-emerald-600 font-mono">
                <RefreshCw className="w-2 h-2" /> Live
              </span>
            </div>
            <div className="flex px-2 py-0.5 bg-slate-50/50 border-b border-slate-50">
              {["User Token","Fields","Result","Latency","Time"].map((h, i) => (
                <span key={h} className={`text-[6px] font-bold text-slate-400 uppercase ${
                  i === 0 ? "w-16" : i === 1 ? "flex-1" : "w-10 text-right"
                }`}>{h}</span>
              ))}
            </div>
            {[
              { tok: "usr_8a2f", fields: "age_18, kyc",  ok: true,  ms: "82ms",  t: "14:31" },
              { tok: "usr_9bc1", fields: "age_18, kyc",  ok: true,  ms: "79ms",  t: "14:28" },
              { tok: "usr_4d2e", fields: "address",       ok: true,  ms: "91ms",  t: "14:22" },
              { tok: "usr_7e1f", fields: "age_18",        ok: false, ms: "88ms",  t: "14:19" },
            ].map((r, i) => (
              <div key={i} className="flex items-center px-2 py-1 border-b border-slate-50 last:border-0">
                <span className="w-16 text-[7px] font-mono text-slate-500 truncate">{r.tok}</span>
                <span className="flex-1 text-[7px] text-slate-600 font-mono truncate">{r.fields}</span>
                <span className={`w-10 text-right text-[7px] font-bold ${r.ok ? "text-emerald-600" : "text-red-500"}`}>
                  {r.ok ? "✓ Pass" : "✗ Fail"}
                </span>
                <span className="w-10 text-right text-[7px] text-slate-400 font-mono">{r.ms}</span>
                <span className="w-10 text-right text-[6.5px] text-slate-400 font-mono">{r.t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="w-24 border-l border-slate-100 p-2 shrink-0 flex flex-col gap-2 overflow-hidden">
          <p className="text-[7.5px] font-bold text-slate-600">Webhook Status</p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-1.5">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[6.5px] font-mono font-bold text-emerald-700">HEALTHY</span>
            </div>
            <p className="text-[6px] text-emerald-600">1,247 webhooks delivered</p>
          </div>
          {[
            { k: "P50 latency", v: "79ms"  },
            { k: "P95 latency", v: "120ms" },
            { k: "Error rate",  v: "0.8%"  },
            { k: "Retry queue", v: "0"     },
          ].map(i => (
            <div key={i.k} className="flex justify-between">
              <span className="text-[6.5px] text-slate-400">{i.k}</span>
              <span className="text-[6.5px] text-slate-700 font-mono">{i.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── Screen 3: Consent Manager (User) ───────────────────────────────────────────
const ConsentManager = () => (
  <div className="flex h-full overflow-hidden">
    <Sidebar nav={USER_NAV} active="Consents" color="#2563EB" />
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100">
        <div>
          <p className="text-[9px] font-bold text-blue-950">Consent Manager</p>
          <p className="text-[6.5px] text-slate-400 font-mono">You control every access</p>
        </div>
          <span className="text-[6.5px] text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full font-mono">3 active</span>
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-hidden p-2">
          <div className="bg-white rounded-lg border border-slate-100 overflow-hidden">
            <div className="flex justify-between px-2 py-1 bg-slate-50 border-b border-slate-100">
              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">Active Consents</span>
              <span className="text-[6.5px] text-slate-400">3 companies with access</span>
            </div>
            <div className="flex px-2 py-0.5 bg-slate-50/50 border-b border-slate-50">
              {["Company","Fields Shared","Status","Expires",""].map((h, i) => (
                <span key={i} className={`text-[6px] font-bold text-slate-400 uppercase ${
                  i === 0 ? "w-18" : i === 1 ? "flex-1" : "w-14 text-right"
                }`}>{h}</span>
              ))}
            </div>
            {[
              { co: "AcmePay", fields: "age_over_18, kyc_verified", status: "Active",  exp: "30d", active: true  },
              { co: "NeoBank", fields: "address_proof",              status: "Active",  exp: "14d", active: true  },
              { co: "ZipCart", fields: "age_over_18",                status: "Revoked", exp: "—",   active: false },
            ].map((r, i) => (
              <div key={i} className="flex items-center px-2 py-1.5 border-b border-slate-50 last:border-0">
                <div className="w-18 flex items-center gap-1 shrink-0 mr-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.active ? "bg-emerald-400" : "bg-slate-300"}`} />
                  <span className="text-[7.5px] font-bold text-slate-700 truncate">{r.co}</span>
                </div>
                <span className="flex-1 text-[7px] text-slate-500 font-mono truncate">{r.fields}</span>
                <span className={`w-14 text-right text-[7px] font-bold ${r.active ? "text-emerald-600" : "text-slate-400"}`}>
                  {r.status}
                </span>
                <span className="w-8 text-right text-[7px] text-slate-400 font-mono">{r.exp}</span>
                <div className="w-14 flex justify-end">
                  {r.active
                    ? <button className="text-[6.5px] text-red-500 border border-red-200 px-1.5 py-0.5 rounded bg-red-50 font-bold">Revoke</button>
                    : <span className="text-[6.5px] text-slate-300 line-through">Revoked</span>
                  }
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 bg-slate-50 rounded-lg border border-slate-100 p-2">
            <p className="text-[7px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fields that are NEVER shared</p>
            <div className="grid grid-cols-3 gap-1">
              {["Aadhaar", "Face scan", "Phone no.", "PAN card", "Raw DOB", "GPS data"].map(f => (
                <div key={f} className="flex items-center gap-1">
                  <XCircle className="w-2 h-2 text-slate-300 shrink-0" />
                  <span className="text-[6.5px] text-slate-400 line-through">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-24 border-l border-slate-100 p-2 shrink-0 flex flex-col gap-2 overflow-hidden">
          <p className="text-[7.5px] font-bold text-slate-600">Privacy Score</p>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-1.5 text-center">
            <p className="text-[20px] font-extrabold text-blue-600 leading-none">98</p>
            <p className="text-[6px] text-blue-400 font-mono">/ 100</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-1.5">
            <p className="text-[6.5px] font-bold text-emerald-700 mb-0.5">0 bytes PII shared</p>
            <p className="text-[6px] text-emerald-600">Only signed booleans ever leave the device.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ── Screen 4: Consent Analytics (Company) ──────────────────────────────────────
const ConsentAnalytics = () => (
  <div className="flex h-full overflow-hidden">
    <Sidebar nav={CO_NAV} active="Analytics" color="#1D4ED8" />
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100">
        <div>
          <p className="text-[9px] font-bold text-blue-950">Consent Analytics</p>
          <p className="text-[6.5px] text-slate-400 font-mono">Last 30 days · 1,500 requests</p>
        </div>
        <span className="text-[6.5px] text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full font-mono">83.1% approval</span>
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-hidden p-2 space-y-2">
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: "Approval Rate", val: "83.1%", cls: "text-blue-700 bg-blue-50 border-blue-100" },
              { label: "Avg Time",      val: "8.3s",  cls: "text-sky-700 bg-sky-50 border-sky-100"         },
              { label: "Drop-off",      val: "16.9%", cls: "text-amber-700 bg-amber-50 border-amber-100"   },
            ].map(s => (
              <div key={s.label} className={`rounded-lg border p-1.5 ${s.cls}`}>
                <p className="text-[13px] font-bold leading-none">{s.val}</p>
                <p className="text-[6.5px] mt-0.5 opacity-70">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-slate-100 p-2">
            <p className="text-[7px] font-bold text-slate-500 uppercase tracking-wider mb-2">Consent Funnel</p>
            {[
              { label: "Requests Sent", val: "1,500", pct: 100 },
              { label: "Opened",        val: "1,320", pct: 88  },
              { label: "Approved",      val: "1,247", pct: 83  },
              { label: "Proof Verified",val: "1,199", pct: 80  },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 mb-1.5">
                <div className="flex-1">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[7px] text-slate-600">{s.label}</span>
                    <span className="text-[7px] font-mono font-bold text-blue-950">{s.val}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${s.pct}%`, opacity: 0.55 + s.pct * 0.005 }} />
                  </div>
                </div>
                <span className="text-[7px] text-slate-400 w-6 text-right font-mono">{s.pct}%</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-slate-100 p-2">
            <p className="text-[7px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Field Breakdown</p>
            {[
              { label: "age_over_18",   count: 1180, color: "#1E40AF" },
              { label: "kyc_verified",  count: 1094, color: "#2563EB" },
              { label: "address_proof", count: 412,  color: "#3B82F6" },
            ].map(bar => (
              <div key={bar.label} className="mb-1.5">
                <div className="flex justify-between mb-0.5">
                  <span className="text-[7px] font-mono text-slate-600">{bar.label}</span>
                  <span className="text-[7px] text-slate-400 font-mono">{bar.count}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(bar.count / 1247) * 100}%`, background: bar.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-24 border-l border-slate-100 p-2 shrink-0 flex flex-col gap-2 overflow-hidden">
          <p className="text-[7.5px] font-bold text-slate-600">Top Drop-offs</p>
          {[
            { cause: "Request timed out", pct: "52%" },
            { cause: "User denied",       pct: "31%" },
            { cause: "App not installed", pct: "17%" },
          ].map(d => (
            <div key={d.cause} className="bg-amber-50 border border-amber-100 rounded p-1.5">
              <div className="flex justify-between">
                <span className="text-[6.5px] text-amber-700 leading-snug">{d.cause}</span>
                <span className="text-[7px] font-bold text-amber-800 ml-1">{d.pct}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── Screen 5: Incoming Consent Request (User) ───────────────────────────────────
const IncomingRequest = () => (
  <div className="flex h-full overflow-hidden">
    <Sidebar nav={USER_NAV} active="Requests" color="#2563EB" />
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100">
        <div>
          <p className="text-[9px] font-bold text-blue-950">Consent Request</p>
          <p className="text-[6.5px] text-slate-400 font-mono">New request · expires soon</p>
        </div>
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
          <Clock className="w-2.5 h-2.5 text-amber-600" />
          <span className="text-[7px] font-mono font-bold text-amber-700">09:47</span>
        </div>
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-hidden p-2 space-y-1.5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-6 h-6 rounded-lg bg-amber-200 flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <div>
                <p className="text-[8.5px] font-bold text-amber-900">AcmePay</p>
                <p className="text-[6.5px] text-amber-600 font-mono">Verified ByoSync Partner</p>
              </div>
            </div>
            <p className="text-[7px] text-amber-800">Requesting identity verification for KYC onboarding.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-2">
            <p className="text-[7px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">What they'll receive (boolean only)</p>
            {[
              { field: "age_over_18",  note: "true/false — no date of birth transmitted" },
              { field: "kyc_verified", note: "true/false — no Aadhaar or PAN transmitted" },
            ].map(f => (
              <div key={f.field} className="flex items-start gap-1.5 mb-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[7.5px] font-mono font-bold text-slate-700">{f.field}</span>
                  <p className="text-[6.5px] text-slate-400">{f.note}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-2">
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-wider mb-1">Never transmitted</p>
            <div className="grid grid-cols-2 gap-0.5">
              {["Aadhaar number", "Face biometric", "Phone number", "PAN card", "Date of birth", "Home address"].map(f => (
                <div key={f} className="flex items-center gap-1">
                  <XCircle className="w-2 h-2 text-slate-300 shrink-0" />
                  <span className="text-[7px] text-slate-400 line-through">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-0.5">
            <button className="flex-1 py-2 rounded-xl text-[8.5px] font-bold text-white shadow-sm bg-blue-600">
              ✓ Approve
            </button>
            <button className="flex-1 py-2 rounded-xl text-[8.5px] font-bold text-slate-600 bg-slate-100 border border-slate-200">
              ✕ Deny
            </button>
          </div>
        </div>
        <div className="w-24 border-l border-slate-100 p-2 shrink-0 flex flex-col gap-2 overflow-hidden">
          <p className="text-[7.5px] font-bold text-slate-600">Request History</p>
          {[
            { co: "NeoBank", when: "2d ago", ok: true  },
            { co: "AcmePay", when: "5d ago", ok: true  },
            { co: "ZipCart", when: "1w ago", ok: false },
          ].map(r => (
            <div key={r.co + r.when} className="flex justify-between items-center">
              <span className="text-[7px] text-slate-600">{r.co}</span>
              <span className={`text-[6.5px] font-bold ${r.ok ? "text-emerald-500" : "text-red-400"}`}>
                {r.ok ? "✓" : "✕"} {r.when}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── Screen 6: Audit Log (Company) ───────────────────────────────────────────────
const AuditLog = () => (
  <div className="flex h-full overflow-hidden">
    <Sidebar nav={CO_NAV} active="Employees" color="#1D4ED8" />
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100">
        <div>
          <p className="text-[9px] font-bold text-blue-950">Employee Access Audit</p>
          <p className="text-[6.5px] text-slate-400 font-mono">WORM-logged · hash-chained · tamper-evident</p>
        </div>
        <button className="text-[6.5px] text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded bg-blue-50 font-bold">Export CSV</button>
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-hidden p-2 space-y-2">
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: "Total Events",   val: "8,241", cls: "text-blue-700 bg-blue-50 border-blue-100"  },
              { label: "Active Employees",val: "12",   cls: "text-slate-700 bg-slate-50 border-slate-200"     },
              { label: "Chain Verified", val: "100%",  cls: "text-emerald-700 bg-emerald-50 border-emerald-100"},
            ].map(s => (
              <div key={s.label} className={`rounded-lg border p-1.5 ${s.cls}`}>
                <p className="text-[13px] font-bold leading-none">{s.val}</p>
                <p className="text-[6.5px] mt-0.5 opacity-70">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-slate-100 overflow-hidden">
            <div className="flex justify-between px-2 py-1 bg-slate-50 border-b border-slate-100">
              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">Access Log</span>
              <span className="text-[6.5px] text-slate-400 font-mono">Every entry is cryptographically signed</span>
            </div>
            <div className="flex px-2 py-0.5 bg-slate-50/50 border-b border-slate-50">
              {["Employee","Action","Field","Duration","Time","Hash"].map((h, i) => (
                <span key={h} className={`text-[6px] font-bold text-slate-400 uppercase ${
                  i === 0 ? "w-16" : i === 1 ? "w-24" : i === 2 ? "flex-1" : "w-10 text-right"
                }`}>{h}</span>
              ))}
            </div>
            {[
              { emp: "priya_s",  action: "plaintext_viewed",  field: "address_proof", dur: "12m", time: "14:31", hash: "0x9af1" },
              { emp: "raj_k",    action: "consent_requested", field: "kyc_verified",  dur: "—",   time: "13:45", hash: "0xe302" },
              { emp: "priya_s",  action: "plaintext_viewed",  field: "address_proof", dur: "8m",  time: "11:22", hash: "0x7d8a" },
              { emp: "anita_m",  action: "policy_updated",    field: "* all",         dur: "—",   time: "09:00", hash: "0x4b2f" },
            ].map((r, i) => (
              <div key={i} className="flex items-center px-2 py-1 border-b border-slate-50 last:border-0">
                <span className="w-16 text-[7px] font-mono text-blue-600 truncate">{r.emp}</span>
                <span className="w-24 text-[6.5px] text-slate-500 truncate">{r.action}</span>
                <span className="flex-1 text-[7px] font-mono text-slate-500 truncate">{r.field}</span>
                <span className="w-10 text-right text-[7px] text-slate-400 font-mono">{r.dur}</span>
                <span className="w-10 text-right text-[6.5px] text-slate-400 font-mono">{r.time}</span>
                <div className="w-10 flex justify-end items-center gap-0.5">
                  <span className="text-[6.5px] font-mono text-slate-400">{r.hash}</span>
                  <span className="text-[6.5px] text-emerald-500">✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-24 border-l border-slate-100 p-2 shrink-0 flex flex-col gap-2 overflow-hidden">
          <p className="text-[7.5px] font-bold text-slate-600">Compliance</p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-1.5">
            <p className="text-[7px] font-bold text-emerald-700 mb-0.5">DPDP 2025 ✓</p>
            <p className="text-[6px] text-emerald-600">All access logs meet regulatory requirements.</p>
          </div>
          {[
            { k: "Chain depth",   v: "8,241" },
            { k: "Last verified", v: "2m ago" },
            { k: "Format",        v: "PDF/CSV"},
          ].map(i => (
            <div key={i.k} className="flex justify-between">
              <span className="text-[6.5px] text-slate-400">{i.k}</span>
              <span className="text-[6.5px] text-slate-700 font-mono">{i.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── Main PlatformPreview component ─────────────────────────────────────────────
const motionEase = [0.22, 1, 0.36, 1] as const;

export const PlatformPreview = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const last = SCREENS.length - 1;

  const goPrev = useCallback(() => {
    setActiveIdx((i) => Math.max(0, i - 1));
  }, []);
  const goNext = useCallback(() => {
    setActiveIdx((i) => Math.min(last, i + 1));
  }, [last]);

  const onDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const swipe = info.offset.x + info.velocity.x * 0.22;
      if (swipe < -64) goNext();
      else if (swipe > 64) goPrev();
    },
    [goNext, goPrev],
  );

  const screen = SCREENS[activeIdx];
  const progressPct = last > 0 ? (activeIdx / last) * 100 : 100;

  const arrowBtn =
    "flex shrink-0 self-center h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-600 shadow-sm hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2";

  return (
    <section className="relative overflow-hidden bg-white py-14 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">

          {/* Section header */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="h-px max-w-16 flex-1 bg-blue-200/60" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-blue-500">
              Platform Experience
            </span>
            <div className="h-px max-w-16 flex-1 bg-blue-200/60" />
          </div>

          <div className="flex items-stretch gap-1.5 sm:gap-3 md:gap-4">
            <button
              type="button"
              className={arrowBtn}
              aria-label="Previous screen"
              onClick={goPrev}
              disabled={activeIdx === 0}
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
            </button>

            <motion.div
              drag="x"
              dragDirectionLock
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.14}
              onDragEnd={onDragEnd}
              className="min-w-0 flex-1 cursor-grab active:cursor-grabbing"
            >
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10 items-center">

            {/* ── Left: metadata ── */}
            <div className="flex flex-col gap-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.38, ease: motionEase }}
                  className="flex flex-col gap-4"
                >
                  {/* Perspective pills */}
                  <div className="flex gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border transition-all ${
                      screen.perspective === "user"
                        ? "border-blue-400 bg-blue-50 text-blue-600 font-bold"
                        : "border-slate-200 bg-slate-50/80 text-slate-400"
                    }`}>
                      <User className="w-3 h-3" /> User Vault
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border transition-all ${
                      screen.perspective === "company"
                        ? "border-blue-400 bg-blue-50 text-blue-600 font-bold"
                        : "border-slate-200 bg-slate-50/80 text-slate-400"
                    }`}>
                      <Building2 className="w-3 h-3" /> Partner Portal
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <span
                      className="inline-flex w-fit px-3 py-0.5 rounded-full text-[10px] font-mono border tracking-widest mb-3"
                      style={{ borderColor: screen.color, color: screen.color, background: `${screen.color}12` }}
                    >
                      {screen.num} · {screen.badge}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-blue-950 leading-snug">
                      {screen.title}
                    </h2>
                  </div>

                  <p className="text-blue-800 text-sm leading-relaxed">{screen.desc}</p>

                  <div className="flex flex-col gap-2">
                    {screen.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: screen.color }}
                        />
                        <span className="text-blue-900 text-sm leading-snug">{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Progress */}
                  <div className="mt-1">
                    <div className="mb-2 flex justify-between text-[11px] font-mono text-slate-400">
                      <span>{activeIdx + 1} / {SCREENS.length}</span>
                      <span className="hidden text-slate-400 sm:inline">Swipe or use arrows · tap dots</span>
                      <span className="sm:hidden">Swipe · dots</span>
                    </div>
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {SCREENS.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Screen ${i + 1}: ${s.title}`}
                          aria-current={i === activeIdx ? "true" : undefined}
                          onClick={() => setActiveIdx(i)}
                          className="rounded-full p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                        >
                          <motion.div
                            className="block rounded-full"
                            animate={{
                              width:      i === activeIdx ? 20 : 5,
                              height:     5,
                              background: i === activeIdx ? s.color : "rgba(0,0,0,0.1)",
                            }}
                            transition={{ duration: 0.35, ease: motionEase }}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="h-px overflow-hidden rounded-full bg-blue-200">
                      <div
                        className="h-full rounded-full transition-[width] duration-500 ease-out"
                        style={{
                          background: screen.color,
                          width: `${progressPct}%`,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Right: Laptop frame ── */}
            <div className="relative">
              {/* Ambient glow */}
              <motion.div
                className="absolute -inset-6 rounded-3xl blur-3xl opacity-20"
                animate={{ background: `radial-gradient(circle at 50% 50%, ${screen.color}, transparent 70%)` }}
                transition={{ duration: 0.85, ease: motionEase }}
              />

              <div className="relative">
                {/* Screen with flex-col so chrome + content are properly sized */}
                <div className="relative w-full aspect-[16/10] bg-white rounded-t-xl border-[4px] border-slate-200 overflow-hidden shadow-2xl flex flex-col">

                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-slate-100 bg-slate-50 shrink-0">
                    <div className="flex gap-1 shrink-0">
                      <div className="w-2 h-2 rounded-full bg-red-400/70" />
                      <div className="w-2 h-2 rounded-full bg-yellow-400/70" />
                      <div className="w-2 h-2 rounded-full bg-green-400/70" />
                    </div>
                    <div className="flex-1 bg-white border border-slate-200 rounded h-4 flex items-center px-2">
                      <span className="text-[8px] text-slate-400 font-mono">
                        {screen.perspective === "user" ? "vault.byosync.io" : "portal.byosync.io"}
                      </span>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={activeIdx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28, ease: motionEase }}
                        className="text-[8px] font-mono text-slate-400 shrink-0"
                      >
                        {screen.num}
                      </motion.span>
                    </AnimatePresence>
                  </div>

                  {/* Dashboard content — fills remaining height */}
                  <div className="relative flex-1 min-h-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeIdx}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.36, ease: motionEase }}
                        className="absolute inset-0 overflow-hidden"
                      >
                        {activeIdx === 0 && <VaultHome />}
                        {activeIdx === 1 && <CompanyVerifHub />}
                        {activeIdx === 2 && <ConsentManager />}
                        {activeIdx === 3 && <ConsentAnalytics />}
                        {activeIdx === 4 && <IncomingRequest />}
                        {activeIdx === 5 && <AuditLog />}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Keyboard base */}
                <div className="h-3 w-[108%] -ml-[4%] bg-slate-200 rounded-b-xl border-t border-slate-300" />
                <div className="h-2 w-1/4 mx-auto bg-slate-300 rounded-b-lg" />
              </div>
            </div>

          </div>
            </motion.div>

            <button
              type="button"
              className={arrowBtn}
              aria-label="Next screen"
              onClick={goNext}
              disabled={activeIdx === last}
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
            </button>
          </div>
      </div>
    </section>
  );
};
