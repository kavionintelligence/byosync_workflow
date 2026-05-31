"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentChat, type ChatMessage } from "@/components/landing/demo/agent-chat";
import { RepoScanner } from "@/components/landing/demo/repo-scanner";
import { DatabaseMap } from "@/components/landing/demo/database-map";
import { RiskReport, type RiskItem } from "@/components/landing/demo/risk-report";
import { ConsentApprovalCard } from "@/components/landing/demo/consent-approval-card";
import { ImplementationTimeline } from "@/components/landing/demo/implementation-timeline";
import { TrustScore } from "@/components/landing/demo/trust-score";
import { ProofToken } from "@/components/landing/shared/proof-token";
import { ScanPulse } from "@/components/landing/shared/scan-pulse";
import { AGENT_STEP_COLORS, DEMO } from "@/lib/landing-demo-theme";
import {
  Bot,
  MessageSquare,
  ScanSearch,
  AlertTriangle,
  FileCode2,
  ShieldCheck,
  Fingerprint,
  Cpu,
  BarChart3,
  Activity,
  X,
  MousePointerClick,
} from "lucide-react";

const STEPS = [
  { id: 0, label: "Init", icon: Bot, desc: "Trust Agent ready", color: AGENT_STEP_COLORS[0] },
  { id: 1, label: "Intake", icon: MessageSquare, desc: "Framework & data location", color: AGENT_STEP_COLORS[1] },
  { id: 2, label: "Scanning", icon: ScanSearch, desc: "Codebase & DB analysis", color: AGENT_STEP_COLORS[2] },
  { id: 3, label: "Risks", icon: AlertTriangle, desc: "PII gap detection", color: AGENT_STEP_COLORS[3] },
  { id: 4, label: "Plan", icon: FileCode2, desc: "SDK integration proposal", color: AGENT_STEP_COLORS[4] },
  { id: 5, label: "Consent", icon: ShieldCheck, desc: "Live human approval request", color: AGENT_STEP_COLORS[5] },
  { id: 6, label: "Liveness", icon: Fingerprint, desc: "Face + voice + device verify", color: AGENT_STEP_COLORS[6] },
  { id: 7, label: "Implement", icon: Cpu, desc: "SDK/API integration deploy", color: AGENT_STEP_COLORS[7] },
  { id: 8, label: "Report", icon: BarChart3, desc: "Trust posture improved +46", color: AGENT_STEP_COLORS[8] },
  { id: 9, label: "Runtime", icon: Activity, desc: "Trust Runtime live", color: AGENT_STEP_COLORS[9] },
] as const;

const BEFORE_RISKS: RiskItem[] = [
  { label: "Risky PII fields", value: "12 found", severity: "high" },
  { label: "Missing consent purposes", value: "4 gaps", severity: "high" },
  { label: "Access logs missing", value: "3 routes", severity: "medium" },
  { label: "Revocation gaps", value: "2 paths", severity: "medium" },
  { label: "Raw PII exposure", value: "High", severity: "high" },
];

const AFTER_RISKS: RiskItem[] = [
  { label: "Partner-side raw PII", value: "Reduced", severity: "ok" },
  { label: "Consent evidence", value: "Improved", severity: "ok" },
  { label: "Revocation path", value: "Added", severity: "ok" },
  { label: "Audit trail", value: "Generated", severity: "ok" },
  { label: "Trust posture", value: "Improved", severity: "ok" },
];

function buildMessages(phase: number): ChatMessage[] {
  const m: ChatMessage[] = [
    { role: "agent", text: "Hi. I'm the ByoSync Trust Integration Agent." },
    { role: "agent", text: "Let's check your DPDP / SOC2 readiness." },
  ];
  if (phase >= 1) {
    m.push({ role: "agent", text: "Which compliance frameworks are you targeting?" });
    m.push({ role: "user", text: "DPDP + SOC2 Type II" });
    m.push({ role: "agent", text: "Where is your user data stored?" });
    m.push({ role: "user", text: "PostgreSQL + S3 (self-hosted)" });
    m.push({ role: "agent", text: "Can I inspect your app flows and data architecture?" });
    m.push({ role: "user", text: "Yes — GitHub connected. DB schema uploaded." });
  }
  if (phase >= 2) m.push({ role: "agent", text: "Scanning codebase, API routes, DB schema, and consent flows…" });
  if (phase >= 3)
    m.push({
      role: "agent",
      text: "Scan complete. 12 risky PII fields, 4 consent gaps, 2 revocation paths missing. Risk score: 78/100.",
    });
  if (phase >= 4) {
    m.push({
      role: "agent",
      text: "ByoSync can replace these flows with vault-based tokenized access and live human approval.",
    });
    m.push({ role: "user", text: "Yes — generate the integration plan." });
  }
  if (phase >= 5) m.push({ role: "agent", text: "Requesting explicit approval before implementing. Review consent details." });
  if (phase >= 6) m.push({ role: "agent", text: "Verifying live human presence — face + voice + device binding…" });
  if (phase >= 7) m.push({ role: "agent", text: "Human verified ✓  Deploying Trust Runtime via SDK/API…" });
  if (phase >= 8) m.push({ role: "agent", text: "Implementation complete. Regenerating compliance evidence…" });
  if (phase >= 9) m.push({ role: "agent", text: "Trust Runtime active. Posture improved 28 → 74 (+46 pts)." });
  return m;
}

function TabVisual({ phase, implProgress }: { phase: number; implProgress: number }) {
  return (
    <AnimatePresence mode="wait">
      {phase === 0 && (
        <motion.div
          key="init"
          className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl p-6"
          style={{ background: DEMO.panelBlue, border: `1px solid ${DEMO.borderLight}` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ScanPulse size={64} color={DEMO.primary} rings={3} />
          <div className="text-center">
            <p className="mb-1 text-sm font-semibold text-blue-950">Trust Integration Agent</p>
            <p className="text-xs text-blue-600">Ready to inspect your product flows</p>
          </div>
        </motion.div>
      )}

      {phase === 1 && (
        <motion.div
          key="intake"
          className="flex flex-col gap-2.5 rounded-xl p-4"
          style={{ background: DEMO.panelBlue, border: `1px solid ${DEMO.borderLight}` }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-blue-500">Intake Session</p>
          {[
            ["Frameworks", "DPDP + SOC2 Type II"],
            ["Data store", "PostgreSQL + S3"],
            ["Repo", "github.com/acme/app ✓"],
            ["DB schema", "db-schema.sql uploaded ✓"],
          ].map(([k, v], i) => (
            <motion.div
              key={k}
              className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: DEMO.panel, border: `1px solid ${DEMO.borderLight}` }}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <span className="text-xs text-blue-600">{k}</span>
              <span className="font-mono text-xs" style={{ color: DEMO.primary }}>
                {v}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {(phase === 2 || phase === 3) && (
        <motion.div key="scan" className="flex flex-col gap-2.5" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <RepoScanner scanning={phase === 2} risksFound={phase >= 3 ? 5 : 0} />
          <DatabaseMap scanning={phase === 2} highlightRisks={phase >= 3} />
        </motion.div>
      )}

      {phase === 4 && (
        <motion.div key="plan" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <RiskReport items={BEFORE_RISKS} phase="before" title="Baseline Risk Report" />
        </motion.div>
      )}

      {phase === 5 && (
        <motion.div key="consent" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
          <ConsentApprovalCard phase="request" />
        </motion.div>
      )}

      {phase === 6 && (
        <motion.div key="liveness" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
          <ConsentApprovalCard phase="scanning" />
        </motion.div>
      )}

      {phase === 7 && (
        <motion.div key="impl" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <ImplementationTimeline progress={implProgress} />
        </motion.div>
      )}

      {phase === 8 && (
        <motion.div key="report" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <RiskReport items={AFTER_RISKS} phase="after" title="Updated Trust Report" />
        </motion.div>
      )}

      {phase === 9 && (
        <motion.div
          key="runtime"
          className="flex flex-col gap-2.5 rounded-xl p-4"
          style={{ background: "rgba(219,234,254,0.5)", border: `1px solid ${DEMO.border}` }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, type: "spring", stiffness: 220 }}
        >
          <div className="flex items-center justify-center py-4">
            <ScanPulse size={56} color={DEMO.primary} rings={3} />
          </div>
          <div className="pb-2 text-center">
            <motion.p
              className="mb-1 text-sm font-bold"
              style={{ color: DEMO.primary }}
              animate={{ opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              ByoSync Trust Runtime active
            </motion.p>
            <p className="mb-3 text-xs text-blue-600">Vault · Tokenized access · Live approval · Audit proof</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Private vault", value: "active", color: DEMO.primary },
              { label: "Token access", value: "enabled", color: DEMO.primary },
              { label: "Live approval", value: "running", color: DEMO.primary },
              { label: "Audit proof", value: "streaming", color: DEMO.sky },
            ].map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
                style={{ background: DEMO.panel, border: `1px solid ${r.color}22` }}
              >
                <span className="text-[10px] text-blue-600">{r.label}</span>
                <span className="font-mono text-[9px] font-semibold" style={{ color: r.color }}>
                  {r.value}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-1">
            <ProofToken label="runtime-id" value="bys_rt_0x9f4…" color="blue" animate />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EmptyState({ onOpen }: { onOpen: (id: number) => void }) {
  return (
    <motion.div className="flex min-h-[280px] flex-col items-center justify-center gap-5 p-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: "rgba(37,99,235,0.08)", border: `1px solid ${DEMO.border}` }}
      >
        <MousePointerClick size={20} style={{ color: DEMO.primary }} />
      </div>
      <div>
        <p className="mb-1 text-sm font-semibold text-blue-950">No tabs open</p>
        <p className="text-xs text-blue-600">Click any step above to open it as a tab</p>
      </div>
      <div className="flex max-w-xs flex-wrap justify-center gap-2">
        {STEPS.slice(0, 5).map((s) => {
          const Icon = s.icon;
          return (
            <motion.button
              key={s.id}
              type="button"
              onClick={() => onOpen(s.id)}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-[10px]"
              style={{ background: `${s.color}10`, border: `1px solid ${s.color}25`, color: s.color }}
              whileHover={{ scale: 1.05, background: `${s.color}18` }}
              whileTap={{ scale: 0.96 }}
            >
              <Icon size={10} aria-hidden />
              {s.label}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

export function TrustAgentDemo() {
  const [openTabs, setOpenTabs] = useState<number[]>([0]);
  const [activeTab, setActiveTab] = useState<number | null>(0);
  const [implProgress, setImplProgress] = useState(0);
  const implTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const openTab = (id: number) => {
    setOpenTabs((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setActiveTab(id);
  };

  const closeTab = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const rest = openTabs.filter((t) => t !== id);
    setOpenTabs(rest);
    if (activeTab === id) setActiveTab(rest.length > 0 ? rest[rest.length - 1] : null);
  };

  useEffect(() => {
    if (activeTab === 7) {
      setImplProgress(0);
      let i = 0;
      implTimerRef.current = setInterval(() => {
        i++;
        setImplProgress(i);
        if (i >= 6 && implTimerRef.current) clearInterval(implTimerRef.current);
      }, 650);
    }
    return () => {
      if (implTimerRef.current) clearInterval(implTimerRef.current);
    };
  }, [activeTab]);

  const activeStep = activeTab !== null ? STEPS[activeTab] : null;

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl border border-blue-200/80 bg-white shadow-xl shadow-blue-100/50"
      style={{ background: DEMO.shellGradient }}
      aria-label="ByoSync Trust Agent interactive demo"
      role="region"
    >
      <div className="flex shrink-0 items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5" aria-hidden>
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          </div>
          <span className="ml-2 font-mono text-xs text-blue-600">byosync · trust-agent</span>
        </div>
        <ProofToken
          label={activeTab !== null && activeTab >= 9 ? "runtime" : activeTab !== null && activeTab >= 8 ? "posture" : "scan"}
          value={activeTab !== null && activeTab >= 9 ? "active" : activeTab !== null && activeTab >= 8 ? "improved" : "standby"}
          color={activeTab !== null && activeTab >= 8 ? "blue" : "warn"}
          animate={activeTab !== null && activeTab >= 2}
        />
      </div>

      <div className="mx-5 h-px shrink-0 bg-linear-to-r from-transparent via-blue-200 to-transparent" aria-hidden />

      <div
        className="flex shrink-0 items-center gap-1.5 overflow-x-auto px-4 py-2.5"
        style={{ scrollbarWidth: "none", borderBottom: `1px solid ${DEMO.borderLight}` }}
        aria-label="Available workflow steps"
      >
        <span className="shrink-0 pr-1 font-mono text-[9px] uppercase tracking-widest text-blue-400 select-none">Steps</span>
        {STEPS.map((s) => {
          const isOpen = openTabs.includes(s.id);
          const isActive = activeTab === s.id;
          const Icon = s.icon;
          return (
            <motion.button
              key={s.id}
              type="button"
              onClick={() => openTab(s.id)}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-[9px] font-semibold select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{
                background: isActive ? `${s.color}18` : isOpen ? `${s.color}0C` : DEMO.panelMuted,
                border: `1px solid ${isActive ? s.color + "50" : isOpen ? s.color + "25" : DEMO.borderLight}`,
                color: isActive ? s.color : isOpen ? s.color + "AA" : DEMO.muted,
              }}
              whileHover={{ background: `${s.color}18`, borderColor: `${s.color}45`, scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              aria-pressed={isOpen}
            >
              <Icon size={10} aria-hidden />
              {s.label}
            </motion.button>
          );
        })}
      </div>

      <div
        className="flex shrink-0 items-end gap-0.5 overflow-x-auto px-3 pt-2"
        style={{ scrollbarWidth: "none", minHeight: openTabs.length > 0 ? 38 : 8, borderBottom: `1px solid ${DEMO.border}` }}
        role="tablist"
      >
        <AnimatePresence initial={false}>
          {openTabs.map((tabId) => {
            const s = STEPS[tabId];
            const isActive = activeTab === tabId;
            const Icon = s.icon;
            return (
              <motion.button
                key={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tabId)}
                className="group relative flex shrink-0 cursor-pointer items-center gap-1.5 rounded-t-lg px-3 py-1.5 focus-visible:outline-none"
                style={{
                  background: isActive ? DEMO.panel : DEMO.panelMuted,
                  borderTop: `1.5px solid ${isActive ? s.color : DEMO.borderLight}`,
                  borderLeft: `1px solid ${DEMO.borderLight}`,
                  borderRight: `1px solid ${DEMO.borderLight}`,
                  borderBottom: isActive ? `1.5px solid ${DEMO.panel}` : "none",
                  marginBottom: isActive ? "-1px" : 0,
                  color: isActive ? DEMO.text : DEMO.muted,
                  minWidth: 88,
                }}
                initial={{ opacity: 0, scale: 0.9, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 3 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Icon size={10} style={{ color: isActive ? s.color : undefined, flexShrink: 0 }} aria-hidden />
                <span className="truncate font-mono text-[9px] font-semibold">{s.label}</span>
                <motion.span
                  onClick={(e) => closeTab(tabId, e)}
                  className="ml-auto shrink-0 cursor-pointer rounded pl-1"
                  style={{ color: DEMO.muted }}
                  whileHover={{ color: DEMO.text }}
                  whileTap={{ scale: 0.88 }}
                  aria-label={`Close ${s.label} tab`}
                >
                  <X size={9} />
                </motion.span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      <div id="tab-content" role="tabpanel" className="bg-white">
        <AnimatePresence mode="wait">
          {activeTab === null ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState onOpen={openTab} />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              className="grid grid-cols-1 gap-3 p-4 sm:p-5 lg:grid-cols-[1fr_1.1fr]"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex min-w-0 flex-col gap-2.5">
                <AgentChat messages={buildMessages(activeTab)} maxHeight={200} />
                <div className="grid grid-cols-2 gap-2.5">
                  <TrustScore
                    score={activeTab >= 8 ? 74 : 28}
                    label="Trust score"
                    showDelta={activeTab >= 8}
                    delta={activeTab >= 8 ? 46 : undefined}
                  />
                  <div
                    className="flex flex-col justify-center gap-1 rounded-xl p-2.5"
                    style={{ background: DEMO.panelBlue, border: `1px solid ${DEMO.borderLight}` }}
                  >
                    <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500">Step</p>
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: activeStep?.color ?? DEMO.primary }}
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        aria-hidden
                      />
                      <span className="font-mono text-[10px] font-medium text-blue-950">{activeStep?.label}</span>
                    </div>
                    <p className="text-[9px] leading-snug text-blue-600">{activeStep?.desc}</p>
                  </div>
                </div>
              </div>
              <div className="min-w-0">
                <TabVisual phase={activeTab} implProgress={implProgress} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab !== null && (
          <div className="px-5 pb-4" aria-hidden>
            <div className="flex items-center gap-2">
              <span className="w-14 font-mono text-[9px] text-blue-500">
                {activeTab + 1}/{STEPS.length}
              </span>
              <div className="h-0.5 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(37,99,235,0.08)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${DEMO.primary}, ${DEMO.primaryLight})` }}
                  animate={{ width: `${((activeTab + 1) / STEPS.length) * 100}%` }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className="font-mono text-[9px]" style={{ color: DEMO.primary }}>
                {Math.round(((activeTab + 1) / STEPS.length) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
