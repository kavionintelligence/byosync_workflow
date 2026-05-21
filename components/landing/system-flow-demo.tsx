"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SCENE_W = 1280;
const SCENE_H = 780;
const ZOOM_MIN = 0.38;
const ZOOM_MAX = 1.55;
const ZOOM_STEP = 1.14;

/* ─────────────────────────────────────────────────────────────────────────────
   SystemFlowDemo — embedded on the landing page.
   Full dark band (navy + cyan) so panels stay opaque/readable; scoped under #byosync-sf.
───────────────────────────────────────────────────────────────────────────── */
const SF_CSS = `
@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap");

/* ── container ─────────────────────────────────────── */
#byosync-sf {
  position: relative;
  overflow-x: hidden;
  background: #030712;
  color: #e2e8f0;
  font-family: "Open Sans", system-ui, sans-serif;
}
#byosync-sf * { box-sizing: border-box; margin: 0; padding: 0; }

/* cyan spotlight — matches brand accent on dark UI */
#byosync-sf::before {
  content: "";
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background: radial-gradient(ellipse 90% 55% at 50% -10%, rgba(34, 211, 238, 0.14), transparent 55%);
}

/* ── section header ─────────────────────────────────── */
#byosync-sf .sf-header {
  position: relative; z-index: 1;
  padding: 36px 40px 20px;
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
  border-bottom: 1px solid rgba(34, 211, 238, 0.22);
}
#byosync-sf .sf-eyebrow {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.35em; text-transform: uppercase;
  color: #22d3ee;
  margin-bottom: 16px;
}
#byosync-sf .sf-h2 {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800; letter-spacing: -0.025em; line-height: 1.1;
  color: #f8fafc;
  margin-bottom: 16px;
}
#byosync-sf .sf-h2 span {
  color: #38bdf8;
}
#byosync-sf .sf-subtitle {
  font-size: 15px; line-height: 1.65;
  color: rgba(186, 230, 253, 0.9);
  max-width: 560px; margin: 0 auto;
}

/* ── legend ─────────────────────────────────────────── */
#byosync-sf .sf-legend {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;
  margin-top: 24px;
  font-family: "JetBrains Mono", monospace;
  font-size: 10px; letter-spacing: 0.1em;
  color: rgba(125, 211, 252, 0.82);
  text-transform: uppercase;
}
#byosync-sf .sf-legend-row { display: flex; align-items: center; gap: 7px; }
#byosync-sf .sf-lg-dot {
  width: 8px; height: 8px; border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
  flex-shrink: 0;
}

/* ── scenario tabs ──────────────────────────────────── */
#byosync-sf .sf-nav-wrap {
  position: relative; z-index: 1;
}
#byosync-sf .sf-nav-arrow {
  position: absolute; top: 0; bottom: 1px; z-index: 10;
  width: 52px;
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; cursor: pointer;
  color: rgba(125, 211, 252, 0.55);
  font-size: 22px; font-weight: 300;
  transition: color 0.15s, opacity 0.2s;
  opacity: 1;
}
#byosync-sf .sf-nav-arrow:hover { color: #22d3ee; }
#byosync-sf .sf-nav-arrow.sf-nav-left  {
  left: 0;
  background: linear-gradient(to right, rgba(3, 7, 18, 0.98) 55%, transparent);
}
#byosync-sf .sf-nav-arrow.sf-nav-right {
  right: 0;
  background: linear-gradient(to left, rgba(3, 7, 18, 0.98) 55%, transparent);
}
#byosync-sf .sf-nav-arrow[data-hidden="true"] { opacity: 0; pointer-events: none; }
#byosync-sf .sf-scenarios {
  padding: 16px 40px 0;
  display: flex; gap: 0;
  border-bottom: 1px solid rgba(34, 211, 238, 0.18);
  overflow-x: auto; scrollbar-width: none;
}
#byosync-sf .sf-scenarios::-webkit-scrollbar { display: none; }
#byosync-sf .sf-tab {
  flex: 0 0 auto; padding: 12px 18px 14px;
  background: transparent; border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer; text-align: left;
  color: rgba(148, 163, 184, 0.88);
  transition: color 0.2s, border-color 0.2s;
  min-width: 168px;
}
#byosync-sf .sf-tab:hover { color: #cbd5e1; }
#byosync-sf .sf-tab.sf-active { color: #f1f5f9; border-bottom-color: #22d3ee; }
#byosync-sf .sf-tab .sf-sc-num {
  font-family: "JetBrains Mono", monospace; font-size: 10px;
  letter-spacing: 0.3em; color: rgba(125, 211, 252, 0.45);
}
#byosync-sf .sf-tab.sf-active .sf-sc-num { color: #22d3ee; }
#byosync-sf .sf-tab .sf-sc-title {
  font-size: 17px; font-weight: 700; margin-top: 4px; line-height: 1.2;
}
#byosync-sf .sf-tab.sf-active .sf-sc-title { color: #67e8f9; }
#byosync-sf .sf-tab .sf-sc-desc {
  font-size: 11px; color: rgba(186, 230, 253, 0.72); margin-top: 5px; line-height: 1.4;
}

/* ── stage layout ───────────────────────────────────── */
#byosync-sf .sf-stage {
  position: relative; z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 36%);
  gap: 0;
  min-height: 0;
  height: clamp(480px, calc(100vh - 220px), 780px);
  background: #020617;
  align-items: stretch;
}
#byosync-sf .sf-theatre {
  padding: 12px 16px 14px 32px;
  overflow: hidden;
  background: #020617;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* ── controls bar ───────────────────────────────────── */
#byosync-sf .sf-controls {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 8px; padding: 8px 12px;
  flex-shrink: 0; flex-wrap: wrap;
  background: rgba(2, 6, 23, 0.94);
  border: 1px solid rgba(34, 211, 238, 0.22);
  border-radius: 12px; backdrop-filter: blur(20px);
}
#byosync-sf .sf-btn {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
  padding: 9px 16px; border-radius: 8px; border: 1px solid transparent;
  cursor: pointer; transition: all 0.15s;
  display: inline-flex; align-items: center; gap: 7px; white-space: nowrap;
}
#byosync-sf .sf-btn-primary {
  background: linear-gradient(180deg, #67e8f9 0%, #22d3ee 100%);
  color: #020617;
}
#byosync-sf .sf-btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); }
#byosync-sf .sf-btn-ghost {
  background: transparent; color: rgba(186, 230, 253, 0.78);
  border-color: rgba(34, 211, 238, 0.28);
}
#byosync-sf .sf-btn-ghost:hover { color: #ffffff; border-color: #ffffff; }
#byosync-sf .sf-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }

#byosync-sf .sf-step-meter {
  margin-left: auto; display: flex; align-items: center; gap: 14px;
  font-family: "JetBrains Mono", monospace;
  font-size: 10.5px; color: rgba(186, 230, 253, 0.72); letter-spacing: 0.08em;
}
#byosync-sf .sf-step-meter strong {
  font-size: 16px; color: #ffffff; font-weight: 700; letter-spacing: 0;
}
#byosync-sf .sf-zoom-controls {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 6px;
  border: 1px solid rgba(34, 211, 238, 0.2);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.6);
}
#byosync-sf .sf-zoom-btn {
  padding: 6px 10px !important; min-width: 32px; justify-content: center;
}
#byosync-sf .sf-zoom-label {
  font-family: "JetBrains Mono", monospace;
  font-size: 10px; color: rgba(186, 230, 253, 0.75);
  min-width: 40px; text-align: center; letter-spacing: 0.06em;
}
#byosync-sf .sf-kbd-hint {
  font-family: "JetBrains Mono", monospace;
  font-size: 10px; color: rgba(148, 213, 234, 0.72); letter-spacing: 0.05em;
  white-space: nowrap; display: flex; align-items: center; gap: 4px;
}
#byosync-sf .sf-kbd-hint kbd {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 2px 6px; border-radius: 4px;
  background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(34, 211, 238, 0.25);
  color: rgba(186, 230, 253, 0.9); font-size: 10px; font-family: inherit;
}
#byosync-sf .sf-timeline {
  flex: 1; height: 2px; background: rgba(255,255,255,0.1);
  position: relative; border-radius: 2px; overflow: hidden; max-width: 200px;
}
#byosync-sf .sf-timeline-fill {
  position: absolute; top: 0; left: 0; bottom: 0;
  background: linear-gradient(90deg, #22d3ee, #67e8f9);
  width: 0%; transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
}

/* ── scene frame ────────────────────────────────────── */
#byosync-sf .sf-scene-frame {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: rgba(0,10,32,0.7);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 8px 10px 10px;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 12px 32px rgba(0,0,0,0.35);
  overflow: hidden;
  backdrop-filter: blur(10px);
}
#byosync-sf .sf-scene-viewport {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(0, 8, 28, 0.45);
  cursor: grab;
}
#byosync-sf .sf-scene-viewport.sf-panning { cursor: grabbing; }
#byosync-sf .sf-scene-inner {
  transform-origin: center center;
  transition: transform 0.18s ease;
  line-height: 0;
  flex-shrink: 0;
}
#byosync-sf .sf-scene-frame::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 80%);
}
#byosync-sf svg.sf-scene {
  width: 1280px;
  height: 780px;
  display: block;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

/* ── narration (above diagram) ──────────────────────── */
#byosync-sf .sf-narration {
  margin: 0 0 8px; padding: 10px 14px;
  background: rgba(0,16,48,0.5);
  border: 1px solid rgba(255,255,255,0.1);
  border-left: 3px solid #22d3ee;
  border-radius: 8px;
  font-size: 13px; font-style: italic;
  line-height: 1.45; color: rgba(207,250,254,0.85);
  flex-shrink: 0;
  overflow: visible;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: anywhere;
}
#byosync-sf .sf-narration::before {
  content: "Live narration"; display: block;
  font-family: "JetBrains Mono", monospace; font-style: normal;
  font-size: 9.5px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase;
  color: #22d3ee; margin-bottom: 8px;
}
#byosync-sf .sf-narration strong { font-style: normal; color: #67e8f9; }

/* ── dossier panel (narration + step detail) ───────── */
#byosync-sf .sf-dossier {
  display: flex;
  flex-direction: column;
  background: #020617;
  border-left: 1px solid rgba(34, 211, 238, 0.18);
  padding: 14px 16px 18px;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  max-height: none;
  height: 100%;
  backdrop-filter: blur(12px);
}
#byosync-sf .sf-narration-in-panel {
  flex-shrink: 0;
  margin: 0 0 10px;
  max-height: none;
  overflow: visible;
}
#byosync-sf .sf-narration-in-panel::before {
  margin-bottom: 6px;
}
#byosync-sf #sf-dossierBody {
  flex: 0 1 auto;
  min-height: 0;
  overflow: visible;
}
#byosync-sf .sf-dossier::-webkit-scrollbar { width: 4px; }
#byosync-sf .sf-dossier::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15); border-radius: 2px;
}
#byosync-sf .sf-dossier-head {
  flex-shrink: 0;
  font-family: "JetBrains Mono", monospace; font-size: 9.5px;
  letter-spacing: 0.35em; text-transform: uppercase;
  color: #22d3ee; margin-bottom: 14px;
  display: flex; align-items: center; gap: 10px;
}
#byosync-sf .sf-dossier-head::after {
  content: ""; flex: 1; height: 1px;
  background: linear-gradient(90deg, #22d3ee, transparent);
}

/* ── entry cards ────────────────────────────────────── */
#byosync-sf .sf-entry {
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(34, 211, 238, 0.16);
  border-radius: 10px; padding: 12px 14px; margin-bottom: 10px;
  position: relative; overflow: visible;
}
#byosync-sf .sf-entry::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, #0e7490, #22d3ee, #67e8f9);
}
#byosync-sf .sf-entry-num {
  font-family: "JetBrains Mono", monospace; font-size: 10px;
  letter-spacing: 0.3em; color: rgba(125, 211, 252, 0.72); text-transform: uppercase;
}
#byosync-sf .sf-entry-title {
  font-size: 16px; font-weight: 800; line-height: 1.2;
  margin: 4px 0 8px; color: #ffffff; letter-spacing: -0.01em;
}
#byosync-sf .sf-entry-title em { font-style: italic; color: #67e8f9; }
#byosync-sf .sf-entry-desc { font-size: 12px; line-height: 1.5; color: rgba(226, 232, 240, 0.9); }
#byosync-sf .sf-entry-desc strong { color: #ffffff; font-weight: 700; }

/* crypto block */
#byosync-sf .sf-crypto-block {
  margin-top: 12px; padding: 12px 14px;
  background: rgba(34,211,238,0.05);
  border: 1px solid rgba(34,211,238,0.2);
  border-radius: 8px;
  font-family: "JetBrains Mono", monospace; font-size: 11px;
  line-height: 1.7; color: #67e8f9;
  white-space: pre-wrap; word-break: break-word; position: relative;
}
#byosync-sf .sf-crypto-block::before {
  content: "CRYPTO"; position: absolute; top: -8px; left: 12px;
  background: #020617; padding: 1px 7px; font-size: 8.5px;
  letter-spacing: 0.25em; color: #22d3ee;
}

/* responsibility block */
#byosync-sf .sf-resp-block {
  margin-top: 12px; padding: 12px 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px; font-size: 12px; line-height: 1.55;
  color: rgba(207,250,254,0.7); position: relative;
}
#byosync-sf .sf-resp-block::before {
  content: "RESPONSIBILITY"; position: absolute; top: -8px; left: 12px;
  background: #020617; padding: 1px 7px; font-size: 8.5px;
  letter-spacing: 0.25em; color: rgba(186, 230, 253, 0.65);
}
#byosync-sf .sf-resp-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 7px; }
#byosync-sf .sf-tag {
  font-family: "JetBrains Mono", monospace; font-size: 9px; font-weight: 700;
  letter-spacing: 0.1em; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;
}
#byosync-sf .sf-tag-dpdp { background: rgba(37,99,235,0.15); color: #93c5fd; border: 1px solid rgba(59,130,246,0.35); }
#byosync-sf .sf-tag-soc2 { background: rgba(52,211,153,0.15); color: #6ee7b7; border: 1px solid rgba(52,211,153,0.3); }
#byosync-sf .sf-tag-pci  { background: rgba(236,72,153,0.15); color: #f9a8d4; border: 1px solid rgba(236,72,153,0.3); }

/* ── SVG animation helpers ──────────────────────────── */
#byosync-sf .sf-node-active rect.sf-body,
#byosync-sf .sf-node-active rect.sf-frame,
#byosync-sf .sf-node-active path.sf-frame,
#byosync-sf #sf-node-enclave.sf-node-active rect.sf-frame {
  filter: drop-shadow(0 0 16px currentColor);
  stroke-dasharray: 5 4;
  animation: sf-dash 0.9s linear infinite;
}
@keyframes sf-dash { to { stroke-dashoffset: -18; } }
#byosync-sf .sf-pulse-ring { animation: sf-pulse 1.4s ease-out infinite; transform-origin: center; }
@keyframes sf-pulse {
  0%   { r: 5; opacity: 0.85; }
  100% { r: 28; opacity: 0; }
}
#byosync-sf .sf-flow-stroke {
  filter: url(#sf-flow-glow);
  pointer-events: none;
}
#byosync-sf .sf-flow-trail {
  pointer-events: none;
}
#byosync-sf .sf-route-line.sf-route-lit {
  opacity: 1 !important;
  filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.65));
}

/* User agent + A2A paths only for scenario 06 (agent-to-agent) */
#byosync-sf #sf-node-userAgent,
#byosync-sf #sf-lines-a2a,
#byosync-sf #sf-guide-a2a {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}
#byosync-sf.sf-scene-a2a #sf-node-userAgent {
  opacity: 1;
  pointer-events: auto;
  visibility: visible;
}
#byosync-sf.sf-scene-a2a #sf-lines-a2a {
  opacity: 0.55;
  pointer-events: none;
  visibility: visible;
}
#byosync-sf.sf-scene-a2a #sf-guide-a2a {
  opacity: 1;
  visibility: visible;
}
#byosync-sf .sf-legend-a2a-row { display: none; }
#byosync-sf.sf-scene-a2a .sf-legend-a2a-row { display: flex; }

/* ── fullscreen (/system-flow): one screen, diagram-first ── */
#byosync-sf.sf-fullscreen {
  height: calc(100vh - 3.5rem);
  min-height: 520px;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
#byosync-sf.sf-fullscreen .sf-header { display: none; }
#byosync-sf.sf-fullscreen .sf-top-strip {
  flex-shrink: 0;
  border-bottom: 1px solid rgba(34, 211, 238, 0.15);
  background: rgba(2, 6, 23, 0.95);
}
#byosync-sf.sf-fullscreen .sf-legend {
  margin: 0;
  padding: 6px 16px 4px;
  gap: 10px 14px;
  font-size: 8px;
  justify-content: flex-start;
}
#byosync-sf.sf-fullscreen .sf-nav-wrap { flex-shrink: 0; }
#byosync-sf.sf-fullscreen .sf-scenarios {
  padding: 0 36px;
  border-bottom: none;
}
#byosync-sf.sf-fullscreen .sf-tab {
  min-width: 0;
  padding: 6px 12px 8px;
}
#byosync-sf.sf-fullscreen .sf-tab .sf-sc-num { font-size: 8px; letter-spacing: 0.2em; }
#byosync-sf.sf-fullscreen .sf-tab .sf-sc-title { font-size: 12px; margin-top: 2px; }
#byosync-sf.sf-fullscreen .sf-tab .sf-sc-desc { display: none; }
#byosync-sf.sf-fullscreen .sf-tab.sf-active .sf-sc-desc {
  display: block;
  font-size: 9px;
  margin-top: 2px;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
#byosync-sf.sf-fullscreen .sf-stage {
  flex: 1;
  min-height: 0;
  height: auto;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 38%);
  align-items: stretch;
}
#byosync-sf.sf-fullscreen .sf-theatre {
  padding: 6px 10px 8px 14px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
#byosync-sf.sf-fullscreen .sf-controls {
  margin-bottom: 4px;
  padding: 5px 8px;
  gap: 6px;
  flex-shrink: 0;
}
#byosync-sf.sf-fullscreen .sf-btn { padding: 6px 10px; font-size: 9px; }
#byosync-sf.sf-fullscreen .sf-kbd-hint { display: none; }
#byosync-sf.sf-fullscreen .sf-scene-frame {
  flex: 1;
  min-height: 180px;
}
#byosync-sf.sf-fullscreen .sf-narration-in-panel {
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.5;
}
#byosync-sf.sf-fullscreen .sf-narration-in-panel::before { font-size: 9px; }
#byosync-sf.sf-fullscreen .sf-dossier {
  padding: 10px 12px 12px;
}
#byosync-sf.sf-fullscreen .sf-dossier-head {
  flex-shrink: 0;
  margin-bottom: 8px;
  font-size: 9px;
}
#byosync-sf.sf-fullscreen .sf-entry-title {
  font-size: 14px;
}
#byosync-sf.sf-fullscreen .sf-entry-desc {
  font-size: 11.5px;
  line-height: 1.55;
}
#byosync-sf.sf-fullscreen .sf-crypto-block {
  font-size: 10px;
  line-height: 1.6;
}
#byosync-sf.sf-fullscreen .sf-resp-block {
  font-size: 11px;
  line-height: 1.5;
}
#byosync-sf.sf-fullscreen .sf-zoom-btn {
  min-width: 28px;
  padding: 5px 8px !important;
  font-size: 14px !important;
  line-height: 1;
}
#byosync-sf.sf-fullscreen .sf-zoom-fit {
  font-size: 9px !important;
  letter-spacing: 0.12em;
  padding: 5px 8px !important;
}

/* ── responsive ─────────────────────────────────────── */
@media (max-width: 1280px) {
  #byosync-sf.sf-embedded .sf-stage {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 40%);
    height: clamp(520px, calc(100vh - 200px), 820px);
  }
}
@media (max-width: 960px) {
  #byosync-sf.sf-embedded .sf-stage {
    grid-template-columns: 1fr;
    height: auto;
    max-height: none;
  }
  #byosync-sf.sf-embedded .sf-theatre { min-height: clamp(360px, 52vh, 560px); }
  #byosync-sf.sf-embedded .sf-dossier {
    border-left: none;
    border-top: 1px solid rgba(34, 211, 238, 0.18);
    max-height: none;
    min-height: 280px;
    height: auto;
  }
  #byosync-sf.sf-fullscreen .sf-stage {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 40%);
  }
  #byosync-sf.sf-fullscreen .sf-dossier {
    max-height: none;
    height: 100%;
    border-left: 1px solid rgba(34, 211, 238, 0.18);
    border-top: none;
  }
}
@media (max-width: 1024px) {
  #byosync-sf .sf-tab { min-width: 170px; padding: 12px 20px 16px; }
  #byosync-sf .sf-tab .sf-sc-title { font-size: 15px; }
  #byosync-sf .sf-stage { min-height: 640px; }
}
@media (max-width: 720px) {
  #byosync-sf .sf-header { padding: 40px 20px 0; }
  #byosync-sf .sf-scenarios { padding: 20px 16px 0; }
  #byosync-sf .sf-tab { min-width: 148px; padding: 10px 14px 14px; }
  #byosync-sf .sf-tab .sf-sc-title { font-size: 14px; }
  #byosync-sf .sf-theatre { padding: 16px 18px 24px; }
  #byosync-sf .sf-dossier { padding: 20px; }
  #byosync-sf .sf-stage { min-height: 520px; }
}
@media (max-width: 480px) {
  #byosync-sf .sf-h2 { font-size: clamp(22px, 6.5vw, 32px); }
  #byosync-sf .sf-subtitle { font-size: 14px; padding: 0 4px; }
  #byosync-sf .sf-legend { gap: 12px 16px; font-size: 9px; }
  #byosync-sf .sf-nav-arrow { width: 40px; font-size: 18px; }
}
`;

type SystemFlowDemoProps = { mode?: "embedded" | "fullscreen" };

export const SystemFlowDemo = ({ mode = "embedded" }: SystemFlowDemoProps) => {
  const isFullscreen = mode === "fullscreen";
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.62);

  const computeFitZoom = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return 0.62;
    const pad = 12;
    const w = Math.max(160, vp.clientWidth - pad);
    const h = Math.max(160, vp.clientHeight - pad);
    return Math.min(w / SCENE_W, h / SCENE_H, 1) * 0.96;
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(ZOOM_MAX, z * ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(ZOOM_MIN, z / ZOOM_STEP));
  }, []);

  const zoomFit = useCallback(() => {
    setZoom(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, computeFitZoom())));
  }, [computeFitZoom]);

  useEffect(() => {
    const t1 = window.setTimeout(zoomFit, isFullscreen ? 280 : 120);
    const t2 = isFullscreen ? window.setTimeout(zoomFit, 750) : undefined;
    return () => {
      window.clearTimeout(t1);
      if (t2) window.clearTimeout(t2);
    };
  }, [zoomFit, isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  }, [zoomIn, zoomOut]);

  useEffect(() => {
    const containerOrNull = containerRef.current;
    if (!containerOrNull) return;
    const container: HTMLDivElement = containerOrNull;

    const SVG_NS = "http://www.w3.org/2000/svg";
    const sceneEl = container.querySelector<SVGSVGElement>("#sf-scene");
    if (!sceneEl) return;
    const scene: SVGSVGElement = sceneEl;

    /* ── state ── */
    let currentScenario = "vault_inception";
    let currentStep = 0;
    let playing = false;
    let playTimeout: ReturnType<typeof setTimeout> | null = null;

    /* ── device geometry (v3) ──
       Center spine: ByoSync DB → Nitro enclave → User vault
       Right: Company A (top) · Company B (bottom) · lineage A→B via enclave
       Left-mid: User Agent (A2A client) between phone and DB
    */
    const DEVICES: Record<string, { cx: number; cy: number; w: number; h: number; colorHex: string }> = {
      phone:     { cx:130,  cy:448, w:200, h:400, colorHex:"#5dc97e" },
      userAgent: { cx:348,  cy:268, w:152, h:96,  colorHex:"#a78bfa" },
      byosync:   { cx:600,  cy:128, w:264, h:152, colorHex:"#2563eb" },
      enclave:   { cx:600,  cy:358, w:252, h:100, colorHex:"#f472b6" },
      vault:     { cx:600,  cy:648, w:300, h:130, colorHex:"#00e5d3" },
      desktop:   { cx:1040, cy:228, w:280, h:190, colorHex:"#38bdf8" },
      companyB:  { cx:1040, cy:538, w:248, h:92,  colorHex:"#94a3b8" },
    };
    const ANCHOR: Record<string, { x:number; y:number }> = {
      phone:       { x:230, y:448 },
      agent:       { x:348, y:268 },
      agentRight:  { x:424, y:268 },
      agentBottom: { x:348, y:316 },
      byoLeft:     { x:468, y:118 },
      byoRight:    { x:732, y:118 },
      byoBottom:   { x:600, y:196 },
      enclave:     { x:600, y:358 },
      enclaveLeft: { x:484, y:358 },
      enclaveRight:{ x:716, y:358 },
      enclaveTop:  { x:600, y:308 },
      enclaveBottom:{ x:600, y:408 },
      desktop:     { x:900, y:228 },
      desktopLeft: { x:900, y:228 },
      coB:         { x:900, y:538 },
      coBLeft:     { x:916, y:538 },
      vaultTop:    { x:600, y:583 },
      vaultBottom: { x:600, y:713 },
    };

    /* ── svg helpers ── */
    function el(tag: string, attrs: Record<string,string|number> = {}, children: SVGElement[] = []) {
      const e = document.createElementNS(SVG_NS, tag) as SVGElement;
      for (const k in attrs) e.setAttribute(k, String(attrs[k]));
      for (const c of children) if (c) e.appendChild(c);
      return e;
    }
    function t(x: number, y: number, str: string, opts: Record<string,string|number> = {}) {
      const e = el("text", {
        x, y,
        "text-anchor": opts.anchor || "start",
        "font-family": opts.family || "Open Sans, sans-serif",
        "font-size":   opts.size   || 11,
        "font-weight": opts.weight || 500,
        fill: opts.fill || "#e2e8f0",
        "letter-spacing": opts.tracking || "0",
      });
      e.textContent = str;
      return e as SVGTextElement;
    }

    /* ── static scene ── */
    function drawScene() {
      while (scene.firstChild) scene.removeChild(scene.firstChild);

      const defs = el("defs");
      defs.innerHTML = `
        <linearGradient id="sf-phoneScreen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0c1820"/><stop offset="100%" stop-color="#0f2628"/>
        </linearGradient>
        <linearGradient id="sf-phoneBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e2a3a"/><stop offset="100%" stop-color="#0d1520"/>
        </linearGradient>
        <linearGradient id="sf-desktopScreen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0a1020"/><stop offset="100%" stop-color="#10182e"/>
        </linearGradient>
        <linearGradient id="sf-desktopBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#152040"/><stop offset="100%" stop-color="#0a1020"/>
        </linearGradient>

        <!-- ByoSync cloud — blue -->
        <linearGradient id="sf-cloudGrad" x1="0%" y1="0%" x2="10%" y2="100%">
          <stop offset="0%"   stop-color="#1e0f62" stop-opacity="0.98"/>
          <stop offset="50%"  stop-color="#14093e" stop-opacity="0.97"/>
          <stop offset="100%" stop-color="#090620" stop-opacity="0.96"/>
        </linearGradient>
        <linearGradient id="sf-cloudHeaderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#3b1d8a" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#1e0f50" stop-opacity="0.9"/>
        </linearGradient>
        <!-- Vault — deep teal gradient -->
        <linearGradient id="sf-vaultGrad" x1="0%" y1="0%" x2="10%" y2="100%">
          <stop offset="0%"   stop-color="#042028" stop-opacity="0.98"/>
          <stop offset="100%" stop-color="#021018" stop-opacity="0.97"/>
        </linearGradient>
        <linearGradient id="sf-vaultTopAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#00e5d3" stop-opacity="0"/>
          <stop offset="30%"  stop-color="#00e5d3" stop-opacity="0.9"/>
          <stop offset="70%"  stop-color="#22d3ee" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#22d3ee" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="sf-cloudTopAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#1d4ed8" stop-opacity="0"/>
          <stop offset="30%"  stop-color="#60a5fa" stop-opacity="0.8"/>
          <stop offset="70%"  stop-color="#3b82f6" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="sf-enclaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b1034" stop-opacity="0.98"/>
          <stop offset="100%" stop-color="#1a0a18" stop-opacity="0.98"/>
        </linearGradient>

        <!-- glow = blur only, drawn behind shape -->
        <filter id="sf-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="sf-glow-soft" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="8"/>
        </filter>
        <filter id="sf-glow-strong" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="14"/>
        </filter>
        <filter id="sf-flow-glow" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>`;
      scene.appendChild(defs);

      drawFlowGuide();
      drawConnectionLines();
      drawVault();
      drawEnclave();
      drawByoSyncCloud();
      drawCompanyB();
      drawDesktop();
      drawUserAgent();
      drawPhone();
      scene.appendChild(el("g", { id: "sf-packets" }));
    }

    function drawFlowGuide() {
      const g = el("g", { id: "sf-guide" });
      const { byosync, enclave, vault } = DEVICES;
      const byoB = byosync.cy + byosync.h / 2;
      const encT = enclave.cy - enclave.h / 2;
      const encB = enclave.cy + enclave.h / 2;
      const vltT = vault.cy - vault.h / 2;
      const gapX = 518;

      g.appendChild(t(600, 22, "READ DOWN: DB (relay)  →  Nitro enclave  →  User vault", {
        anchor: "middle", family: "JetBrains Mono,monospace", size: 8.5,
        fill: "rgba(148,163,184,0.65)", tracking: "0.06em",
      }));

      const gaps: { y: number; label: string; sub: string; color: string }[] = [
        { y: (byoB + encT) / 2, label: "③ vsock", sub: "ciphertext in", color: "#f472b6" },
        { y: (encB + vltT) / 2, label: "⑤ vault", sub: "PII blob", color: "#34d399" },
      ];
      gaps.forEach(gap => {
        g.appendChild(el("rect", {
          x: gapX - 4, y: gap.y - 18, width: 88, height: 36, rx: 6,
          fill: "rgba(2,6,23,0.85)", stroke: "rgba(255,255,255,0.08)", "stroke-width": 1,
        }));
        g.appendChild(t(gapX + 40, gap.y - 4, gap.label, {
          anchor: "middle", family: "JetBrains Mono,monospace", size: 9, weight: 700, fill: gap.color,
        }));
        g.appendChild(t(gapX + 40, gap.y + 10, gap.sub, {
          anchor: "middle", family: "Open Sans,sans-serif", size: 7.5, fill: "rgba(226,232,240,0.6)",
        }));
      });

      g.appendChild(el("rect", {
        x: 18, y: 668, width: 318, height: 98, rx: 8,
        fill: "rgba(2,6,23,0.92)", stroke: "rgba(34,211,238,0.2)", "stroke-width": 1,
      }));
      g.appendChild(t(32, 686, "LINE COLORS (flowing packets)", {
        family: "JetBrains Mono,monospace", size: 8, weight: 700, fill: "rgba(34,211,238,0.75)", tracking: "0.1em",
      }));
      const leg = [
        { c: "#22d3ee", t: "Cyan — phone / TLS hybrid encrypt" },
        { c: "#f472b6", t: "Pink — vsock into Nitro enclave" },
        { c: "#34d399", t: "Green — vault encrypt / decrypt" },
        { c: "#fbbf24", t: "Amber — lineage A→B · payment intent" },
        { c: "#a78bfa", t: "Purple — user agent → remote agent (A2A)", a2aOnly: true },
      ];
      leg.forEach((item, i) => {
        if (item.a2aOnly) {
          const a2aLeg = el("g", { id: "sf-guide-a2a" });
          a2aLeg.appendChild(el("circle", { cx: 32, cy: 704 + i * 13, r: 3.5, fill: item.c }));
          a2aLeg.appendChild(t(44, 706 + i * 13, item.t, { size: 8, fill: "rgba(226,232,240,0.8)" }));
          g.appendChild(a2aLeg);
          return;
        }
        g.appendChild(el("circle", { cx: 32, cy: 704 + i * 13, r: 3.5, fill: item.c }));
        g.appendChild(t(44, 706 + i * 13, item.t, { size: 8, fill: "rgba(226,232,240,0.8)" }));
      });
      scene.appendChild(g);
    }

    /* route registry: packet animation follows these paths (same geometry as visible lines) */
    const ROUTE_LOOKUP: Record<string, string> = {};

    function routeKey(from: string, to: string) {
      return `${from}|${to}`;
    }

    function registerRoute(
      parent: SVGElement,
      id: string,
      from: string,
      to: string,
      d: string,
      attrs: Record<string, string | number>,
    ) {
      ROUTE_LOOKUP[routeKey(from, to)] = id;
      parent.appendChild(el("path", {
        id: `sf-route-${id}`,
        class: "sf-route-line",
        "data-route-from": from,
        "data-route-to": to,
        d,
        fill: "none",
        ...attrs,
      }));
    }

    function drawConnectionLines() {
      const g = el("g", { id: "sf-lines", opacity: 0.5 });
      const gA2a = el("g", { id: "sf-lines-a2a" });
      const stroke = "rgba(103,232,249,0.45)";
      const dash = "3 6";
      const vsock = "rgba(244,114,182,0.6)";
      const vsockDash = "4 5";
      const vaultStroke = "rgba(52,211,153,0.55)";
      const lineageStroke = "rgba(251,191,36,0.5)";
      const agentStroke = "rgba(167,139,250,0.5)";

      registerRoute(gA2a, "phone-agent", "phone", "agent",
        `M ${ANCHOR.phone.x} ${ANCHOR.phone.y - 60} C 300 340,340 290,${ANCHOR.agent.x} ${ANCHOR.agent.y}`,
        { stroke: agentStroke, "stroke-width": 1, "stroke-dasharray": "2 5" });
      registerRoute(gA2a, "agent-byo", "agent", "byoLeft",
        `M ${ANCHOR.agentRight.x} ${ANCHOR.agentRight.y} C 500 200,520 150,${ANCHOR.byoLeft.x} ${ANCHOR.byoLeft.y}`,
        { stroke: agentStroke, "stroke-width": 1.1, "stroke-dasharray": dash });
      registerRoute(gA2a, "agent-desktop", "agent", "desktop",
        `M ${ANCHOR.agentRight.x} ${ANCHOR.agentRight.y} C 620 280,750 260,${ANCHOR.desktopLeft.x} ${ANCHOR.desktopLeft.y}`,
        { stroke: agentStroke, "stroke-width": 1, "stroke-dasharray": "3 6", opacity: 0.65 });

      registerRoute(g, "phone-byo", "phone", "byoLeft",
        `M ${ANCHOR.phone.x} ${ANCHOR.phone.y} C 360 420,420 180,${ANCHOR.byoLeft.x} ${ANCHOR.byoLeft.y}`,
        { stroke, "stroke-width": 1.2, "stroke-dasharray": dash });
      registerRoute(g, "byo-enclave-down", "byoBottom", "enclaveTop",
        `M ${ANCHOR.byoBottom.x} ${ANCHOR.byoBottom.y} L ${ANCHOR.enclaveTop.x} ${ANCHOR.enclaveTop.y}`,
        { stroke: vsock, "stroke-width": 1.5, "stroke-dasharray": vsockDash });
      registerRoute(g, "enclave-byo-up", "enclaveTop", "byoBottom",
        `M ${ANCHOR.enclaveTop.x - 10} ${ANCHOR.enclaveTop.y} L ${ANCHOR.byoBottom.x - 10} ${ANCHOR.byoBottom.y}`,
        { stroke: vsock, "stroke-width": 1.2, "stroke-dasharray": "2 6", opacity: 0.75 });
      registerRoute(g, "enclave-vault-down", "enclaveBottom", "vaultTop",
        `M ${ANCHOR.enclaveBottom.x} ${ANCHOR.enclaveBottom.y} L ${ANCHOR.vaultTop.x} ${ANCHOR.vaultTop.y}`,
        { stroke: vaultStroke, "stroke-width": 1.4, "stroke-dasharray": vsockDash });
      registerRoute(g, "vault-enclave-up", "vaultTop", "enclaveBottom",
        `M ${ANCHOR.vaultTop.x + 10} ${ANCHOR.vaultTop.y} L ${ANCHOR.enclaveBottom.x + 10} ${ANCHOR.enclaveBottom.y}`,
        { stroke: vaultStroke, "stroke-width": 1.1, "stroke-dasharray": "2 5", opacity: 0.7 });
      registerRoute(g, "byo-desktop", "byoRight", "desktop",
        `M ${ANCHOR.byoRight.x} ${ANCHOR.byoRight.y} C 820 180,860 240,${ANCHOR.desktop.x} ${ANCHOR.desktop.y}`,
        { stroke, "stroke-width": 1.2, "stroke-dasharray": dash });
      registerRoute(g, "enclave-desktop", "enclaveRight", "desktop",
        `M ${ANCHOR.enclaveRight.x} ${ANCHOR.enclaveRight.y} C 780 380,820 300,${ANCHOR.desktop.x} ${ANCHOR.desktop.y}`,
        { stroke: "rgba(52,211,153,0.4)", "stroke-width": 1, "stroke-dasharray": "3 5" });
      registerRoute(g, "desktop-byo-lineage", "desktop", "byoRight",
        `M ${ANCHOR.desktop.x} ${ANCHOR.desktop.y + 40} C 920 320,880 200,${ANCHOR.byoRight.x} ${ANCHOR.byoRight.y}`,
        { stroke: lineageStroke, "stroke-width": 1.1, "stroke-dasharray": "4 4" });
      registerRoute(g, "enclave-coB", "enclaveRight", "coB",
        `M ${ANCHOR.enclaveRight.x} ${ANCHOR.enclaveRight.y} C 820 480,880 520,${ANCHOR.coBLeft.x} ${ANCHOR.coBLeft.y}`,
        { stroke: lineageStroke, "stroke-width": 1.2, "stroke-dasharray": "4 4" });
      registerRoute(g, "byo-coB", "byoRight", "coB",
        `M ${ANCHOR.byoRight.x} ${ANCHOR.byoRight.y} C 860 360,900 460,${ANCHOR.coBLeft.x} ${ANCHOR.coBLeft.y}`,
        { stroke: lineageStroke, "stroke-width": 1, "stroke-dasharray": "4 4", opacity: 0.55 });
      registerRoute(g, "phone-vault", "phone", "vaultTop",
        `M ${ANCHOR.phone.x} ${ANCHOR.phone.y + 80} C 280 620,400 660,${ANCHOR.vaultTop.x - 80} ${ANCHOR.vaultTop.y}`,
        { stroke: "rgba(103,232,249,0.35)", "stroke-width": 1.2, "stroke-dasharray": "2 8" });

      scene.appendChild(g);
      scene.appendChild(gA2a);
    }

    function drawByoSyncCloud() {
      const g = el("g", { id:"sf-node-byosync", class:"sf-device" });
      const { cx, cy, w, h } = DEVICES.byosync;
      const x = cx - w/2, y = cy - h/2;

      const cp = `M ${x+22} ${y+h} L ${x+w-22} ${y+h}
        Q ${x+w} ${y+h} ${x+w} ${y+h-22}
        L ${x+w} ${y+82}
        C ${x+w} ${y+66} ${x+w-4} ${y+56} ${x+w-22} ${y+51}
        C ${x+w-32} ${y+29} ${x+w-82} ${y+18} ${x+w-102} ${y+27}
        C ${x+w-118} ${y+11} ${x+w-148} ${y+2} ${cx} ${y+8}
        C ${x+148} ${y+2} ${x+118} ${y+11} ${x+102} ${y+27}
        C ${x+82} ${y+18} ${x+32} ${y+29} ${x+22} ${y+51}
        C ${x+4} ${y+56} ${x} ${y+66} ${x} ${y+82}
        L ${x} ${y+h-22}
        Q ${x} ${y+h} ${x+22} ${y+h} Z`;

      g.appendChild(el("path", { d:cp, fill:"rgba(100,60,220,0.22)", transform:"translate(0,8)",
        filter:"url(#sf-glow-strong)" }));
      g.appendChild(el("path", { d:cp, fill:"url(#sf-cloudGrad)",
        stroke:"rgba(96,165,250,0.5)", "stroke-width":1.6, "stroke-dasharray":"6 4", class:"sf-frame" }));

      g.appendChild(el("rect", { x:x+14, y:y+52, width:w-28, height:26, rx:7,
        fill:"url(#sf-cloudHeaderGrad)" }));
      g.appendChild(t(x+28, y+68, "BYOSYNC DB · PARENT RELAY", { family:"JetBrains Mono,monospace",
        size:9.5, weight:700, fill:"#93c5fd", tracking:"0.14em" }));
      g.appendChild(t(x+w-18, y+68, "untrusted", { anchor:"end", family:"Open Sans,sans-serif",
        size:9, weight:600, fill:"rgba(148,163,184,0.7)" }));
      g.appendChild(t(cx, y+82, "Lineage ledger · never plaintext", {
        anchor:"middle", family:"Open Sans,sans-serif", size:7.5, fill:"rgba(186,230,253,0.55)",
      }));

      const dbTiles = [
        { name:"Lineage ledger", color:"#fbbf24" },
        { name:"Hash-chain audit", color:"#fb923c" },
        { name:"Consent + tokens", color:"#3b82f6" },
        { name:"Google proxy", color:"#22d3ee" },
      ];
      const pTileW = (w - 40) / 2;
      const pTileH = 22;
      const tilesY = y + 96;
      const tileGap = 6;
      dbTiles.forEach((s, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const tx = x + 16 + col * (pTileW + 8);
        const ty = tilesY + row * (pTileH + tileGap);
        g.appendChild(el("rect", { x:tx, y:ty, width:pTileW, height:pTileH, rx:5,
          fill:"rgba(255,255,255,0.02)", stroke:`${s.color}33`, "stroke-width":1 }));
        g.appendChild(t(tx + 8, ty + 14, s.name, { family:"Open Sans,sans-serif",
          size:9, weight:600, fill:"#cbd5e1" }));
      });

      const relayY = tilesY + 2 * (pTileH + tileGap) + 10;
      g.appendChild(t(cx, relayY, "relay only — decrypt happens below ↓", {
        anchor:"middle", family:"Open Sans,sans-serif", size:8.5, fill:"rgba(186,230,253,0.55)",
      }));
      scene.appendChild(g);
    }

    function drawEnclave() {
      const g = el("g", { id:"sf-node-enclave", class:"sf-device" });
      const { cx, cy, w, h } = DEVICES.enclave;
      const x = cx - w/2, y = cy - h/2;

      g.appendChild(el("rect", {
        x:x - 6, y:y - 6, width:w + 12, height:h + 12, rx:16,
        fill:"rgba(244,114,182,0.14)", filter:"url(#sf-glow-soft)",
      }));
      g.appendChild(el("rect", {
        x, y, width:w, height:h, rx:14,
        fill:"url(#sf-enclaveGrad)",
        stroke:"#f472b6", "stroke-width":2.4, class:"sf-frame",
      }));
      g.appendChild(el("rect", {
        x:x + 12, y:y + 10, width:w - 24, height:22, rx:6,
        fill:"rgba(244,114,182,0.18)", stroke:"rgba(244,114,182,0.4)", "stroke-width":1,
      }));
      g.appendChild(t(cx, y + 26, "NITRO ENCLAVE", {
        anchor:"middle", family:"JetBrains Mono,monospace",
        size:11, weight:700, fill:"#fbcfe8", tracking:"0.18em",
      }));
      g.appendChild(t(cx, y + 38, "Only place plaintext exists · wiped on exit", {
        anchor:"middle", family:"Open Sans,sans-serif", size:7.5, fill:"rgba(251,207,232,0.75)",
      }));

      const ops = [
        { name:"hybridDecrypt", color:"#f472b6" },
        { name:"BCH verify", color:"#c084fc" },
        { name:"PII decrypt", color:"#ec4899" },
        { name:"re-encrypt", color:"#34d399" },
      ];
      const tileW = (w - 32) / 2;
      const tileH = 20;
      ops.forEach((s, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const tx = x + 14 + col * (tileW + 4);
        const ty = y + 46 + row * (tileH + 4);
        g.appendChild(el("rect", { x:tx, y:ty, width:tileW, height:tileH, rx:5,
          fill:"rgba(0,0,0,0.28)", stroke:`${s.color}55`, "stroke-width":1 }));
        g.appendChild(t(tx + 6, ty + 13, s.name, { family:"JetBrains Mono,monospace",
          size:8.5, weight:600, fill:"#fce7f3" }));
      });

      scene.appendChild(g);
    }

    function drawUserAgent() {
      const g = el("g", { id:"sf-node-userAgent", class:"sf-device" });
      const { cx, cy, w, h } = DEVICES.userAgent;
      const x = cx - w/2, y = cy - h/2;
      g.appendChild(el("rect", {
        x:x-3, y:y-3, width:w+6, height:h+6, rx:12,
        fill:"rgba(167,139,250,0.12)", filter:"url(#sf-glow-soft)",
      }));
      g.appendChild(el("rect", {
        x, y, width:w, height:h, rx:10,
        fill:"rgba(30,20,50,0.95)", stroke:"#a78bfa", "stroke-width":1.8, class:"sf-frame",
      }));
      g.appendChild(t(cx, y+22, "USER AGENT", {
        anchor:"middle", family:"JetBrains Mono,monospace", size:9, weight:700, fill:"#ddd6fe", tracking:"0.14em",
      }));
      g.appendChild(t(cx, y+36, "A2A client · mandate + KYA", {
        anchor:"middle", family:"Open Sans,sans-serif", size:7.5, fill:"rgba(196,181,253,0.75)",
      }));
      ([
        { label:"VERIFY", sub:"boolean only", fill:"rgba(34,211,238,0.15)", stroke:"#22d3ee", tc:"#67e8f9" },
        { label:"OPERATE-STD", sub:"scoped share", fill:"rgba(167,139,250,0.15)", stroke:"#a78bfa", tc:"#ddd6fe" },
        { label:"SENSITIVE", sub:"refuse ext.", fill:"rgba(248,113,113,0.12)", stroke:"#f87171", tc:"#fca5a5" },
      ] as { label:string; sub:string; fill:string; stroke:string; tc:string }[]).forEach((tier, i) => {
        const ty = y + 50 + i * 14;
        g.appendChild(el("rect", { x:x+8, y:ty-10, width:w-16, height:12, rx:3,
          fill:tier.fill, stroke:tier.stroke, "stroke-width":0.8 }));
        g.appendChild(t(x+14, ty, tier.label, { family:"JetBrains Mono,monospace", size:6.5, weight:700, fill:tier.tc }));
        g.appendChild(t(x+w-10, ty, tier.sub, { anchor:"end", family:"Open Sans,sans-serif", size:6, fill:"rgba(148,163,184,0.7)" }));
      });
      scene.appendChild(g);
    }

    function drawCompanyB() {
      const g = el("g", { id:"sf-node-companyB", class:"sf-device" });
      const { cx, cy, w, h } = DEVICES.companyB;
      const x = cx - w/2, y = cy - h/2;
      g.appendChild(el("rect", {
        x, y, width:w, height:h, rx:12,
        fill:"rgba(15,23,42,0.95)", stroke:"rgba(148,163,184,0.55)", "stroke-width":1.6, class:"sf-frame",
      }));
      g.appendChild(el("rect", { x:x+12, y:y+10, width:w-24, height:20, rx:5,
        fill:"rgba(251,191,36,0.1)", stroke:"rgba(251,191,36,0.35)", "stroke-width":1 }));
      g.appendChild(t(cx, y+24, "COMPANY B · Delhivery", {
        anchor:"middle", family:"JetBrains Mono,monospace", size:9, weight:700, fill:"#fcd34d", tracking:"0.1em",
      }));
      g.appendChild(t(cx, y+42, "transferee · decrypts own cipher", {
        anchor:"middle", family:"Open Sans,sans-serif", size:8, fill:"rgba(203,213,225,0.7)",
      }));
      g.appendChild(t(cx, y+58, "Receives cipher from enclave", {
        anchor:"middle", family:"Open Sans,sans-serif", size:8, fill:"rgba(251,191,36,0.75)",
      }));
      scene.appendChild(g);
    }

    function drawVault() {
      const g = el("g", { id:"sf-node-vault", class:"sf-device" });
      const { cx, cy, w, h } = DEVICES.vault;
      const x = cx-w/2, y = cy-h/2;

      /* ambient glow behind the panel */
      g.appendChild(el("rect", { x:x+8, y:y+10, width:w, height:h, rx:20,
        fill:"rgba(0,200,180,0.22)", filter:"url(#sf-glow-strong)" }));
      /* main body */
      g.appendChild(el("rect", { x, y, width:w, height:h, rx:18,
        fill:"url(#sf-vaultGrad)", stroke:"rgba(0,229,211,0.65)", "stroke-width":1.8,
        class:"sf-frame" }));
      /* top gradient accent stripe */
      g.appendChild(el("rect", { x:x+30, y:y+1, width:w-60, height:3, rx:1.5,
        fill:"url(#sf-vaultTopAccent)" }));
      /* subtle inner dot-grid */
      const vgG = el("g", { opacity:0.05 });
      for (let gx=x+18; gx<x+w-10; gx+=14)
        for (let gy=y+50; gy<y+h-8; gy+=14)
          vgG.appendChild(el("circle",{cx:gx,cy:gy,r:1,fill:"#00e5d3"}));
      g.appendChild(vgG);

      /* ── lock icon (left side, vertically centred) ── */
      const lx = x+20, lcy = cy;
      /* shackle arc */
      g.appendChild(el("path", {
        d:`M ${lx+6} ${lcy-4} A 10 10 0 0 1 ${lx+26} ${lcy-4}`,
        fill:"none", stroke:"#22d3ee", "stroke-width":2.5, "stroke-linecap":"round"
      }));
      /* lock body */
      g.appendChild(el("rect", { x:lx, y:lcy-2, width:32, height:24, rx:6,
        fill:"rgba(0,229,211,0.12)", stroke:"#22d3ee", "stroke-width":1.8 }));
      /* keyhole */
      g.appendChild(el("circle", { cx:lx+16, cy:lcy+8, r:4.5,
        fill:"rgba(34,211,238,0.2)", stroke:"#22d3ee", "stroke-width":1.5 }));
      g.appendChild(el("rect", { x:lx+13.5, y:lcy+10, width:5, height:7, rx:2,
        fill:"#22d3ee", opacity:0.8 }));
      /* vertical divider */
      g.appendChild(el("rect", { x:x+60, y:y+14, width:1, height:h-28, rx:0.5,
        fill:"rgba(0,229,211,0.2)" }));

      /* ── right-side content ── */
      const rx2 = x+70;
      /* title + subtitle */
      g.appendChild(t(rx2, y+26, "USER VAULT", { family:"JetBrains Mono,monospace",
        size:12.5, weight:700, fill:"#67e8f9", tracking:"0.22em" }));
      g.appendChild(t(rx2, y+42, "AES-256-GCM · per-user DEK · enclave-bound", {
        family:"Open Sans,sans-serif", size:10, fill:"rgba(165,243,252,0.65)" }));
      /* thin separator */
      g.appendChild(el("rect", { x:x+62, y:y+52, width:w-74, height:1, rx:0.5,
        fill:"rgba(0,229,211,0.2)" }));

      /* ── encrypted field slots ── */
      const fields = [
        { lbl:"name",    hex:"4a2f", col:"#60a5fa" },
        { lbl:"dob",     hex:"9bc1", col:"#22d3ee" },
        { lbl:"address", hex:"e302", col:"#34d399" },
        { lbl:"kyc",     hex:"7d8a", col:"#67e8f9" },
        { lbl:"pan",     hex:"1f5c", col:"#fb923c" },
      ];
      const slotW = (w-78)/5, slotH = 48, slotY = y+60;
      fields.forEach((f, i) => {
        const sx = x+68 + i*(slotW+4);
        /* slot bg */
        g.appendChild(el("rect", { x:sx, y:slotY, width:slotW, height:slotH, rx:7,
          fill:"rgba(255,255,255,0.03)", stroke:`${f.col}50`, "stroke-width":1 }));
        /* top color strip */
        g.appendChild(el("rect", { x:sx+4, y:slotY, width:slotW-8, height:3, rx:1.5,
          fill:f.col, opacity:0.75 }));
        /* field label */
        g.appendChild(t(sx+slotW/2, slotY+20, f.lbl, { anchor:"middle",
          family:"Open Sans,sans-serif", size:10, weight:700, fill:"rgba(165,243,252,0.6)" }));
        /* cipher hex */
        g.appendChild(t(sx+slotW/2, slotY+37, f.hex+"…", { anchor:"middle",
          family:"JetBrains Mono,monospace", size:9, weight:600, fill:f.col }));
      });

      /* ── provider badge ── */
      g.appendChild(el("rect", { x:x+68, y:y+h-22, width:w-78, height:14, rx:4,
        fill:"rgba(0,229,211,0.06)", stroke:"rgba(0,229,211,0.2)", "stroke-width":0.8 }));
      g.appendChild(t(cx+10, y+h-12, "GDrive (MVP) → ByoSync India-resident vault (roadmap)",
        { anchor:"middle", family:"Open Sans,sans-serif", size:9.5, fill:"#2dd4bf" }));

      scene.appendChild(g);
    }

    function drawPhone() {
      const g = el("g", { id:"sf-node-phone", class:"sf-device" });
      const { cx, cy, w, h } = DEVICES.phone;
      const x=cx-w/2, y=cy-h/2;
      g.appendChild(el("rect", { x, y, width:w, height:h, rx:32, fill:"url(#sf-phoneBody)", stroke:"rgba(103,232,249,0.3)", "stroke-width":2, class:"sf-body" }));
      g.appendChild(el("rect", { x:x+8, y:y+8, width:w-16, height:h-16, rx:26, fill:"none", stroke:"rgba(15,23,42,0.8)", "stroke-width":1 }));
      g.appendChild(el("rect", { id:"sf-phone-screen", x:x+12, y:y+38, width:w-24, height:h-76, rx:18, fill:"url(#sf-phoneScreen)", stroke:"rgba(30,58,100,0.8)", "stroke-width":1 }));
      g.appendChild(el("rect", { x:cx-38, y:y+14, width:76, height:20, rx:10, fill:"#050810" }));
      g.appendChild(el("circle", { cx:cx+26, cy:y+24, r:3, fill:"#0e1628", stroke:"rgba(30,58,100,0.6)", "stroke-width":0.5 }));
      g.appendChild(t(x+28, y+56, "9:41", { family:"Open Sans,sans-serif", size:10, weight:700, fill:"#f1f5f9" }));
      g.appendChild(t(x+w-28, y+56, "● ● ●", { anchor:"end", family:"Open Sans,sans-serif", size:9, fill:"#94a3b8" }));
      g.appendChild(t(cx, y+78, "BYOSYNC", { anchor:"middle", family:"JetBrains Mono,monospace", size:9, weight:700, fill:"#34d399", tracking:"0.4em" }));
      g.appendChild(t(cx, y+100, "Verify yourself", { anchor:"middle", family:"Open Sans,sans-serif", size:18, weight:700, fill:"#f1f5f9" }));
      g.appendChild(el("g", { id:"sf-phone-content" }));
      g.appendChild(el("rect", { x:cx-40, y:y+h-20, width:80, height:4, rx:2, fill:"rgba(100,116,139,0.4)" }));
      scene.appendChild(g);
      renderPhoneIdle();
    }

    function clearPhoneContent() {
      const c = scene.querySelector<SVGGElement>("#sf-phone-content");
      if (c) while (c.firstChild) c.removeChild(c.firstChild);
      return c;
    }

    function renderPhoneIdle() {
      const c = clearPhoneContent(); if (!c) return;
      const { cx, cy, w, h } = DEVICES.phone;
      const x=cx-w/2, y=cy-h/2;
      c.appendChild(el("ellipse", { cx, cy:y+240, rx:56, ry:72, fill:"none", stroke:"#34d399", "stroke-width":2, "stroke-dasharray":"4 8", opacity:0.65 }));
      c.appendChild(t(cx, y+240, "○", { anchor:"middle", family:"Open Sans,sans-serif", size:30, weight:300, fill:"#34d399", opacity:0.5 }));
      c.appendChild(t(cx, y+350, "Tap to begin", { anchor:"middle", family:"Open Sans,sans-serif", size:11, fill:"#94a3b8" }));
    }

    function renderPhoneScene(state: string) {
      const c = clearPhoneContent(); if (!c) return;
      const { cx, cy, w, h } = DEVICES.phone;
      const x=cx-w/2, y=cy-h/2;
      const screenX=x+12, screenW=w-24;

      if (state === "scanning") {
        c.appendChild(el("ellipse", { cx, cy:y+240, rx:58, ry:74, fill:"none", stroke:"#34d399", "stroke-width":2.5, "stroke-dasharray":"8 6", opacity:0.9 }));
        c.appendChild(el("circle", { cx, cy:y+240, r:4, fill:"#34d399", class:"sf-pulse-ring" }));
        c.appendChild(el("rect", { x:cx-50, y:y+180, width:100, height:1.5, fill:"#34d399", opacity:0.7 }));
        c.appendChild(t(cx, y+250, "◔", { anchor:"middle", family:"Open Sans,sans-serif", size:60, weight:300, fill:"#34d399" }));
        c.appendChild(t(cx, y+340, "Hold still…", { anchor:"middle", family:"Open Sans,sans-serif", size:13, fill:"#f1f5f9", weight:700 }));
        c.appendChild(t(cx, y+358, "Listening for your voice", { anchor:"middle", family:"Open Sans,sans-serif", size:10, fill:"#94a3b8" }));
        for (let i=0;i<12;i++) {
          const wx=cx-60+i*11, wh=6+(i%3)*8;
          c.appendChild(el("rect", { x:wx, y:y+380-wh/2, width:4, height:wh, rx:2, fill:"#22d3ee", opacity:0.7 }));
        }
      } else if (["consent-prompt","consent-prompt-payment","consent-prompt-plaintext"].includes(state)) {
        const isPayment = state==="consent-prompt-payment";
        const isPlain   = state==="consent-prompt-plaintext";
        const titleColor = isPlain ? "#f87171" : (isPayment ? "#fbbf24" : "#34d399");
        const title   = isPayment ? "Confirm payment" : isPlain ? "View access request" : "Allow access?";
        const company = isPayment ? "AcmePay" : isPlain ? "AcmePay · KYC dispute" : "AcmePay";
        c.appendChild(t(cx, y+130, title, { anchor:"middle", family:"Open Sans,sans-serif", size:17, weight:700, fill:titleColor }));
        c.appendChild(el("rect", { x:screenX+12, y:y+150, width:screenW-24, height:isPayment?158:132, rx:10, fill:"rgba(255,255,255,0.04)", stroke:"rgba(100,116,139,0.3)", "stroke-width":1 }));
        c.appendChild(t(screenX+22, y+172, "FROM", { family:"JetBrains Mono,monospace", size:8.5, weight:700, fill:"#94a3b8", tracking:"0.2em" }));
        c.appendChild(t(screenX+22, y+188, company, { family:"Open Sans,sans-serif", size:13, weight:700, fill:"#f1f5f9" }));
        if (isPayment) {
          c.appendChild(t(screenX+22, y+212, "AMOUNT", { family:"JetBrains Mono,monospace", size:8.5, weight:700, fill:"#94a3b8", tracking:"0.2em" }));
          c.appendChild(t(screenX+22, y+232, "₹ 2,500.00", { family:"Open Sans,sans-serif", size:22, weight:700, fill:"#fbbf24" }));
          c.appendChild(t(screenX+22, y+256, "Order #4421 · One-time", { family:"Open Sans,sans-serif", size:10, fill:"#94a3b8" }));
          c.appendChild(t(screenX+22, y+282, "Card ending 4382 (tokenized)", { family:"Open Sans,sans-serif", size:10, weight:600, fill:"#60a5fa" }));
        } else if (isPlain) {
          c.appendChild(t(screenX+22, y+212, "EMPLOYEE", { family:"JetBrains Mono,monospace", size:8.5, weight:700, fill:"#f87171", tracking:"0.2em" }));
          c.appendChild(t(screenX+22, y+230, "Priya S. · ID 4521", { family:"Open Sans,sans-serif", size:12, weight:600, fill:"#f1f5f9" }));
          c.appendChild(t(screenX+22, y+252, "WANTS TO VIEW", { family:"JetBrains Mono,monospace", size:8.5, weight:700, fill:"#94a3b8", tracking:"0.2em" }));
          c.appendChild(t(screenX+22, y+268, "Address proof (view-only)", { family:"Open Sans,sans-serif", size:11.5, weight:600, fill:"#f1f5f9" }));
        } else {
          c.appendChild(t(screenX+22, y+212, "WANTS TO VERIFY", { family:"JetBrains Mono,monospace", size:8.5, weight:700, fill:"#94a3b8", tracking:"0.2em" }));
          c.appendChild(t(screenX+22, y+230, "Age over 18", { family:"Open Sans,sans-serif", size:12, weight:600, fill:"#f1f5f9" }));
          c.appendChild(t(screenX+22, y+248, "KYC verified", { family:"Open Sans,sans-serif", size:12, weight:600, fill:"#f1f5f9" }));
          c.appendChild(t(screenX+22, y+268, "Expires in 10 minutes", { family:"Open Sans,sans-serif", size:10, fill:"#94a3b8" }));
        }
        const btnY = y+(isPayment?330:310);
        c.appendChild(el("rect", { x:screenX+12, y:btnY, width:screenW-24, height:44, rx:22, fill:titleColor }));
        c.appendChild(t(cx, btnY+27, isPayment?"Pay with face + voice":"Approve with face + voice", { anchor:"middle", family:"Open Sans,sans-serif", size:12.5, weight:700, fill:"#0f172a" }));
      } else if (state === "mandate-a2a") {
        c.appendChild(t(cx, y+128, "Authorize agent", { anchor:"middle", family:"Open Sans,sans-serif", size:17, weight:700, fill:"#a78bfa" }));
        c.appendChild(el("rect", { x:screenX+12, y:y+150, width:screenW-24, height:118, rx:10, fill:"rgba(167,139,250,0.08)", stroke:"rgba(167,139,250,0.35)", "stroke-width":1 }));
        c.appendChild(t(screenX+22, y+172, "GOAL", { family:"JetBrains Mono,monospace", size:8.5, weight:700, fill:"#94a3b8", tracking:"0.2em" }));
        c.appendChild(t(screenX+22, y+188, "Astrology + buy gemstone + pay", { family:"Open Sans,sans-serif", size:11, weight:600, fill:"#f1f5f9" }));
        c.appendChild(t(screenX+22, y+212, "SCOPE · TTL", { family:"JetBrains Mono,monospace", size:8.5, weight:700, fill:"#94a3b8", tracking:"0.2em" }));
        c.appendChild(t(screenX+22, y+228, "3 remote agents · 1 hour", { family:"Open Sans,sans-serif", size:11, fill:"#cbd5e1" }));
        c.appendChild(t(screenX+22, y+248, "Session mandate (not blanket)", { family:"Open Sans,sans-serif", size:10, fill:"#94a3b8" }));
        c.appendChild(el("rect", { x:screenX+12, y:y+290, width:screenW-24, height:44, rx:22, fill:"#a78bfa" }));
        c.appendChild(t(cx, y+317, "Approve with face + voice", { anchor:"middle", family:"Open Sans,sans-serif", size:12.5, weight:700, fill:"#0f172a" }));
      } else if (state === "consent-a2a-shopping") {
        c.appendChild(t(cx, y+118, "One consent · 3 classes", { anchor:"middle", family:"Open Sans,sans-serif", size:16, weight:700, fill:"#a78bfa" }));
        c.appendChild(el("rect", { x:screenX+12, y:y+138, width:screenW-24, height:168, rx:10, fill:"rgba(255,255,255,0.04)", stroke:"rgba(100,116,139,0.3)", "stroke-width":1 }));
        c.appendChild(t(screenX+22, y+158, "ShopCo · shopping agent", { family:"Open Sans,sans-serif", size:12, weight:700, fill:"#f1f5f9" }));
        ([
          ["VERIFY","Age 18+ (boolean only — no DOB)", "#22d3ee"],
          ["OPERATE-STD","Delivery address · delivery+7d TTL", "#a78bfa"],
          ["INTENT","Pay ₹499 · no card/bank on wire", "#fbbf24"],
        ] as string[][]).forEach(([tier, line, col], i) => {
          const ry = y + 182 + i * 38;
          c.appendChild(t(screenX+22, ry, tier, { family:"JetBrains Mono,monospace", size:8, weight:700, fill:col, tracking:"0.12em" }));
          c.appendChild(t(screenX+22, ry+14, line, { family:"Open Sans,sans-serif", size:9.5, fill:"#cbd5e1" }));
        });
        c.appendChild(el("rect", { x:screenX+12, y:y+322, width:screenW-24, height:44, rx:22, fill:"#a78bfa" }));
        c.appendChild(t(cx, y+349, "Approve once (3 tokens minted)", { anchor:"middle", family:"Open Sans,sans-serif", size:11.5, weight:700, fill:"#0f172a" }));
      } else if (state === "dashboard-a2a") {
        c.appendChild(t(cx, y+120, "A2A lineage", { anchor:"middle", family:"Open Sans,sans-serif", size:17, weight:700, fill:"#f1f5f9" }));
        ([
          { agent:"AstroCorp", what:"Birth · astrology", exp:"deleted 14:30", c:"#a78bfa" },
          { agent:"ShopCo", what:"Address · delivery", exp:"deletes 28 May", c:"#34d399" },
          { agent:"MerchantM", what:"₹499 intent", exp:"instrument never shared", c:"#fbbf24" },
        ] as { agent:string; what:string; exp:string; c:string }[]).forEach((row, i) => {
          const ry = y + 155 + i * 58;
          c.appendChild(el("rect", { x:screenX+12, y:ry, width:screenW-24, height:50, rx:8, fill:"rgba(255,255,255,0.03)", stroke:"rgba(100,116,139,0.25)", "stroke-width":1 }));
          c.appendChild(t(screenX+22, ry+18, row.agent, { family:"Open Sans,sans-serif", size:12, weight:700, fill:row.c }));
          c.appendChild(t(screenX+22, ry+34, row.what, { family:"Open Sans,sans-serif", size:10, fill:"#94a3b8" }));
          c.appendChild(t(screenX+screenW-22, ry+34, row.exp, { anchor:"end", family:"JetBrains Mono,monospace", size:8, fill:"#cbd5e1" }));
        });
      } else if (state === "approved") {
        c.appendChild(el("circle", { cx, cy:y+230, r:50, fill:"none", stroke:"#34d399", "stroke-width":3 }));
        c.appendChild(t(cx, y+246, "✓", { anchor:"middle", family:"Open Sans,sans-serif", size:56, weight:300, fill:"#34d399" }));
        c.appendChild(t(cx, y+310, "Approved", { anchor:"middle", family:"Open Sans,sans-serif", size:18, weight:700, fill:"#f1f5f9" }));
        c.appendChild(t(cx, y+332, "Signed and sent securely", { anchor:"middle", family:"Open Sans,sans-serif", size:11, fill:"#94a3b8" }));
      } else if (state === "payment-vault") {
        c.appendChild(t(cx, y+155, "✓ Verified", { anchor:"middle", family:"Open Sans,sans-serif", size:15, weight:700, fill:"#34d399" }));
        c.appendChild(t(cx, y+174, "Securing payment methods…", { anchor:"middle", family:"Open Sans,sans-serif", size:9.5, fill:"#94a3b8" }));
        c.appendChild(el("rect", { x:screenX+10, y:y+188, width:screenW-20, height:2, rx:1, fill:"rgba(167,139,250,0.25)" }));
        c.appendChild(t(cx, y+205, "VAULT · PAYMENT TOKENS", { anchor:"middle", family:"JetBrains Mono,monospace", size:8, weight:700, fill:"#94a3b8", tracking:"0.2em" }));
        ([
          ["💳 Card","tok_card_4382","#60a5fa"],
          ["🏦 Bank","tok_bank_7c91","#22d3ee"],
          ["⚡ UPI", "tok_upi_2de5", "#34d399"],
        ] as string[][]).forEach(([label, token, color], i) => {
          const ry = y+218+i*46;
          c.appendChild(el("rect", { x:screenX+10, y:ry, width:screenW-20, height:38, rx:6, fill:"rgba(255,255,255,0.04)", stroke:color, "stroke-width":0.8, "stroke-opacity":0.4 }));
          c.appendChild(t(screenX+20, ry+15, label, { family:"Open Sans,sans-serif", size:10, weight:600, fill:color }));
          c.appendChild(t(screenX+20, ry+29, "AES-256-GCM in vault", { family:"JetBrains Mono,monospace", size:8, fill:"#cbd5e1" }));
          c.appendChild(t(screenX+screenW-28, ry+22, token, { anchor:"end", family:"JetBrains Mono,monospace", size:9, weight:700, fill:color }));
        });
        c.appendChild(t(cx, y+360, "No PAN · No CVV · No IFSC in plain", { anchor:"middle", family:"Open Sans,sans-serif", size:9, fill:"#cbd5e1" }));
      } else if (state === "revoked") {
        c.appendChild(el("circle", { cx, cy:y+230, r:50, fill:"none", stroke:"#f87171", "stroke-width":3 }));
        c.appendChild(t(cx, y+245, "×", { anchor:"middle", family:"Open Sans,sans-serif", size:70, weight:300, fill:"#f87171" }));
        c.appendChild(t(cx, y+310, "Access revoked", { anchor:"middle", family:"Open Sans,sans-serif", size:17, weight:700, fill:"#f1f5f9" }));
        c.appendChild(t(cx, y+332, "Future access blocked", { anchor:"middle", family:"Open Sans,sans-serif", size:11, fill:"#94a3b8" }));
      } else if (state === "dashboard") {
        c.appendChild(t(cx, y+130, "My consents", { anchor:"middle", family:"Open Sans,sans-serif", size:17, weight:700, fill:"#f1f5f9" }));
        const consents = [
          { name:"AcmePay", field:"KYC verified",  color:"#34d399" },
          { name:"NeoBank", field:"Address proof",  color:"#34d399" },
          { name:"ZipCart", field:"Age over 18",    color:"#94a3b8" },
        ];
        consents.forEach((cn, i) => {
          const cyPos = y+165+i*60;
          c.appendChild(el("rect", { x:screenX+12, y:cyPos, width:screenW-24, height:52, rx:8, fill:"rgba(255,255,255,0.03)", stroke:"rgba(100,116,139,0.25)", "stroke-width":1 }));
          c.appendChild(t(screenX+22, cyPos+20, cn.name, { family:"Open Sans,sans-serif", size:13, weight:700, fill:"#f1f5f9" }));
          c.appendChild(t(screenX+22, cyPos+38, cn.field, { family:"Open Sans,sans-serif", size:11, fill:"#94a3b8" }));
          c.appendChild(el("circle", { cx:screenX+screenW-28, cy:cyPos+26, r:4, fill:cn.color }));
        });
        c.appendChild(el("rect", { x:screenX+12, y:y+360, width:screenW-24, height:38, rx:19, fill:"rgba(248,113,113,0.12)", stroke:"#f87171", "stroke-width":1.5 }));
        c.appendChild(t(cx, y+384, "Revoke AcmePay", { anchor:"middle", family:"Open Sans,sans-serif", size:11.5, weight:700, fill:"#f87171" }));

      /* ── vault inception phone states ── */
      } else if (state === "enroll-start") {
        c.appendChild(el("rect", { x:cx-70, y:y+118, width:140, height:50, rx:14,
          fill:"rgba(34,211,238,0.08)", stroke:"rgba(34,211,238,0.3)", "stroke-width":1.5 }));
        c.appendChild(t(cx, y+148, "BYOSYNC", { anchor:"middle", family:"JetBrains Mono,monospace",
          size:13, weight:700, fill:"#22d3ee", tracking:"0.35em" }));
        c.appendChild(t(cx, y+198, "Create your", { anchor:"middle", family:"Open Sans,sans-serif",
          size:20, weight:800, fill:"#f1f5f9" }));
        c.appendChild(t(cx, y+222, "identity vault", { anchor:"middle", family:"Open Sans,sans-serif",
          size:20, weight:800, fill:"#67e8f9" }));
        c.appendChild(t(cx, y+258, "One-time setup · takes 60 seconds", { anchor:"middle",
          family:"Open Sans,sans-serif", size:11, fill:"#94a3b8" }));
        c.appendChild(el("rect", { x:cx-66, y:y+290, width:132, height:40, rx:20, fill:"#22d3ee" }));
        c.appendChild(t(cx, y+315, "Get started", { anchor:"middle", family:"Open Sans,sans-serif",
          size:13, weight:700, fill:"#0f172a" }));
        c.appendChild(t(cx, y+368, "Your biometrics never leave this device.", { anchor:"middle",
          family:"Open Sans,sans-serif", size:10, fill:"#cbd5e1" }));
        c.appendChild(t(cx, y+384, "No database. No PII stored.", { anchor:"middle",
          family:"Open Sans,sans-serif", size:10, fill:"#cbd5e1" }));

      } else if (state === "enroll-capture") {
        // animated orbit ring to show biometric capture
        c.appendChild(el("ellipse", { cx, cy:y+240, rx:62, ry:78, fill:"none",
          stroke:"#22d3ee", "stroke-width":2.5, "stroke-dasharray":"10 6", opacity:0.85 }));
        c.appendChild(el("circle", { cx, cy:y+240, r:5, fill:"#22d3ee", class:"sf-pulse-ring" }));
        // scanline
        c.appendChild(el("rect", { x:cx-55, y:y+185, width:110, height:2, fill:"#22d3ee", opacity:0.7 }));
        // face icon
        c.appendChild(el("circle", { cx, cy:y+232, r:30, fill:"none", stroke:"rgba(34,211,238,0.4)", "stroke-width":2 }));
        c.appendChild(t(cx, y+245, "◕", { anchor:"middle", family:"Open Sans,sans-serif",
          size:40, weight:300, fill:"#67e8f9" }));
        c.appendChild(t(cx, y+305, "Enrolling face + voice", { anchor:"middle",
          family:"Open Sans,sans-serif", size:13, weight:700, fill:"#f1f5f9" }));
        c.appendChild(t(cx, y+323, "On-device only · zero upload", { anchor:"middle",
          family:"Open Sans,sans-serif", size:10, fill:"#94a3b8" }));
        // waveform for voice
        for (let i=0;i<14;i++) {
          const wh = 5+(Math.abs(i-7)%4)*7;
          c.appendChild(el("rect", { x:cx-60+i*9, y:y+354-wh/2, width:5, height:wh, rx:2.5,
            fill:"#22d3ee", opacity:0.6+(i%2)*0.2 }));
        }
        c.appendChild(t(cx, y+390, 'Say: \u201cI am me\u201d', { anchor:"middle",
          family:"JetBrains Mono,monospace", size:10, fill:"#22d3ee", tracking:"0.1em" }));

      } else if (state === "enroll-keygen") {
        c.appendChild(t(cx, y+138, "Generating keys…", { anchor:"middle",
          family:"Open Sans,sans-serif", size:16, weight:700, fill:"#f1f5f9" }));
        const steps = [
          ["Fuzzy extractor → helper data",  "#22d3ee", 1.0],
          ["Secure Enclave generates UMK",    "#22d3ee", 0.8],
          ["UMK wrapped with device key",     "#22d3ee", 0.8],
          ["Raw biometrics zeroed",           "#34d399", 1.0],
          ["Device key pair created",         "#22d3ee", 0.8],
        ] as [string, string, number][];
        steps.forEach(([label, color, opacity], i) => {
          const rowY = y+172+i*38;
          c.appendChild(el("rect", { x:screenX+12, y:rowY, width:screenW-24, height:30, rx:7,
            fill:`rgba(34,211,238,0.06)`, stroke:`rgba(34,211,238,0.2)`, "stroke-width":1 }));
          c.appendChild(el("circle", { cx:screenX+24, cy:rowY+15, r:5,
            fill: i < 3 ? color : "#34d399", opacity:String(opacity) }));
          c.appendChild(t(screenX+36, rowY+19, label, { family:"Open Sans,sans-serif",
            size:10.5, weight:600, fill:"#cbd5e1", opacity:String(opacity) }));
        });
        c.appendChild(t(cx, y+378, "Private key never leaves this device.", { anchor:"middle",
          family:"Open Sans,sans-serif", size:10, fill:"#cbd5e1" }));

      } else if (state === "enroll-kyc") {
        c.appendChild(t(cx, y+130, "Add your KYC fields", { anchor:"middle",
          family:"Open Sans,sans-serif", size:16, weight:700, fill:"#f1f5f9" }));
        c.appendChild(t(cx, y+152, "Encrypted · stored in your vault only", { anchor:"middle",
          family:"Open Sans,sans-serif", size:10, fill:"#94a3b8" }));
        const fields = [
          { label:"Aadhaar-linked name", icon:"◈", color:"#22d3ee" },
          { label:"Date of birth",        icon:"◈", color:"#22d3ee" },
          { label:"Address proof",        icon:"◈", color:"#22d3ee" },
          { label:"PAN (optional)",       icon:"◇", color:"#94a3b8" },
        ];
        fields.forEach((f, i) => {
          const rowY = y+176+i*46;
          c.appendChild(el("rect", { x:screenX+14, y:rowY, width:screenW-28, height:38, rx:9,
            fill:"rgba(255,255,255,0.03)", stroke:`rgba(34,211,238,0.2)`, "stroke-width":1 }));
          c.appendChild(t(screenX+28, rowY+24, f.icon, { family:"Open Sans,sans-serif",
            size:13, fill:f.color }));
          c.appendChild(t(screenX+46, rowY+24, f.label, { family:"Open Sans,sans-serif",
            size:12, weight:600, fill:"#f1f5f9" }));
        });
        c.appendChild(el("rect", { x:cx-66, y:y+380, width:132, height:36, rx:18, fill:"#22d3ee" }));
        c.appendChild(t(cx, y+403, "Encrypt & store in vault", { anchor:"middle",
          family:"Open Sans,sans-serif", size:11.5, weight:700, fill:"#0f172a" }));

      } else if (state === "enroll-complete") {
        c.appendChild(el("circle", { cx, cy:y+178, r:40, fill:"none",
          stroke:"#22d3ee", "stroke-width":3 }));
        c.appendChild(el("circle", { cx, cy:y+178, r:40, fill:"rgba(34,211,238,0.06)" }));
        c.appendChild(t(cx, y+192, "✓", { anchor:"middle", family:"Open Sans,sans-serif",
          size:44, weight:300, fill:"#22d3ee" }));
        c.appendChild(t(cx, y+248, "Vault ready", { anchor:"middle",
          family:"Open Sans,sans-serif", size:17, weight:800, fill:"#f1f5f9" }));
        c.appendChild(t(cx, y+268, "usr_8a2f · 4 fields enrolled", { anchor:"middle",
          family:"JetBrains Mono,monospace", size:9.5, fill:"#22d3ee", tracking:"0.1em" }));
        const pills = ["age_over_18","kyc_verified","address_proof","date_of_birth"];
        const gridTop = y + 288;
        pills.forEach((p, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const pillW = p.length * 6 + 14;
          const pillLeft = cx - 95 + col * 98;
          const boxY = gridTop + row * 30;
          c.appendChild(el("rect", { x: pillLeft, y: boxY, width: pillW, height: 22, rx: 10,
            fill:"rgba(34,211,238,0.12)", stroke:"rgba(34,211,238,0.4)", "stroke-width":1 }));
          c.appendChild(t(pillLeft + pillW / 2, boxY + 15, p, { anchor:"middle",
            family:"JetBrains Mono,monospace", size:8.5, weight:600, fill:"#67e8f9" }));
        });
        c.appendChild(t(cx, y + 368, "You own the key. ByoSync holds only a pointer.", { anchor:"middle",
          family:"Open Sans,sans-serif", size:9.5, fill:"#cbd5e1" }));
      }
    }

    function drawDesktop() {
      const g = el("g", { id:"sf-node-desktop", class:"sf-device" });
      const { cx, cy, w, h } = DEVICES.desktop;
      const x=cx-w/2, y=cy-h/2;
      g.appendChild(el("rect", { x, y, width:w, height:h, rx:14, fill:"url(#sf-desktopBody)", stroke:"rgba(56,189,248,0.45)", "stroke-width":2, class:"sf-body" }));
      g.appendChild(el("rect", { id:"sf-desktop-screen", x:x+14, y:y+14, width:w-28, height:h-50, rx:6, fill:"url(#sf-desktopScreen)", stroke:"rgba(30,58,100,0.6)", "stroke-width":1 }));
      g.appendChild(t(cx, y+h-18, "● ● ●", { anchor:"middle", family:"Open Sans,sans-serif", size:10, fill:"#94a3b8" }));
      g.appendChild(el("rect", { x:cx-36, y:y+h+4,  width:72,  height:10, rx:2, fill:"#0f1628", stroke:"rgba(30,58,100,0.5)", "stroke-width":1 }));
      g.appendChild(el("rect", { x:cx-70, y:y+h+14, width:140, height:6,  rx:2, fill:"#0a1020" }));
      const sX=x+14, sY=y+14, sW=w-28;
      g.appendChild(el("rect", { x:sX, y:sY, width:sW, height:26, fill:"#080e1c" }));
      (["#f87171","#fbbf24","#34d399"] as string[]).forEach((col, i) => {
        g.appendChild(el("circle", { cx:sX+14+i*14, cy:sY+13, r:4, fill:col }));
      });
      g.appendChild(t(sX+sW/2, sY+17, "COMPANY A · AcmePay", { id:"sf-desktop-title", anchor:"middle", family:"Open Sans,sans-serif", size:10, weight:600, fill:"#94a3b8" }));
      g.appendChild(el("g", { id:"sf-desktop-content" }));
      scene.appendChild(g);
      renderDesktopIdle();
    }

    function setDesktopChrome(title: string) {
      const titleEl = scene.querySelector<SVGTextElement>("#sf-desktop-title");
      if (titleEl) titleEl.textContent = title;
    }

    function clearDesktopContent() {
      const c = scene.querySelector<SVGGElement>("#sf-desktop-content");
      if (c) while (c.firstChild) c.removeChild(c.firstChild);
      return c;
    }

    function renderDesktopIdle() {
      const c = clearDesktopContent(); if (!c) return;
      const { cx, cy, w, h } = DEVICES.desktop;
      const x=cx-w/2, y=cy-h/2;
      const sX=x+14, sY=y+14, sW=w-28;
      c.appendChild(t(cx, sY+70, "User verification", { anchor:"middle", family:"Open Sans,sans-serif", size:18, weight:700, fill:"#38bdf8" }));
      c.appendChild(t(cx, sY+92, "Awaiting request…", { anchor:"middle", family:"Open Sans,sans-serif", size:11, fill:"#94a3b8" }));
      c.appendChild(el("rect", { x:sX+40, y:sY+120, width:sW-80, height:90, rx:6, fill:"rgba(56,189,248,0.06)", stroke:"rgba(56,189,248,0.35)", "stroke-width":1, "stroke-dasharray":"5 4" }));
      c.appendChild(t(cx, sY+170, "—  no data shown  —", { anchor:"middle", family:"JetBrains Mono,monospace", size:10, fill:"#7dd3fc", tracking:"0.2em" }));
    }

    function renderDesktopScene(state: string) {
      const c = clearDesktopContent(); if (!c) return;
      const { cx, cy, w, h } = DEVICES.desktop;
      const x=cx-w/2, y=cy-h/2;
      const sX=x+14, sY=y+14, sW=w-28, sH=h-50;

      if (state === "requesting") {
        c.appendChild(t(cx, sY+70, "Requesting verification", { anchor:"middle", family:"Open Sans,sans-serif", size:18, weight:700, fill:"#38bdf8" }));
        c.appendChild(el("rect", { x:sX+26, y:sY+100, width:sW-52, height:100, rx:6, fill:"rgba(56,189,248,0.06)", stroke:"rgba(56,189,248,0.3)", "stroke-width":1 }));
        ["user:    usr_8a2f","fields:  age_over_18, kyc_verified","purpose: worker_onboarding","mode:    boolean"].forEach((l,i) => {
          c.appendChild(t(sX+40, sY+124+i*18, l, { family:"JetBrains Mono,monospace", size:11, weight:500, fill:"#a5f3fc" }));
        });
        c.appendChild(t(cx, sY+230, "Waiting for user approval…", { anchor:"middle", family:"Open Sans,sans-serif", size:11, fill:"#94a3b8" }));
      } else if (state === "result-boolean") {
        c.appendChild(t(cx, sY+60, "Verified", { anchor:"middle", family:"Open Sans,sans-serif", size:22, weight:700, fill:"#34d399" }));
        c.appendChild(el("rect", { x:sX+26, y:sY+85, width:sW-52, height:130, rx:6, fill:"rgba(52,211,153,0.05)", stroke:"rgba(52,211,153,0.3)", "stroke-width":1 }));
        ([["age_over_18","TRUE"],["kyc_verified","TRUE"],["assertion_id","con_5af23e"],["expires","10 min"]] as string[][]).forEach(([k,v],i) => {
          const py=sY+110+i*24;
          c.appendChild(t(sX+44, py, k, { family:"JetBrains Mono,monospace", size:11, fill:"#94a3b8" }));
          c.appendChild(t(sX+sW-44, py, v, { anchor:"end", family:"JetBrains Mono,monospace", size:11, weight:700, fill:"#34d399" }));
        });
        c.appendChild(t(cx, sY+sH-18, "No PII stored · only signed proof", { anchor:"middle", family:"Open Sans,sans-serif", size:10, fill:"#34d399" }));
      } else if (state === "payment-checkout") {
        c.appendChild(t(cx, sY+60, "Checkout", { anchor:"middle", family:"Open Sans,sans-serif", size:19, weight:700, fill:"#fbbf24" }));
        c.appendChild(t(cx, sY+84, "Order #4421", { anchor:"middle", family:"Open Sans,sans-serif", size:11, fill:"#94a3b8" }));
        c.appendChild(el("rect", { x:sX+26, y:sY+102, width:sW-52, height:110, rx:6, fill:"rgba(251,191,36,0.05)", stroke:"rgba(251,191,36,0.25)", "stroke-width":1 }));
        c.appendChild(t(sX+42, sY+130, "Amount", { family:"Open Sans,sans-serif", size:10, fill:"#94a3b8" }));
        c.appendChild(t(sX+sW-42, sY+130, "₹ 2,500.00", { anchor:"end", family:"Open Sans,sans-serif", size:18, weight:700, fill:"#fbbf24" }));
        c.appendChild(t(sX+42, sY+158, "Payment method", { family:"Open Sans,sans-serif", size:10, fill:"#94a3b8" }));
        c.appendChild(t(sX+sW-42, sY+158, "tok_card_4382 (vault)", { anchor:"end", family:"JetBrains Mono,monospace", size:10, fill:"#60a5fa" }));
        c.appendChild(t(sX+42, sY+184, "Status", { family:"Open Sans,sans-serif", size:10, fill:"#94a3b8" }));
        c.appendChild(t(sX+sW-42, sY+184, "Awaiting 2FA…", { anchor:"end", family:"Open Sans,sans-serif", size:11, weight:600, fill:"#fbbf24" }));
        c.appendChild(t(cx, sY+234, "No PAN. No CVV. Just a token.", { anchor:"middle", family:"Open Sans,sans-serif", size:10, fill:"#94a3b8" }));
      } else if (state === "payment-success") {
        c.appendChild(t(cx, sY+70, "✓ Payment captured", { anchor:"middle", family:"Open Sans,sans-serif", size:20, weight:700, fill:"#34d399" }));
        c.appendChild(el("rect", { x:sX+26, y:sY+100, width:sW-52, height:130, rx:6, fill:"rgba(52,211,153,0.05)", stroke:"rgba(52,211,153,0.3)", "stroke-width":1 }));
        ([["txn_id","txn_pay_9af2c1"],["amount","₹ 2,500.00"],["auth_sig","0x9af1...e302"],["2FA proof","ByoSync verified"],["card","tok_card_4382"]] as string[][]).forEach(([k,v],i) => {
          const py=sY+122+i*21;
          c.appendChild(t(sX+44, py, k, { family:"JetBrains Mono,monospace", size:10.5, fill:"#94a3b8" }));
          c.appendChild(t(sX+sW-44, py, v, { anchor:"end", family:"JetBrains Mono,monospace", size:10.5, weight:700, fill:"#34d399" }));
        });
      } else if (state === "plaintext-view") {
        c.appendChild(t(cx, sY+56, "Address proof", { anchor:"middle", family:"Open Sans,sans-serif", size:17, weight:700, fill:"#f87171" }));
        c.appendChild(t(cx, sY+76, "View-only · 14:47 remaining", { anchor:"middle", family:"JetBrains Mono,monospace", size:9.5, fill:"#f87171", tracking:"0.15em" }));
        const docX=sX+44, docY=sY+94, docW=sW-88, docH=152;
        c.appendChild(el("rect", { x:docX, y:docY, width:docW, height:docH, rx:4, fill:"rgba(255,255,255,0.06)", stroke:"rgba(248,113,113,0.5)", "stroke-width":1.5 }));
        // document rows — 28px spacing gives each field room to breathe
        ([["Name:","Rajesh Kumar"],["Aadhaar:","•••• •••• 4521"],["Address:","Flat 4B, Lotus Apt,"],["","Sector 21, New Delhi"]] as string[][]).forEach(([k,v],i) => {
          c.appendChild(t(docX+12, docY+24+i*28, k, { family:"Open Sans,sans-serif", size:10, fill:"#94a3b8" }));
          c.appendChild(t(docX+76, docY+24+i*28, v, { family:"Open Sans,sans-serif", size:10.5, weight:600, fill:"#f1f5f9" }));
        });
        // diagonal watermarks — rotated so they don't sit on top of horizontal text rows
        const wmCx = docX + docW/2;
        ([docY+30, docY+84, docY+134] as number[]).forEach((wy) => {
          const wm = t(wmCx, wy, "PRIYA·4521·JIRA4421", { anchor:"middle", family:"JetBrains Mono,monospace", size:7.5, weight:700, fill:"#f87171", opacity:0.22, tracking:"0.18em" });
          wm.setAttribute("transform", `rotate(-22, ${wmCx}, ${wy})`);
          c.appendChild(wm);
        });
        c.appendChild(t(cx, sY+sH-16, "No download · No clipboard · Every view logged", { anchor:"middle", family:"Open Sans,sans-serif", size:9.5, fill:"#f87171" }));
      } else if (state === "session-expired") {
        c.appendChild(t(cx, sY+80, "Session ended", { anchor:"middle", family:"Open Sans,sans-serif", size:20, weight:700, fill:"#94a3b8" }));
        c.appendChild(el("rect", { x:sX+40, y:sY+110, width:sW-80, height:90, rx:6, fill:"rgba(255,255,255,0.02)", stroke:"rgba(100,116,139,0.2)", "stroke-width":1, "stroke-dasharray":"5 4" }));
        c.appendChild(t(cx, sY+152, "Plaintext wiped from memory", { anchor:"middle", family:"JetBrains Mono,monospace", size:10.5, fill:"#cbd5e1", tracking:"0.15em" }));
        c.appendChild(t(cx, sY+175, "Audit committed · 1 view recorded", { anchor:"middle", family:"Open Sans,sans-serif", size:10.5, fill:"#94a3b8" }));
      } else if (state === "revoked-notification") {
        c.appendChild(t(cx, sY+60, "Webhook received", { anchor:"middle", family:"Open Sans,sans-serif", size:18, weight:700, fill:"#f87171" }));
        c.appendChild(el("rect", { x:sX+26, y:sY+90, width:sW-52, height:120, rx:6, fill:"rgba(248,113,113,0.05)", stroke:"rgba(248,113,113,0.3)", "stroke-width":1 }));
        ["event:        consent.revoked","consent_id:   con_5af23e","user_token:   usr_8a2f","revoked_at:   18:42:00 IST","action_taken: tokens purged"].forEach((l,i) => {
          c.appendChild(t(sX+44, sY+116+i*19, l, { family:"JetBrains Mono,monospace", size:10.5, fill:"#a5f3fc" }));
        });
        c.appendChild(t(cx, sY+sH-18, "Future API calls will fail", { anchor:"middle", family:"Open Sans,sans-serif", size:10.5, fill:"#f87171" }));

      /* ── vault inception desktop states ── */
      } else if (state === "enroll-waiting") {
        c.appendChild(t(cx, sY+54, "ByoSync SDK", { anchor:"middle", family:"Open Sans,sans-serif",
          size:17, weight:700, fill:"#22d3ee" }));
        c.appendChild(t(cx, sY+74, "Identity registry", { anchor:"middle", family:"Open Sans,sans-serif",
          size:11, fill:"#94a3b8" }));
        c.appendChild(el("rect", { x:sX+26, y:sY+92, width:sW-52, height:28, rx:6,
          fill:"rgba(34,211,238,0.05)", stroke:"rgba(34,211,238,0.2)", "stroke-width":1 }));
        c.appendChild(t(sX+44, sY+111, "Awaiting first enrollment from user…", {
          family:"JetBrains Mono,monospace", size:10, fill:"#94a3b8", tracking:"0.05em" }));
        const items = [
          "Identity Registry — empty",
          "Vault Pointer Reg — empty",
          "Consent Ledger     — empty",
          "KMS / HSM          — ready",
        ];
        items.forEach((l, i) => {
          const rowY = sY+134+i*20;
          c.appendChild(t(sX+44, rowY, l, { family:"JetBrains Mono,monospace", size:10.5,
            fill: i === 3 ? "#34d399" : "#cbd5e1" }));
        });
      } else if (state === "enroll-registered") {
        c.appendChild(t(cx, sY+48, "User registered", { anchor:"middle", family:"Open Sans,sans-serif",
          size:16, weight:700, fill:"#34d399" }));
        const boxY = sY + 68;
        const boxH = 88;
        c.appendChild(el("rect", { x:sX+26, y:boxY, width:sW-52, height:boxH, rx:6,
          fill:"rgba(52,211,153,0.05)", stroke:"rgba(52,211,153,0.2)", "stroke-width":1 }));
        ([["user_token","usr_8a2f"],["device_key_fp","3e:9c:f1:…"],["created_at","2024-03-15 14:31"],["vault_ptr","enc_ptr → GDrive"],["fields_enrolled","4"]] as string[][]).forEach(([k,v],i) => {
          const py = boxY + 16 + i * 16;
          c.appendChild(t(sX+40, py, k, { family:"JetBrains Mono,monospace", size:9, fill:"#94a3b8" }));
          c.appendChild(t(sX+sW-40, py, v, { anchor:"end", family:"JetBrains Mono,monospace",
            size:9, weight:700, fill:"#34d399" }));
        });
        c.appendChild(t(cx, sY + sH - 22, "No name · no email · no PII stored here", {
          anchor:"middle", family:"Open Sans,sans-serif", size:9, fill:"#cbd5e1" }));

      /* ── A2A remote-agent desktop states ── */
      } else if (state === "a2a-agent-card") {
        c.appendChild(t(cx, sY+54, "Agent Card verified", { anchor:"middle", family:"Open Sans,sans-serif", size:17, weight:700, fill:"#a78bfa" }));
        c.appendChild(el("rect", { x:sX+26, y:sY+78, width:sW-52, height:138, rx:6, fill:"rgba(167,139,250,0.06)", stroke:"rgba(167,139,250,0.3)", "stroke-width":1 }));
        ([
          ["A2A sig","v1.0 valid"],
          ["KYA principal","did:byosync:shopco"],
          ["dataClasses","VERIFY, OPERATE-STD"],
          ["revocation","ACTIVE"],
          ["scopes","age, address, order"],
        ] as string[][]).forEach(([k,v],i) => {
          const py = sY+102+i*22;
          c.appendChild(t(sX+44, py, k, { family:"JetBrains Mono,monospace", size:10, fill:"#94a3b8" }));
          c.appendChild(t(sX+sW-44, py, v, { anchor:"end", family:"JetBrains Mono,monospace", size:10, weight:700, fill:"#ddd6fe" }));
        });
        c.appendChild(t(cx, sY+sH-18, "OPERATE-SENSITIVE not permitted", { anchor:"middle", family:"Open Sans,sans-serif", size:9.5, fill:"#f87171" }));
      } else if (state === "a2a-task") {
        c.appendChild(t(cx, sY+58, "A2A task received", { anchor:"middle", family:"Open Sans,sans-serif", size:17, weight:700, fill:"#38bdf8" }));
        c.appendChild(el("rect", { x:sX+26, y:sY+82, width:sW-52, height:120, rx:6, fill:"rgba(56,189,248,0.05)", stroke:"rgba(56,189,248,0.25)", "stroke-width":1 }));
        c.appendChild(t(sX+44, sY+108, "parts: tokenized refs only", { family:"JetBrains Mono,monospace", size:10, fill:"#a5f3fc" }));
        c.appendChild(t(sX+44, sY+130, "metadata.byosyncConsentToken", { family:"JetBrains Mono,monospace", size:10, fill:"#a5f3fc" }));
        c.appendChild(t(sX+44, sY+158, "NO raw PII in message body", { family:"JetBrains Mono,monospace", size:10, weight:700, fill:"#34d399", tracking:"0.08em" }));
        c.appendChild(t(cx, sY+sH-18, "Redeem tokens at ByoSync runtime", { anchor:"middle", family:"Open Sans,sans-serif", size:9.5, fill:"#94a3b8" }));
      } else if (state === "a2a-boolean") {
        c.appendChild(t(cx, sY+60, "Verify-token redeemed", { anchor:"middle", family:"Open Sans,sans-serif", size:16, weight:700, fill:"#34d399" }));
        c.appendChild(el("rect", { x:sX+40, y:sY+92, width:sW-80, height:70, rx:6, fill:"rgba(52,211,153,0.08)", stroke:"rgba(52,211,153,0.35)", "stroke-width":1 }));
        c.appendChild(t(cx, sY+132, "age18plus: true", { anchor:"middle", family:"JetBrains Mono,monospace", size:14, weight:700, fill:"#34d399" }));
        c.appendChild(t(cx, sY+158, "DOB never left vault", { anchor:"middle", family:"Open Sans,sans-serif", size:10, fill:"#94a3b8" }));
      } else if (state === "a2a-artifact-order") {
        c.appendChild(t(cx, sY+58, "Order artifact", { anchor:"middle", family:"Open Sans,sans-serif", size:18, weight:700, fill:"#34d399" }));
        c.appendChild(el("rect", { x:sX+26, y:sY+84, width:sW-52, height:100, rx:6, fill:"rgba(52,211,153,0.05)", stroke:"rgba(52,211,153,0.3)", "stroke-width":1 }));
        ([["orderId","ord_9f2a"],["eta","2–3 days"],["item","yellow sapphire"],["paid","₹499 intent"]] as string[][]).forEach(([k,v],i) => {
          const py = sY+108+i*20;
          c.appendChild(t(sX+44, py, k, { family:"JetBrains Mono,monospace", size:10.5, fill:"#94a3b8" }));
          c.appendChild(t(sX+sW-44, py, v, { anchor:"end", family:"JetBrains Mono,monospace", size:10.5, weight:700, fill:"#34d399" }));
        });
      }
    }

    /* ── packet animation: travel existing diagram paths, light line in place ── */
    const PACKET_SEG_MS = 1400;

    function normRouteKey(key: string) {
      if (key === "agent" || key === "agentRight" || key === "agentBottom") return "agent";
      if (key === "coB" || key === "coBLeft") return "coB";
      if (key === "desktop" || key === "desktopLeft") return "desktop";
      return key;
    }

    function findRouteId(fromKey: string, toKey: string) {
      const from = normRouteKey(fromKey);
      const to = normRouteKey(toKey);
      return ROUTE_LOOKUP[routeKey(from, to)] || ROUTE_LOOKUP[routeKey(to, from)] || null;
    }

    function isRouteReversed(fromKey: string, toKey: string) {
      const from = normRouteKey(fromKey);
      const to = normRouteKey(toKey);
      return !ROUTE_LOOKUP[routeKey(from, to)] && !!ROUTE_LOOKUP[routeKey(to, from)];
    }

    interface PacketOpts {
      fromKey: string; toKey: string; label: string;
      color?: string; waypoints?: {x:number;y:number}[];
      onArrive?: () => void; delay?: number;
    }

    function animateOnRoutePath(
      pathEl: SVGPathElement,
      reverse: boolean,
      color: string,
      dot: SVGCircleElement,
      halo: SVGCircleElement,
      ring: SVGCircleElement,
      lbl: SVGElement,
      onDone: () => void,
    ) {
      const len = pathEl.getTotalLength();
      const ms = Math.max(PACKET_SEG_MS, Math.round(len * 2.6));
      const saved = {
        stroke: pathEl.getAttribute("stroke"),
        width: pathEl.getAttribute("stroke-width"),
        opacity: pathEl.getAttribute("opacity"),
        dash: pathEl.getAttribute("stroke-dasharray"),
        offset: pathEl.getAttribute("stroke-dashoffset"),
      };

      pathEl.classList.add("sf-route-lit");
      pathEl.setAttribute("stroke", color);
      pathEl.setAttribute("stroke-width", String(parseFloat(saved.width || "1") + 2.2));
      pathEl.setAttribute("stroke-dasharray", `${len}`);
      pathEl.setAttribute("stroke-dashoffset", reverse ? "0" : String(len));

      const startPt = pathEl.getPointAtLength(reverse ? len : 0);
      dot.setAttribute("cx", String(startPt.x));
      dot.setAttribute("cy", String(startPt.y));
      halo.setAttribute("cx", String(startPt.x));
      halo.setAttribute("cy", String(startPt.y));
      ring.setAttribute("cx", String(startPt.x));
      ring.setAttribute("cy", String(startPt.y));
      lbl.setAttribute("transform", `translate(${startPt.x},${startPt.y - 24})`);

      const t0 = performance.now();
      function frame(now: number) {
        const t = Math.min(1, (now - t0) / ms);
        const eased = 1 - Math.pow(1 - t, 2.2);
        const at = reverse ? (1 - eased) * len : eased * len;
        const pt = pathEl.getPointAtLength(at);
        dot.setAttribute("cx", String(pt.x));
        dot.setAttribute("cy", String(pt.y));
        halo.setAttribute("cx", String(pt.x));
        halo.setAttribute("cy", String(pt.y));
        ring.setAttribute("cx", String(pt.x));
        ring.setAttribute("cy", String(pt.y));
        lbl.setAttribute("transform", `translate(${pt.x},${pt.y - 24})`);
        pathEl.setAttribute("stroke-dashoffset", reverse ? String(eased * len) : String(len - eased * len));

        if (t < 1) requestAnimationFrame(frame);
        else {
          pathEl.classList.remove("sf-route-lit");
          if (saved.stroke) pathEl.setAttribute("stroke", saved.stroke);
          if (saved.width) pathEl.setAttribute("stroke-width", saved.width);
          if (saved.opacity != null) pathEl.setAttribute("opacity", saved.opacity);
          if (saved.dash) pathEl.setAttribute("stroke-dasharray", saved.dash);
          else pathEl.removeAttribute("stroke-dasharray");
          if (saved.offset) pathEl.setAttribute("stroke-dashoffset", saved.offset);
          else pathEl.removeAttribute("stroke-dashoffset");
          onDone();
        }
      }
      requestAnimationFrame(frame);
    }

    function makePacket({ fromKey, toKey, label, color="#22d3ee", waypoints, onArrive, delay=0 }: PacketOpts) {
      setTimeout(() => {
        const start = ANCHOR[fromKey] || ANCHOR.phone;
        const routeId = findRouteId(fromKey, toKey);
        const reverse = routeId ? isRouteReversed(fromKey, toKey) : false;

        const g = el("g", { opacity: "0" });
        const halo = el("circle", {
          cx: start.x, cy: start.y, r: 12, fill: color, opacity: 0.3, filter: "url(#sf-flow-glow)",
        }) as SVGCircleElement;
        const ring = el("circle", {
          cx: start.x, cy: start.y, r: 5, fill: "none", stroke: color, "stroke-width": 2, class: "sf-pulse-ring",
        }) as SVGCircleElement;
        const dot = el("circle", {
          cx: start.x, cy: start.y, r: 7, fill: "#f8fafc", stroke: color, "stroke-width": 2.5, filter: "url(#sf-glow)",
        }) as SVGCircleElement;
        const lbl = el("g", { transform: `translate(${start.x},${start.y - 24})` }) as SVGGElement;
        const lblW = Math.max(72, label.length * 6.5 + 20);
        lbl.appendChild(el("rect", {
          x: -lblW / 2, y: -12, width: lblW, height: 20, rx: 5,
          fill: "#0a1628", stroke: color, "stroke-width": 1.2, opacity: 0.97,
        }));
        const txt = document.createElementNS(SVG_NS, "text");
        txt.setAttribute("x", "0"); txt.setAttribute("y", "2");
        txt.setAttribute("text-anchor", "middle");
        txt.setAttribute("font-family", "JetBrains Mono,monospace");
        txt.setAttribute("font-size", "10");
        txt.setAttribute("font-weight", "700");
        txt.setAttribute("fill", "#e2e8f0");
        txt.textContent = label;
        lbl.appendChild(txt);
        g.appendChild(halo);
        g.appendChild(ring);
        g.appendChild(dot);
        g.appendChild(lbl);

        const packetLayer = scene.querySelector<SVGGElement>("#sf-packets");
        if (packetLayer) packetLayer.appendChild(g);
        requestAnimationFrame(() => g.setAttribute("opacity", "1"));

        const finish = () => {
          setTimeout(() => {
            g.setAttribute("opacity", "0");
            setTimeout(() => g.parentNode?.removeChild(g), 320);
            onArrive && onArrive();
          }, 220);
        };

        if (routeId) {
          const pathEl = scene.querySelector<SVGPathElement>(`#sf-route-${routeId}`);
          if (pathEl) {
            animateOnRoutePath(pathEl, reverse, color, dot, halo, ring, lbl, finish);
            return;
          }
        }

        /* fallback: phone→vault arc when waypoints used for direct vault upload */
        if (waypoints?.length && normRouteKey(fromKey) === "phone" && normRouteKey(toKey) === "vaultTop") {
          const vaultPath = scene.querySelector<SVGPathElement>("#sf-route-phone-vault");
          if (vaultPath) {
            animateOnRoutePath(vaultPath, false, color, dot, halo, ring, lbl, finish);
            return;
          }
        }

        finish();
      }, delay);
    }

    function highlightDevice(id: string, ms=1200) {
      const g = scene.querySelector(`#sf-node-${id}`);
      if (!g) return;
      g.classList.add("sf-node-active");
      setTimeout(() => g.classList.remove("sf-node-active"), ms);
    }
    function clearAllHighlights() {
      scene.querySelectorAll(".sf-device").forEach(d => d.classList.remove("sf-node-active"));
    }

    /* ── scenario data ── */
    type Step = { label:string; narration:string; side:{ num:string; title:string; desc:string; crypto:string; resp:{ tags:string[]; text:string } }; action:(done:()=>void)=>void };
    const SCENARIOS: Record<string, Step[]> = {

      vault_inception: [
        /* ── v2 TARGET (BYOSYNC_FLOW_V2_ENCLAVE_TARGET.md) ───────────────
           Parent EC2 = blind relay (ciphertext in, signed result out).
           Nitro enclave = hybridDecrypt, BCH enroll, PII envelope, KMS wrap.
           Mongo = phoneHash + KMS-wrapped templates + wrapped OAuth + pointers.
           Drive = AES-GCM identity blob; DEK per-user, PCR-gated KMS.
        ──────────────────────────────────────────────────────────────────*/

        { label:"First launch — nothing stored yet",
          narration:"The user opens ByoSync for the first time. Nothing has been captured, transmitted, or stored. The app presents a clear, itemised notice before any enrollment begins.",
          side:{ num:"01 / 09", title:"Zero-state start",
            desc:"ByoSync follows DPDP Rule 3: a plain-language, itemised notice is shown <strong>before</strong> any data is collected. The user can read it, close the app, and nothing happens.",
            crypto:"// State of the world right now\nByoSync DB:         empty\nVaultPointerReg:    empty\nUser's Cloud Vault: empty\nSecureEnclave:      empty\nNetwork traffic:    none",
            resp:{ tags:["dpdp"], text:"DPDP Section 6(1) — free, specific, informed consent required. Rule 3 — itemised notice before collection. No data = no obligation yet." } },
          action:(done)=>{ renderPhoneScene("enroll-start"); renderDesktopScene("enroll-waiting"); highlightDevice("phone",1200); setTimeout(done,1000); } },

        { label:"Face + voice enrollment — on-device fuzzy extractor",
          narration:"Multi-modal biometric capture runs entirely on the phone. Face geometry and voice prosody are fed into a fuzzy extractor that produces helper_data and k2. Raw samples zeroed immediately.",
          side:{ num:"02 / 09", title:"On-device enrollment · helper_data + k2",
            desc:"A <strong>fuzzy extractor</strong> produces two outputs: <strong>helper_data</strong> (safe to store publicly — cannot reverse a biometric from it) and <strong>k2</strong> (a key share that only reproduces when the same face + voice is presented again). Raw biometrics are <strong>immediately zeroed</strong>.",
            crypto:"// Fuzzy extractor — two outputs\n(helper_data, k2) :=\n  FuzzyExtract.generate(\n    face_geometry_vector,  // from camera\n    voice_prosody_vector   // from mic\n  )\n\n// Raw inputs gone immediately\nzero(face_geometry_vector)\nzero(voice_prosody_vector)\n\n// Only helper_data and k2 survive on-device",
            resp:{ tags:["dpdp","soc2"], text:"DPDP Rule 6(1)(a) — raw biometric never stored or transmitted. SOC 2 CC6 — biometric captured at minimum-necessary scope. helper_data alone cannot reconstruct the face or voice." } },
          action:(done)=>{ renderPhoneScene("enroll-capture"); highlightDevice("phone",1600); setTimeout(done,1600); } },

        { label:"Secure Enclave generates random User Master Key",
          narration:"The Secure Enclave generates a cryptographically random UMK. k2 + device hardware key activate the Enclave to produce it. Face does not derive or encrypt the UMK — it only unlocks the device to produce it.",
          side:{ num:"03 / 09", title:"UMK birth — random, not biometric-derived",
            desc:"<strong>Critical architecture point:</strong> the UMK is a random 256-bit key. Biometrics (via k2) are the <em>activation factor</em> to release it, not the derivation source. Spoofing the face without the hardware device key still cannot release the UMK.",
            crypto:"// Inside Secure Enclave (TEE)\nUMK := SecureRandom.bytes(32)   // pure random\n\n// Wrap with two-factor protection:\nwrapped_UMK := Enclave.wrap(\n  UMK,\n  kdf(k2, device_hw_key)  // biometric + hardware\n)\n\n// Store only the wrapped form; UMK and k2 zeroed\nzero(UMK); zero(k2)",
            resp:{ tags:["soc2","pci"], text:"SOC 2 CC6.1 — hardware-backed key protection. PCI DSS 4.0.1 Req 3.6 — key management lifecycle. Random UMK means biometric compromise alone does not expose vault contents." } },
          action:(done)=>{ renderPhoneScene("enroll-keygen"); highlightDevice("phone",1800); setTimeout(done,1800); } },

        { label:"Hybrid ciphertext → parent relay → Nitro enclave",
          narration:"Registration payload (face embeddings + PII fields) is hybrid-encrypted on the phone. The parent server never decrypts — it forwards the blob over vsock into an attested Nitro enclave.",
          side:{ num:"04 / 09", title:"Parent is blind · enclave decrypts",
            desc:"<strong>v2 change:</strong> RSA private key lives in KMS, released only to the enclave (PCR-gated). The parent EC2 operator, a memory dump, or a compromised dependency on the relay tier cannot read embeddings or PII.",
            crypto:"// Phone → Parent (TLS)\nPOST /v1/user/register\n{ encryptedData, encryptedAESKey, iv }\n\n// Parent → Enclave (vsock, unchanged ciphertext)\nvsock.send(enroll_op, body)\n\n// Inside Nitro enclave ONLY:\nplain := hybridDecrypt(body)\nphoneHash, emailHash := HMAC(plain.phone, plain.email)\ntemplates := BCH_register(plain.faceId)  // then KMS-wrap\n\n// Parent never sees: plain",
            resp:{ tags:["dpdp","soc2"], text:"Trust boundary: attested enclave. Parent sees ciphertext in, signed result out — never plaintext biometric bits or PII." } },
          action:(done)=>{ makePacket({ fromKey:"phone",toKey:"byoLeft",label:"Hybrid cipher",color:"#22d3ee",onArrive:()=>{ highlightDevice("byosync",800); makePacket({ fromKey:"byoBottom",toKey:"enclaveTop",label:"vsock ↓ decrypt",color:"#f472b6",onArrive:()=>{ highlightDevice("enclave",1400); renderDesktopScene("enroll-registered"); setTimeout(()=>{ makePacket({ fromKey:"enclaveTop",toKey:"byoBottom",label:"KMS wrap ↑",color:"#34d399",onArrive:()=>{ highlightDevice("byosync",600); makePacket({ fromKey:"byoRight",toKey:"desktop",label:"Signed OK",color:"#34d399",onArrive:()=>done() }); } }); },400); } }); } }); } },

        { label:"Enclave builds PII envelope → parent uploads to Drive",
          narration:"Inside the enclave: identity JSON is encrypted with a per-user DEK (KMS-wrapped, PCR-gated). The parent performs the Google HTTPS upload but only handles ciphertext — the enclave never gives it the DEK.",
          side:{ num:"05 / 09", title:"PII encrypted in enclave · relay to vault",
            desc:"<strong>v2 removes DRIVE_MASTER_KEY on the parent.</strong> Per-user DEK is wrapped by KMS with RecipientAttestation:PCR0. Optional defense-in-depth: final unwrap also requires a live BCH match.",
            crypto:"// Inside enclave\nidentity := { name, phone, email, registeredAt }\nDEK_user := SecureRandom(32)\nenvelope := AES_GCM(identity, DEK_user)\nwrapped_DEK := KMS.wrap(DEK_user, PCR0=enclave)\n\n// Parent googleProxy (cipher only)\nPUT Drive user_identity.json\n  body: { v:2, encrypted, iv, tag, wrapped_DEK }\n\n// Mongo (from enclave output, all wrapped):\nphoneHash, emailHash, faceData_KMS, oauth_KMS, fileId",
            resp:{ tags:["dpdp","soc2","pci"], text:"Operator cannot decrypt Drive blobs without attested enclave + KMS policy + (optionally) live biometric." } },
          action:(done)=>{ renderPhoneScene("enroll-kyc"); highlightDevice("enclave",1000); setTimeout(()=>{
            makePacket({
              fromKey:"enclaveBottom", toKey:"vaultTop",
              label:"PII cipher ↓",
              color:"#34d399",
              onArrive:()=>{ highlightDevice("vault",1400); setTimeout(done,700); }
            });
          },800); } },

        { label:"Vault inception complete · wrapped stores only",
          narration:"Registration finishes. Mongo holds only hashes, KMS-wrapped BCH templates, wrapped OAuth tokens, and a Drive file pointer. The vault holds the encrypted identity envelope.",
          side:{ num:"06 / 09", title:"Mongo + vault · no plaintext at rest",
            desc:"Neither Mongo nor the parent server ever stored plaintext PII or usable biometric templates. Only the attested enclave briefly held plaintext during the request — then memory was wiped.",
            crypto:"// Mongo (parent writes what enclave returns)\nphoneHash, emailHash\nfaceData[]: KMS-wrapped BCH blobs\noauth: KMS-wrapped refresh token\ndriveFiles: [{ fileId, type:'identity' }]\n\n// Google Drive\n{ v:2, encrypted, iv, tag }  // DEK inside KMS wrap\n\n// Parent invariant\nNEVER: plaintext PII, live embeddings, DEK",
            resp:{ tags:["dpdp","soc2"], text:"Breach of parent EC2 or Mongo dump: ciphertext and hashes only — not enough to impersonate users or read identity." } },
          action:(done)=>{ renderPhoneScene("enroll-complete"); highlightDevice("phone",1200); highlightDevice("vault",1200); highlightDevice("byosync",1200); setTimeout(done,1400); } },

        { label:"Future consent: enclave fetch → filter → encrypt-to-company",
          narration:"Later, when a company needs data, the parent fetches the Drive ciphertext via googleProxy. The enclave decrypts, filters to consented fields, and re-encrypts to the company's public key — the parent relays ciphertext only.",
          side:{ num:"07 / 09", title:"Share path (v2) · company decrypts",
            desc:"See <strong>Scenario 07 — Encrypted field share</strong>. Closes the v1 gap where companies received plain JSON over HTTPS.",
            crypto:"// Enclave (consent ACTIVE)\nblob := googleProxy.fetch(fileId)  // cipher only\nplain := decryptDrive(blob, DEK_user)  // KMS+PCR\nsubset := filter(plain, consent.sharedFields)\ncipher_co := encrypt(subset, company_pubkey)\nsign := enclave_key.sign(cipher_co)\n\n// Audit (hash-chained)\nentry_n := { event, consentId, ts, prevHash }",
            resp:{ tags:["dpdp","soc2"], text:"ByoSync operator cannot read shared PII. Company decrypts client-side with its own private key." } },
          action:(done)=>{ highlightDevice("enclave",1200); setTimeout(()=>{ makePacket({ fromKey:"enclaveBottom",toKey:"vaultTop",label:"Fetch cipher",color:"#60a5fa",onArrive:()=>{ makePacket({ fromKey:"vaultTop",toKey:"enclaveBottom",label:"vsock up",color:"#f472b6",onArrive:()=>{ makePacket({ fromKey:"enclaveRight",toKey:"desktop",label:"To company",color:"#34d399",onArrive:()=>done() }); } }); } }); },600); } },

        { label:"v1 vs v2 — why the enclave matters",
          narration:"Today's production server decrypts in normal Node RAM. v2 moves every sensitive operation into an attested enclave so the 'zero data, not even ByoSync' claim is true for the operator.",
          side:{ num:"08 / 09", title:"Honest migration story",
            desc:"<strong>v1 (current):</strong> hybridDecrypt + getIdentity + BCH verify on parent → operator can see everything in RAM.<br/><br/><strong>v2 (target):</strong> parent relays ciphertext; Nitro enclave decrypts; PCR-gated KMS; encrypt-to-company.",
            crypto:"// ✗ v1 parent (remove)\nplain := hybridDecrypt(req.body)   // in Node RAM\nidentity := decryptDrive(blob)     // DRIVE_MASTER_KEY\nsharedData := plain JSON to company\n\n// ✓ v2 target\nparent.relay(ciphertext) → enclave\nenclave → { signed, cipher_to_company }\nparent NEVER holds plain",
            resp:{ tags:["dpdp","soc2"], text:"Aligns marketing with production. Migration order: KMS-gate keys → enclave for verify+decrypt → per-user DEK → encrypt-to-company." } },
          action:(done)=>{ highlightDevice("byosync",1000); highlightDevice("enclave",1000); highlightDevice("vault",1000); setTimeout(done,1400); } },

        { label:"Foundation set → try encrypted field share",
          narration:"Vault inception is complete. Next: Scenario 01 (boolean proof) or Scenario 07 (encrypted field share) for the full user→company path under v2.",
          side:{ num:"09 / 09", title:"Ready for consent flows",
            desc:"Parent = blind relay. Enclave = trust. Vault = encrypted PII. Company = decrypts only what was encrypted for its pubkey.",
            crypto:"INVARIANT (v2):\n  Parent / Mongo / operator root:\n    ciphertext + hashes only\n  Enclave:\n    brief plaintext, then zeroed\n  Company:\n    decrypts sharedData locally",
            resp:{ tags:["dpdp","soc2","pci"], text:"Target spec: BYOSYNC_FLOW_V2_ENCLAVE_TARGET.md. Production today: see BYOSYNC_BIOMETRIC_AND_DATA_FLOW.txt (v1)." } },
          action:(done)=>{ renderPhoneScene("enroll-complete"); highlightDevice("phone",1000); highlightDevice("vault",800); setTimeout(done,1200); } },
      ],

      boolean: [
        { label:"User opens partner app", narration:"On a worker-onboarding app, the user is asked to verify themselves. The partner has the ByoSync SDK embedded — but no user data yet.", side:{ num:"01 / 09", title:"User initiates", desc:"The phone shows the partner's screen with the ByoSync SDK loaded. Nothing has been transmitted. Nothing has been encrypted yet. This is the moment before consent.", crypto:"// Pre-enrollment. No crypto yet.", resp:{ tags:["dpdp"], text:"DPDP Rule 3 — partner must show an itemized, plain-language notice before any consent request. ByoSync renders this on partner's behalf." } },
          action:(done)=>{ renderPhoneScene("scanning"); highlightDevice("phone",1400); setTimeout(done,900); } },
        { label:"Local face + voice + liveness", narration:"Multi-modal capture runs on-device. Face geometry. Voice prosody. Anti-replay challenge. Raw biometrics never leave the phone.", side:{ num:"02 / 09", title:"Authentication is local", desc:"Liveness check is <strong>on-device</strong>. Raw images and audio never enter the network.", crypto:"face_embed  := localCamera.extract()\nvoice_embed := localMic.extract()\nlive_token  := fuzzyExtract(face_embed, voice_embed,\n                            helper, k2, salt)\nzero(face_embed); zero(voice_embed)", resp:{ tags:["dpdp","soc2"], text:"DPDP Rule 6(1)(a) — raw biometric never stored. SOC 2 CC6 — multi-factor authentication." } },
          action:(done)=>{ renderPhoneScene("scanning"); highlightDevice("phone"); setTimeout(done,1500); } },
        { label:"Secure Enclave releases User Master Key", narration:"Live token + device hardware key cause the Secure Enclave to release the User Master Key. The UMK is random — never derived from biometrics.", side:{ num:"03 / 09", title:"Envelope unwrap", desc:"<strong>Face does not encrypt anything.</strong> It is the activation factor that authorizes the Secure Enclave to <strong>release</strong> the random User Master Key.", crypto:"if verify(live_token, helper, k2) && device_key_valid:\n   UMK := SecureEnclave.unwrap(wrapped_UMK)\nelse:\n   abort()", resp:{ tags:["soc2","pci"], text:"SOC 2 CC6.1 logical access. PCI DSS 4.0.1 Req 3.5/3.6 — keys protected by hardware where possible." } },
          action:(done)=>{ renderPhoneScene("scanning"); highlightDevice("phone"); setTimeout(done,1400); } },
        { label:"Partner sends boolean request", narration:"The partner's desktop console submits a structured request: 'is this user over 18 and KYC-verified?' — boolean mode by default.", side:{ num:"04 / 09", title:"Request crosses the wire", desc:"Request is signed with mTLS-bound API key. Default mode is <strong>boolean</strong> — the answer is yes or no, never the underlying data.", crypto:"POST /v1/access-request  (mTLS)\n{\n  user:    'usr_8a2f',\n  purpose: 'worker_onboarding',\n  fields:  ['age_over_18', 'kyc_verified'],\n  mode:    'boolean',\n  expiry:  '10m'\n}", resp:{ tags:["dpdp","soc2"], text:"DPDP Rule 3(b) — itemized data + specified purpose. SOC 2 CC6.7 — secure transmission (mTLS, TLS 1.3)." } },
          action:(done)=>{ renderDesktopScene("requesting"); highlightDevice("desktop",1400); setTimeout(()=>{ makePacket({ fromKey:"desktop",toKey:"byoRight",label:"Request",color:"#fbbf24",onArrive:()=>{ highlightDevice("byosync",1400); done(); } }); },600); } },
        { label:"User receives consent prompt", narration:"ByoSync pushes a consent screen to the phone. Specific. Itemized. The user sees exactly what's being asked.", side:{ num:"05 / 09", title:"Consent prompt", desc:"On the phone, the user sees the requesting company, fields, purpose, duration. No mystery, no hidden bundling.", crypto:"{\n  consent_id: 'con_5af23e',\n  company:    'AcmePay',\n  fields:     ['age_over_18', 'kyc_verified'],\n  purpose:    'worker_onboarding',\n  expiry:     '18:30 IST'\n}", resp:{ tags:["dpdp"], text:"DPDP Section 6(1) — free, specific, informed, unambiguous consent. Section 6(4) — withdrawal must be as easy as approval." } },
          action:(done)=>{ makePacket({ fromKey:"byoLeft",toKey:"phone",label:"Consent prompt",color:"#60a5fa",onArrive:()=>{ renderPhoneScene("consent-prompt"); highlightDevice("phone",1500); done(); } }); } },
        { label:"User approves with face + voice", narration:"User taps approve. A second face + voice scan signs this specific consent. Replay is impossible.", side:{ num:"06 / 09", title:"Intent-bound signature", desc:"Approval is bound to <strong>this specific consent_id, nonce, timestamp, and device key</strong>. The same scan cannot be redirected.", crypto:"intent := consent_id || fields || purpose || nonce || ts\nsig    := DeviceKey.sign(intent)\n\nPOST /v1/consent/approve\n{\n  consent_id: 'con_5af23e',\n  signature:  '0x9af1...e302'\n}", resp:{ tags:["dpdp","soc2"], text:"DPDP Section 6(1) — affirmative action. SOC 2 Processing Integrity — replay protection through nonce + timestamp + intent." } },
          action:(done)=>{ renderPhoneScene("approved"); highlightDevice("phone",1200); setTimeout(()=>{ makePacket({ fromKey:"phone",toKey:"byoLeft",label:"Signed approval",color:"#34d399",onArrive:()=>{ highlightDevice("byosync",1400); done(); } }); },800); } },
        { label:"Parent fetches Drive ciphertext (googleProxy)", narration:"Policy engine validates consent, then the parent calls Google Drive on behalf of the enclave. Only the encrypted identity blob crosses the wire — never plaintext.", side:{ num:"07 / 09", title:"Vault fetch · cipher only", desc:"The <strong>googleProxy</strong> on the parent performs HTTPS to Drive. The enclave issued a scoped fetch instruction; the parent cannot decrypt the blob.", crypto:"// Parent googleProxy\nrefresh := KMS.unwrap(oauth)  // enclave-only path\nblob_cipher := Drive.files.get(fileId)\nvsock → enclave: blob_cipher\n\n// Parent never: decryptDrive(blob)", resp:{ tags:["dpdp","soc2","pci"], text:"OAuth refresh token also KMS-wrapped — unwrap only inside enclave." } },
          action:(done)=>{ makePacket({ fromKey:"byoBottom",toKey:"vaultTop",label:"googleProxy fetch",color:"#60a5fa",onArrive:()=>{ highlightDevice("vault",1200); makePacket({ fromKey:"vaultTop",toKey:"enclaveBottom",label:"Cipher ↑",color:"#f472b6",onArrive:()=>{ highlightDevice("enclave",1200); done(); } }); } }); } },
        { label:"Nitro enclave: decrypt → boolean → sign", narration:"Inside the attested enclave the blob is decrypted, the boolean answer computed, then a signed JWS assertion is produced. Plaintext and DEK are zeroed before the response leaves the enclave.", side:{ num:"08 / 09", title:"Compute in TEE · wipe RAM", desc:"Decryption and computation happen <strong>only inside Nitro</strong>. The parent receives a signed assertion — not field values.", crypto:"// Nitro enclave only\nplain := decryptDrive(blob, DEK_user)\nresult := { age_over_18: true, kyc_verified: true }\nzero(plain); zero(DEK_user)\n\nassertion := JWS_sign({ consent_id, result, ... })\nvsock → parent: assertion\n\naudit.append({ event, prevHash: SHA256(prev) })", resp:{ tags:["dpdp","soc2"], text:"Hash-chained audit. Operator cannot read result fields from server RAM." } },
          action:(done)=>{ highlightDevice("enclave",1600); setTimeout(done,1500); } },
        { label:"Company receives signed proof", narration:"AcmePay receives a JWS proof — a few hundred bytes. No PII. No documents. The user is verified.", side:{ num:"09 / 09", title:"Proof delivered", desc:"Company stores only the <strong>signed assertion</strong> and the consent_id. <strong>No PII enters the company's database.</strong>", crypto:"{\n  consent_id:  'con_5af23e',\n  assertion: { age_over_18: true, kyc_verified: true },\n  signature:  'eyJhbGc...'\n}\n\n// For field-level PII → Scenario 07 (encrypt-to-company)", resp:{ tags:["dpdp","soc2","pci"], text:"Boolean path: minimal disclosure. Field share uses company pubkey encryption (v2)." } },
          action:(done)=>{ makePacket({ fromKey:"enclaveTop",toKey:"byoBottom",label:"Signed proof ↑",color:"#60a5fa",onArrive:()=>{ highlightDevice("byosync",800); makePacket({ fromKey:"byoRight",toKey:"desktop",label:"JWS out",color:"#60a5fa",onArrive:()=>{ renderDesktopScene("result-boolean"); highlightDevice("desktop",1400); setTimeout(()=>{ makePacket({ fromKey:"enclaveTop",toKey:"byoBottom",label:"Audit hash",color:"#34d399",onArrive:()=>done() }); },500); } }); } }); } },
      ],
      payment: [
        { label:"User picks item, proceeds to checkout", narration:"On the partner's e-commerce app, the user picks an item worth ₹2,500. Their card was tokenized at first save — it lives in the vault as a token, not a PAN.", side:{ num:"01 / 10", title:"Checkout begins · no PAN on partner", desc:"The partner has never stored the user's card number. Only <strong>tok_card_4382</strong>. The real PAN sits encrypted in the user's vault.", crypto:"// Partner DB row\nuser_id:       'usr_8a2f'\npayment_token: 'tok_card_4382'\n// No PAN, no CVV — out of CDE.", resp:{ tags:["pci"], text:"PCI DSS 4.0.1 Req 3 — storing tokens not PAN dramatically reduces the partner's Cardholder Data Environment scope." } },
          action:(done)=>{ renderDesktopScene("payment-checkout"); highlightDevice("desktop",1400); setTimeout(done,1100); } },
        { label:"Partner sends payment intent to ByoSync", narration:"The partner submits a payment intent and asks ByoSync to obtain the user's strong customer authentication.", side:{ num:"02 / 10", title:"Payment intent created", desc:"ByoSync's role: orchestrate <strong>2FA / SCA</strong> bound to this specific transaction. ByoSync does <strong>not</strong> see the PAN.", crypto:"POST /v1/payment/intent  (mTLS)\n{\n  amount: 250000, currency: 'INR',\n  merchant: 'AcmePay', order_id: '#4421',\n  payment_token: 'tok_card_4382',\n  user: 'usr_8a2f', txn_nonce: 'a7e2...'\n}", resp:{ tags:["pci","soc2"], text:"PCI DSS Req 4 — strong cryptography in transit. PCI DSS Req 8.4 — MFA required for cardholder flows." } },
          action:(done)=>{ makePacket({ fromKey:"desktop",toKey:"byoRight",label:"Payment intent",color:"#fbbf24",onArrive:()=>{ highlightDevice("byosync",1300); done(); } }); } },
        { label:"ByoSync pushes 2FA challenge to phone", narration:"ByoSync sends the user's phone a strong customer authentication challenge — bound to the exact transaction.", side:{ num:"03 / 10", title:"SCA challenge dispatched", desc:"Challenge is built with the <strong>exact intent string</strong>: amount, merchant, order, nonce, expiry. This is what the user will sign with face + voice.", crypto:"challenge := {\n  intent_string: 'pay ₹2500 to AcmePay order #4421',\n  nonce: 'a7e2...', expires_at: now + 90s\n}\nPush(user_device, challenge)", resp:{ tags:["pci","dpdp"], text:"PCI DSS Req 8.4.2 — MFA for any non-console access. Eliminates the OTP-scam pattern." } },
          action:(done)=>{ makePacket({ fromKey:"byoLeft",toKey:"phone",label:"SCA challenge",color:"#fbbf24",onArrive:()=>{ renderPhoneScene("consent-prompt-payment"); highlightDevice("phone",1500); done(); } }); } },
        { label:"User reviews amount + merchant", narration:"The phone shows the exact amount, the merchant name, the order, the payment token. The user can refuse.", side:{ num:"04 / 10", title:"User confirms intent", desc:"What the user sees is what they're approving. <strong>The amount and merchant are inside the signed intent.</strong>", crypto:"// What the user reads on screen\n• Pay ₹2,500.00  • To: AcmePay\n• Order: #4421   • Card: ending 4382\n• Expires in: 89 seconds", resp:{ tags:["dpdp","pci"], text:"DPDP Section 6(1) — specific, informed. A scammer cannot change the amount without invalidating the signature." } },
          action:(done)=>{ renderPhoneScene("consent-prompt-payment"); highlightDevice("phone",1200); setTimeout(done,1000); } },
        { label:"Face + voice authentication runs", narration:"Multi-modal liveness. Anti-deepfake. Anti-clone. Both modalities must independently pass.", side:{ num:"05 / 10", title:"Multi-modal SCA", desc:"Face liveness + Voice anti-spoof. <strong>A deepfake of one modality cannot bypass the other.</strong>", crypto:"face_ok  := faceLiveness(camera, depth, blink)\nvoice_ok := voiceLiveness(mic, passphrase, prosody)\nrequire(face_ok && voice_ok)", resp:{ tags:["pci","soc2"], text:"PCI DSS Req 8.4 — strong MFA. SOC 2 CC6.1 — multiple authentication factors." } },
          action:(done)=>{ renderPhoneScene("scanning"); highlightDevice("phone",1500); setTimeout(done,1500); } },
        { label:"Device signs the payment intent", narration:"Live token + Secure Enclave key produce a signature over the exact payment intent.", side:{ num:"06 / 10", title:"Intent-bound signature", desc:"Signature is over the <strong>complete intent string</strong> — amount, merchant, order, nonce, timestamp. Replay impossible.", crypto:"intent := amount || merchant || order_id\n           || payment_token || nonce || ts\nsignature := DeviceKey.sign(intent)\n\nPOST /v1/payment/auth { intent, signature }", resp:{ tags:["pci","soc2"], text:"PCI DSS Req 8.4 + Req 10. Same signature cannot be used for another transaction." } },
          action:(done)=>{ renderPhoneScene("approved"); highlightDevice("phone",1200); setTimeout(()=>{ makePacket({ fromKey:"phone",toKey:"byoLeft",label:"Signed auth",color:"#34d399",onArrive:()=>{ highlightDevice("byosync",1300); done(); } }); },800); } },
        { label:"ByoSync issues SCA proof token", narration:"ByoSync verifies the signature and issues a one-time SCA proof token.", side:{ num:"07 / 11", title:"SCA proof minted", desc:"ByoSync proves the human was present and approved. No PAN. No CVV. ByoSync architecturally outside PCI CDE.", crypto:"sca_proof := JWS_sign({\n  txn_nonce, intent_hash, user_id,\n  factors: ['face', 'voice', 'device_key'],\n  verified_at: now\n}, ByoSync_signing_key)", resp:{ tags:["pci","soc2"], text:"ByoSync architecturally outside CDE; only handles authentication evidence." } },
          action:(done)=>{ highlightDevice("byosync",1500); setTimeout(()=>{ makePacket({ fromKey:"byoRight",toKey:"desktop",label:"SCA proof",color:"#60a5fa",onArrive:()=>{ highlightDevice("desktop",1200); done(); } }); },600); } },
        { label:"Verified — payment tokens committed to vault", narration:"User is verified. Card, bank, and UPI tokens were tokenized on first save and live encrypted in the user's vault. ByoSync and the partner never see a raw PAN or account number.", side:{ num:"08 / 11", title:"Payment data secured in vault · tokenized", desc:"On first save, raw card/bank/UPI details are <strong>tokenized then encrypted</strong> before entering the vault. ByoSync holds only the vault pointer — never the tokens themselves.", crypto:"// First-time tokenization (done once at card save)\ntok_card := networkTokenize(PAN)          // e.g. Visa Token\ntok_bank := tokenize(IFSC + ACCT_NO)      // VPA token\ntok_upi  := tokenize(UPI_ID)\n\n// Vault stores tokens encrypted\nvault.store({\n  tok_card: AES_enc(tok_card, DEK),\n  tok_bank: AES_enc(tok_bank, DEK),\n  tok_upi:  AES_enc(tok_upi,  DEK),\n  wrapped_DEK: KMS_wrap(DEK, UMK_ref)\n})\n// ByoSync DB: vault_ptr_enc only — no tokens, no PAN", resp:{ tags:["pci","dpdp"], text:"PCI DSS 4.0.1 Req 3 — network tokenization eliminates PAN from partner and ByoSync entirely. DPDP — user owns and controls their financial tokens in their own vault." } },
          action:(done)=>{ renderPhoneScene("payment-vault"); highlightDevice("phone",1200); setTimeout(()=>{ makePacket({ fromKey:"phone",toKey:"vaultTop",label:"Encrypted tokens",color:"#60a5fa",onArrive:()=>{ highlightDevice("vault",1300); done(); } }); },700); } },
        { label:"Partner submits to payment processor", narration:"Partner submits the tokenized card + amount + SCA proof to the payment processor.", side:{ num:"09 / 11", title:"Processor captures payment", desc:"Processor receives <strong>tok_card_4382 + amount + SCA proof</strong>. Processor de-tokenizes inside its PCI-CDE environment.", crypto:"POST processor.com/v1/charge\n{\n  payment_token: 'tok_card_4382',\n  amount: 250000, currency: 'INR',\n  sca_proof: '<JWS>'\n}\n→ de-tokenize → Issuer auth → Capture", resp:{ tags:["pci"], text:"The only PCI CDE here is the payment processor's. Partner and ByoSync are out of scope." } },
          action:(done)=>{ renderDesktopScene("payment-checkout"); highlightDevice("desktop",1300); setTimeout(done,1100); } },
        { label:"Processor confirms · audit committed", narration:"Payment captured. ByoSync writes the audit entry.", side:{ num:"10 / 11", title:"Confirmation + audit", desc:"Audit log is <strong>append-only, hash-chained, WORM</strong>. Immutable record of every factor used.", crypto:"audit.append({\n  event: 'payment_authorized',\n  user_id: 'usr_8a2f', merchant: 'AcmePay',\n  amount: 250000,\n  factors: ['face', 'voice', 'device_key']\n})", resp:{ tags:["pci","soc2","dpdp"], text:"PCI DSS Req 10 — log and monitor. SOC 2 CC4. DPDP Rule 6(1)(c)+(e) — logs retained 1 year minimum." } },
          action:(done)=>{ renderDesktopScene("payment-success"); highlightDevice("desktop",1300); makePacket({ fromKey:"enclaveTop",toKey:"byoBottom",label:"Audit hash",color:"#34d399",onArrive:()=>done() }); } },
        { label:"What this is — and isn't", narration:"ByoSync was the proof, not the payment rail. The face authorized a key that signed the intent.", side:{ num:"11 / 11", title:"Honest boundary", desc:"ByoSync is the <strong>SCA layer</strong>, not a payment aggregator. It produces proof of human presence + intent. Payment moves through your existing processor.", crypto:"// ByoSync IS\n• SCA factor provider\n• Intent-binding service\n• Audit evidence emitter\n\n// ByoSync IS NOT\n• Payment aggregator (RBI)\n• Card storage (PCI CDE)", resp:{ tags:["pci","dpdp"], text:"PCI scope on processor; auth scope on ByoSync; commerce on partner. Legally and operationally sustainable." } },
          action:(done)=>{ highlightDevice("byosync",1200); highlightDevice("desktop",1200); setTimeout(done,1400); } },
      ],
      plaintext: [
        { label:"Employee requests plaintext view", narration:"An onboarding officer at AcmePay needs to view a user's address proof for a manual KYC dispute.", side:{ num:"01 / 08", title:"Plaintext path · high-risk", desc:"Some workflows genuinely need PII display. This is the <strong>high-risk path</strong>. Many controls layered. Boolean proof is always preferred first.", crypto:"POST /v1/access/plaintext-request\n{\n  user: 'usr_8a2f', fields: ['address_proof'],\n  purpose: 'manual_kyc_review',\n  ticket: 'JIRA-4421', duration: '15m'\n}", resp:{ tags:["dpdp","soc2"], text:"DPDP Rule 6(1)(b) — strict access control. SOC 2 CC6.3 — least-privilege RBAC." } },
          action:(done)=>{ renderDesktopScene("requesting"); highlightDevice("desktop",1300); setTimeout(done,900); } },
        { label:"Employee MFA inside the company", narration:"Before the request even leaves AcmePay, the employee must pass face + device MFA.", side:{ num:"02 / 08", title:"Employee MFA", desc:"Role-based access enforces who can even request plaintext. <strong>Watermark is generated with employee identity</strong> for forensic traceability.", crypto:"role := AccessPolicy.lookup(emp_id)\nrequire(role.canView('address_proof'))\nemp_attestation := EmployeeDevice.signMFA(request)\nwatermark := emp_id || ts || ticket || user_id", resp:{ tags:["soc2","pci"], text:"SOC 2 CC6.3 — RBAC + MFA. PCI DSS Req 8.4 — MFA for sensitive access." } },
          action:(done)=>{ highlightDevice("desktop",1300); setTimeout(done,1100); } },
        { label:"Request → ByoSync control plane", narration:"AcmePay's signed request reaches ByoSync. Policy engine evaluates company + employee + role + purpose.", side:{ num:"03 / 08", title:"Request crosses to control plane", desc:"Bundled request: company ID, employee attestation, role, purpose, ticket, fields, duration, access mode.", crypto:"POST /v1/access/plaintext (mTLS)\n{\n  user: 'usr_8a2f', fields: ['address_proof'],\n  emp_attestation: '<signed>',\n  ticket: 'JIRA-4421', duration: '15m',\n  mode: 'view_only_watermarked'\n}", resp:{ tags:["dpdp","soc2"], text:"DPDP — purpose limitation strictly enforced. SOC 2 CC6 — defense in depth." } },
          action:(done)=>{ makePacket({ fromKey:"desktop",toKey:"byoRight",label:"Plaintext req",color:"#f87171",onArrive:()=>{ highlightDevice("byosync",1300); done(); } }); } },
        { label:"User receives high-risk prompt", narration:"The phone lights up with a red prompt — 'Priya at AcmePay wants to view your address proof for 15 minutes.'", side:{ num:"04 / 08", title:"High-risk consent prompt", desc:"User sees the <strong>specific employee</strong>, the <strong>ticket</strong>, the <strong>duration</strong>, and that access is <strong>view-only, watermarked</strong>. No download, no clipboard.", crypto:"{\n  type: 'PLAINTEXT_ACCESS', company: 'AcmePay',\n  employee: 'Priya S. · id 4521',\n  fields: ['address_proof'],\n  mode: 'view_only_watermarked', duration: '15m'\n}", resp:{ tags:["dpdp"], text:"DPDP Section 6(1) — informed: the user knows exactly which employee will view, for how long." } },
          action:(done)=>{ makePacket({ fromKey:"byoLeft",toKey:"phone",label:"Plaintext consent",color:"#f87171",onArrive:()=>{ renderPhoneScene("consent-prompt-plaintext"); highlightDevice("phone",1400); done(); } }); } },
        { label:"User approves · intent bound to employee", narration:"User reads, considers, approves. The signature is bound to Priya specifically.", side:{ num:"05 / 08", title:"Approval bound to employee", desc:"Approval signature contains <strong>the specific employee identity</strong>. Any other employee = signature mismatch = denied.", crypto:"intent := consent_id || emp_id || fields ||\n          ticket || nonce || ts\nsig    := DeviceKey.sign(intent)\n→ Grant bound to emp_id='Priya·4521'", resp:{ tags:["dpdp","soc2"], text:"DPDP — intent binding tied to specific human. SOC 2 — minimum-privilege at finest granularity." } },
          action:(done)=>{ renderPhoneScene("approved"); highlightDevice("phone",1200); setTimeout(()=>{ makePacket({ fromKey:"phone",toKey:"byoLeft",label:"Approved",color:"#34d399",onArrive:()=>done() }); },700); } },
        { label:"Vault → enclave → watermarked render", narration:"Encrypted address proof travels to ByoSync. Document is rendered server-side with Priya's watermark, then streamed to her screen.", side:{ num:"06 / 08", title:"Render, not raw plaintext", desc:"Decryption in-memory only. Priya's browser receives a rendered view with watermark baked in, not the underlying file.", crypto:"blob  := Vault.fetch('address_proof')\nDEK   := KMS.unwrap(blob.wrapped_DEK, policy)\nplain := AES_decrypt(blob.data, DEK)\nrendered := overlayWatermark(plain, emp_id+ts)\nstream := SessionEnclave.stream(rendered, ttl=15m)", resp:{ tags:["dpdp","soc2","pci"], text:"<strong>Honest caveat: a phone camera can still photograph any screen. Watermark = forensic trace, not perfect prevention.</strong>" } },
          action:(done)=>{ makePacket({ fromKey:"byoBottom",toKey:"vaultTop",label:"googleProxy fetch",color:"#60a5fa",onArrive:()=>{ highlightDevice("vault",1000); makePacket({ fromKey:"vaultTop",toKey:"enclaveBottom",label:"Cipher ↑",color:"#f472b6",onArrive:()=>{ highlightDevice("enclave",1200); makePacket({ fromKey:"enclaveRight",toKey:"desktop",label:"Watermarked stream",color:"#f87171",onArrive:()=>{ renderDesktopScene("plaintext-view"); highlightDevice("desktop",1300); done(); } }); } }); } }); } },
        { label:"Session expires · plaintext wiped", narration:"Fifteen minutes later, the session enclave destroys itself. Plaintext zeroed. DEK zeroed.", side:{ num:"07 / 08", title:"Auto-destroy", desc:"On expiry: <strong>zero plaintext</strong>, <strong>zero DEK</strong>, <strong>terminate session</strong>. Audit entries hash-chained.", crypto:"zero(plaintext); zero(DEK); zero(session_keys)\nSessionEnclave.destroy(session_id)\naudit.append({\n  event: 'plaintext_viewed', emp_id: 'Priya·4521',\n  duration_actual: '14m22s', view_count: 6\n})", resp:{ tags:["dpdp","soc2"], text:"DPDP Rule 6(1)(c)+(e) — logs retained 1 year. SOC 2 CC4 — monitoring." } },
          action:(done)=>{ renderDesktopScene("session-expired"); highlightDevice("desktop",1300); makePacket({ fromKey:"enclaveTop",toKey:"byoBottom",label:"Audit hash",color:"#34d399",onArrive:()=>done() }); } },
        { label:"User dashboard updates with view receipt", narration:"User sees on their phone exactly who viewed what, when, and for how long.", side:{ num:"08 / 08", title:"Receipt + transparency", desc:"<strong>Transparency is part of the architecture</strong>, not an afterthought. Every employee at every company, timestamped.", crypto:"// Dashboard entry\n{\n  company: 'AcmePay', employee: 'Priya S.',\n  field: 'address_proof', view_count: 6,\n  duration: '14m22s', ended_at: '18:43 IST'\n}", resp:{ tags:["dpdp"], text:"DPDP Section 11 — right to information about processing. Section 13 — grievance redressal." } },
          action:(done)=>{ makePacket({ fromKey:"byoLeft",toKey:"phone",label:"View receipt",color:"#60a5fa",onArrive:()=>{ renderPhoneScene("dashboard"); highlightDevice("phone",1300); done(); } }); } },
      ],
      revoke: [
        { label:"User opens dashboard, sees active consents", narration:"User opens the ByoSync dashboard from any partner app. Every company with active access is listed.", side:{ num:"01 / 08", title:"Dashboard + lineage chain", desc:"All active consents on one screen. Withdrawal must be <strong>as easy as approval</strong> by law (DPDP Section 6(4)).", crypto:"active := ByoSync.list({user: 'usr_8a2f'})\n→ [\n   { company: 'AcmePay',  fields: ['kyc'] },\n   { company: 'NeoBank',  fields: ['address'] },\n   { company: 'ZipCart',  fields: ['age'] }\n]", resp:{ tags:["dpdp"], text:"DPDP Section 6(4) — withdrawal as easy as approval. Section 11 — right to information." } },
          action:(done)=>{ renderPhoneScene("dashboard"); highlightDevice("phone",1300); setTimeout(done,1000); } },
        { label:"User taps 'Revoke AcmePay'", narration:"User selects AcmePay and taps revoke. ByoSync requires a face + voice confirmation.", side:{ num:"02 / 08", title:"Revocation signed", desc:"Intent string: literal 'REVOKE' + consent_id + nonce. Signed by device key.", crypto:"intent := 'REVOKE' || consent_id || nonce || ts\nsig    := DeviceKey.sign(intent)\n\nPOST /v1/consent/revoke\n{\n  consent_id: 'con_5af23e', signature: sig\n}", resp:{ tags:["dpdp"], text:"DPDP Section 6(4) — withdrawal. Section 6(6) — processing must cease." } },
          action:(done)=>{ renderPhoneScene("dashboard"); highlightDevice("phone",1100); setTimeout(()=>{ makePacket({ fromKey:"phone",toKey:"byoLeft",label:"Revoke",color:"#f87171",onArrive:()=>{ highlightDevice("byosync",1300); done(); } }); },700); } },
        { label:"ByoSync invalidates active grants", narration:"Consent record flipped to REVOKED. Any live session is terminated immediately.", side:{ num:"03 / 08", title:"Consent REVOKED", desc:"<strong>Active sessions are terminated mid-flight.</strong> New requests bearing the old consent_id return 410 Gone.", crypto:"ConsentLedger.update(con_5af23e, {\n  status: 'REVOKED', revoked_at: now\n})\nfor grant in active_grants(con_5af23e):\n   grant.status := 'INVALID'\n   SessionEnclave.terminate(grant.session_id)", resp:{ tags:["dpdp","soc2"], text:"DPDP Section 6(6) — cease processing on withdrawal. SOC 2 Processing Integrity." } },
          action:(done)=>{ renderPhoneScene("revoked"); highlightDevice("byosync",1000); setTimeout(()=>{
            makePacket({ fromKey:"byoBottom",toKey:"enclaveTop",label:"Cascade ↓",color:"#f472b6",onArrive:()=>{
              highlightDevice("enclave",1200); makePacket({ fromKey:"enclaveTop",toKey:"byoBottom",label:"Tokens dead",color:"#f87171",onArrive:()=>{ done(); } });
            } });
          },500); } },
        { label:"Cascade · delegated tokens + lineage REVOKED", narration:"v3: revoking consent c1 marks all lineage edges rooted in c1 as REVOKED. Delegated tokens (A→B, B→agent) invalidate. Redis OCSP-style check fails closed on next unlock.", side:{ num:"04 / 08", title:"Cascade invalidation (v3)",
            desc:"Downstream companies and agents lose OPERATE unlock immediately. VERIFY booleans unaffected. Multi-hop A2A tokens inherit shortest TTL and break when upstream revokes.",
            crypto:"revoke(c1)\n→ lineage.edges.where(root=c1).status := REVOKED\n→ delegated_jtis.invalidate(all downstream)\n→ Redis.set(jti, REVOKED)\n\n// Next unlock attempt\nunlock(token) → 403 REVOKED",
            resp:{ tags:["dpdp","soc2"], text:"DPDP §6(6) cease processing. Runtime enforcement — not grant-time only." } },
          action:(done)=>{ highlightDevice("enclave",1400); highlightDevice("companyB",1000); setTimeout(done,1200); } },
        { label:"Webhook → Company A + B", narration:"ByoSync fires signed webhooks: consent.revoked + deletion_required. Each recipient must confirm erasure within N hours.", side:{ num:"05 / 08", title:"Webhooks + deletion callback",
            desc:"SDK contract: <strong>confirmDeletion(tokenJti)</strong> within SLA. Non-confirmation → compliance dashboard flag.",
            crypto:"POST acmepay.com/webhooks/byosync\n{ event:'consent.revoked', consent_id, jti }\nPOST delhivery.com/webhooks/byosync\n{ event:'deletion_required', jti, deadline }\n\n// Recipient must:\nPOST /v1/deletion/confirm { jti, proof }",
            resp:{ tags:["dpdp"], text:"DPDP erasure + Rule 6 logs. GDPR Art 17 deletion propagation." } },
          action:(done)=>{ makePacket({ fromKey:"byoRight",toKey:"desktop",label:"consent.revoked",color:"#f87171",onArrive:()=>{
            renderDesktopScene("revoked-notification"); highlightDevice("desktop",1000);
            makePacket({ fromKey:"byoRight",toKey:"coB",label:"deletion_req",color:"#f87171",onArrive:()=>{ highlightDevice("companyB",1200); done(); } });
          } }); } },
        { label:"What revocation cannot do", narration:"Revocation blocks the future. It cannot retract what was already lawfully viewed and stored.", side:{ num:"06 / 08", title:"Honest boundary", desc:"If AcmePay viewed plaintext under prior consent, revocation cannot undo the viewing. ByoSync's defense: <strong>boolean by default</strong>, <strong>view-only watermarked plaintext</strong>, <strong>contractual erasure</strong>.", crypto:"// Revocation CAN\n  ✓ Block future API calls\n  ✓ Terminate live sessions\n  ✓ Invalidate cached tokens\n\n// Revocation CANNOT\n  ✗ Un-see what was lawfully viewed\n  ✗ Reach into an air-gapped backup", resp:{ tags:["dpdp"], text:"Enforcement is contractual + regulatory, not cryptographic." } },
          action:(done)=>{ highlightDevice("desktop",1100); setTimeout(done,1000); } },
        { label:"Hash-chained audit + erasure tombstone", narration:"Final audit entry appended with prevHash. ByoSync writes erasure tombstone (proves deletion without retaining data). User dashboard shows readable lineage chain now REVOKED.", side:{ num:"07 / 08", title:"Tamper-evident audit (v3)", desc:"WORM-stored. Retained for one year minimum. The user can export their history; the regulator can audit any company.", crypto:"audit.append({\n  event: 'consent_revoked',\n  consent_id: 'con_5af23e',\n  webhook_ack: '202 OK',\n  prev_hash: '0x4e2f...',\n  event_hash: '0x9af3...'\n})", resp:{ tags:["dpdp","soc2"], text:"DPDP Rule 6(1)(c)+(e) — logs and 1-year retention. SOC 2 CC4 — monitoring." } },
          action:(done)=>{ makePacket({ fromKey:"enclaveTop",toKey:"byoBottom",label:"Audit hash",color:"#34d399",onArrive:()=>{ makePacket({ fromKey:"byoLeft",toKey:"phone",label:"Chain view",color:"#60a5fa",onArrive:()=>{ renderPhoneScene("revoked"); done(); } }); } }); } },
        { label:"Fail-closed · no future unlock", narration:"Any company or agent presenting a revoked jti receives 403. OPERATE data was never handed over and forgotten — each use required live unlock.", side:{ num:"08 / 08", title:"Runtime enforcement",
            desc:"Honest flag: OPERATE data already delivered cannot be un-forwarded. v3 minimizes OPERATE; VERIFY default; lineage makes the compliant path easy.",
            crypto:"// Company B next API call\nPOST /unlock { jti: revoked_jti }\n→ 403 CONSENT_REVOKED\n\n// Agent A2A task resume\nGET /kya/status → REVOKED",
            resp:{ tags:["dpdp","soc2"], text:"Spec: BYOSYNC_FLOW_V3_LINEAGE_A2A_COMPLIANCE.md §11.2" } },
          action:(done)=>{ highlightDevice("byosync",800); highlightDevice("enclave",800); highlightDevice("companyB",800); setTimeout(done,1000); } },
      ],

      /* ── SCENARIO 08: Lineage re-share (v3 §9) ─────────────────────── */
      lineage_reshare: [
        { label:"User consented OPERATE field to Company A", narration:"Under consent #1, AcmePay holds an encrypted OPERATE field (e.g. address) received via enclave encrypt-to-company. ByoSync logged lineage edge USER→A.", side:{ num:"01 / 07", title:"OPERATE · minimal set",
            desc:"VERIFY fields (boolean) never leave enclave as raw. OPERATE is the exception — shared with TTL, deletion callback, lineage.",
            crypto:"lineageId: ln_8a2f\nedges: [{ seq:1, from:USER, to:AcmePay,\n  purpose:'delivery', consentId:c1, jti, expiresAt }]\nstatus: ACTIVE",
            resp:{ tags:["dpdp"], text:"Purpose limitation. User dashboard shows readable chain." } },
          action:(done)=>{ renderDesktopScene("result-boolean"); highlightDevice("desktop",1200); setTimeout(done,900); } },

        { label:"Company A requests re-share to Company B", narration:"AcmePay needs Delhivery (last-mile). The only sanctioned path is a re-share request through ByoSync — not a side-channel forward.", side:{ num:"02 / 07", title:"Re-share API",
            desc:"Request carries dataRef, fromCo:A, toCo:B, purpose P2, fields [F]. ByoSync checks if consent #1 permits onward transfer.",
            crypto:"POST /v1/lineage/reshare\n{\n  lineageId, fromCo:'AcmePay', toCo:'Delhivery',\n  purpose:'last_mile', fields:['address'],\n  tag: 'SUB_PROCESSOR' | 'TRANSFEREE_FIDUCIARY'\n}",
            resp:{ tags:["dpdp"], text:"Compliant path is easy; bypass is contract breach." } },
          action:(done)=>{ makePacket({ fromKey:"desktop",toKey:"byoRight",label:"Re-share req",color:"#fbbf24",onArrive:()=>{ highlightDevice("byosync",1300); done(); } }); } },

        { label:"Transferee? → user consent #2 (biometric)", narration:"If B is an independent transferee fiduciary, ByoSync prompts the user on phone. Sub-processor may be pre-authorized if contract on file — still logged.", side:{ num:"03 / 07", title:"Re-consent gate",
            desc:"DPDP treats sub-processor vs transferee differently. Tag on toCo drives whether fresh biometric consent is required.",
            crypto:"if tag == TRANSFEREE_FIDUCIARY:\n  pushConsentPrompt(user, B, P2, fields)\n  require biometric approve\nelse SUB_PROCESSOR:\n  log + continue if contract valid",
            resp:{ tags:["dpdp"], text:"Free, specific, informed consent for new fiduciary." } },
          action:(done)=>{ makePacket({ fromKey:"byoLeft",toKey:"phone",label:"Consent #2?",color:"#60a5fa",onArrive:()=>{ renderPhoneScene("consent-prompt"); highlightDevice("phone",1400); setTimeout(()=>{
            makePacket({ fromKey:"phone",toKey:"byoLeft",label:"Approved",color:"#34d399",onArrive:()=>{ done(); } });
          },700); } }); } },

        { label:"Enclave re-encrypts field F to B's pubkey", narration:"Inside Nitro: decrypt is NOT on parent. Enclave unwraps DEK (KMS+PCR), extracts field F, re-encrypts to Delhivery's registered public key. Plaintext zeroed.", side:{ num:"04 / 07", title:"Re-encrypt in TEE",
            desc:"Parent relays ciphertext only. Operator never sees address plaintext during re-share.",
            crypto:"plain := decryptDrive(blob, DEK_user)  // enclave only\nf := plain.address\nzero(plain)\ncipher_B := RSA_encrypt(f, pubkey_Delhivery)\nsign := enclave_sign(cipher_B)",
            resp:{ tags:["soc2"], text:"Hybrid RSA-OAEP + AES-GCM per §12." } },
          action:(done)=>{ makePacket({ fromKey:"byoBottom",toKey:"enclaveTop",label:"vsock down",color:"#f472b6",onArrive:()=>{ highlightDevice("enclave",1500); setTimeout(()=>{
            makePacket({ fromKey:"enclaveRight",toKey:"coBLeft",label:"cipher to B",color:"#fbbf24",onArrive:()=>{ highlightDevice("companyB",1400); done(); } });
          },500); } }); } },

        { label:"Lineage edge A → B written", narration:"Consent ledger appends edge seq:2 with consentId c2, tokenJti, expiresAt, prevHash. User dashboard updates.", side:{ num:"05 / 07", title:"Lineage system of record",
            desc:"Exportable, machine-readable, 7-year retention. Hash-chained tamper evidence.",
            crypto:"edges.append({ seq:2, from:'AcmePay', to:'Delhivery',\n  purpose:'last_mile', consentId:c2, jti, expiresAt,\n  prevHash: SHA256(entry_prev) })",
            resp:{ tags:["dpdp"], text:"Logs of transfers to transferee fiduciaries — Rule 4." } },
          action:(done)=>{ makePacket({ fromKey:"enclaveTop",toKey:"byoBottom",label:"ln edge ↑",color:"#34d399",onArrive:()=>{ highlightDevice("byosync",1200); setTimeout(done,800); } }); } },

        { label:"Company B decrypts locally", narration:"Delhivery receives cipher + its own consent record. Decrypts with B's private key — ByoSync never had plaintext.", side:{ num:"06 / 07", title:"B as independent controller",
            desc:"Deletion callback contract applies to B's copy on revoke/expiry.",
            crypto:"shared := RSA_decrypt(cipher_B, privkey_Delhivery)\n// ByoSync DB: no plaintext address",
            resp:{ tags:["dpdp"], text:"Purpose P2 only. TTL enforced." } },
          action:(done)=>{ makePacket({ fromKey:"byoRight",toKey:"coB",label:"consent c2",color:"#34d399",onArrive:()=>{ highlightDevice("companyB",1200); done(); } }); } },

        { label:"Documents: re-verify, not re-transfer", narration:"For a degree PDF or KYC pack, default path is boolean re-verification from vault — B never receives the file unless explicit OPERATE consent.", side:{ num:"07 / 07", title:"Document default",
            desc:"Honest: cannot prevent forward of OPERATE already delivered. Minimize OPERATE; prefer VERIFY.",
            crypto:"// Default\nGET /verify?field=degree_verified → { true }\n\n// Exception\nOPERATE + TTL + deletion_cb + lineage",
            resp:{ tags:["dpdp"], text:"v3 §9.3 — re-verification not re-transfer." } },
          action:(done)=>{ highlightDevice("vault",1000); highlightDevice("enclave",1000); highlightDevice("companyB",1000); setTimeout(done,1200); } },
      ],

      /* ── SCENARIO 09: A2A worked flows (6 phases · 3 data classes) ─── */
      a2a_agent: [
        { label:"Phase 0 — Session mandate (User → User Agent)", narration:"User authorizes their A2A client for a bounded goal: astrology + buy gemstone + pay. Scope and TTL cap what the User Agent may do — not open-ended delegation.",
          side:{ num:"01 / 11", title:"Phase 0 · Authorize",
            desc:"Session mandate: goal, scope, expiry, nonce. Each remote agent later gets its own narrowed token (shrink-only delegation).",
            crypto:"mandate := sign(goal, scope, ttl, nonce)\nuser_agent.session := mandate",
            resp:{ tags:["dpdp","soc2"], text:"Agent authority is bounded and revocable from the start." } },
          action:(done)=>{ setDesktopChrome("REMOTE AGENT · ShopCo"); renderPhoneScene("mandate-a2a"); highlightDevice("phone",1200); setTimeout(()=>{
            makePacket({ fromKey:"phone",toKey:"agent",label:"Mandate",color:"#a78bfa",onArrive:()=>{ renderPhoneScene("approved"); highlightDevice("userAgent",1400); done(); } });
          },600); } },

        { label:"Phase 1 — Discover remote Agent Card + KYA", narration:"User Agent fetches /.well-known/agent-card.json. Checks A2A signature, KYA JWS (principal + dataClasses), and revocation endpoint before any data moves.",
          side:{ num:"02 / 11", title:"Phase 1 · Discover + trust",
            desc:"Three tiers in KYA: VERIFY (boolean only), OPERATE-STANDARD (scoped share), OPERATE-SENSITIVE (external agents refused). ShopCo may receive birth/address class, never instruments.",
            crypto:"verify(A2A_card_sig)\nverify(KYA_JWS) → dataClasses\nGET /kya/status → ACTIVE",
            resp:{ tags:["soc2"], text:"A2A proves domain; KYA proves accountable principal." } },
          action:(done)=>{ renderDesktopScene("a2a-agent-card"); makePacket({ fromKey:"agentRight",toKey:"desktop",label:"Agent Card",color:"#a78bfa",onArrive:()=>{ highlightDevice("desktop",1400); done(); } }); } },

        { label:"Phase 2 — Classify fields + consolidated consent", narration:"Task needs age (VERIFY → boolean), address (OPERATE-STANDARD), payment (intent — no instrument). One biometric tap mints verify-token, consent-token, and intent-token.",
          side:{ num:"03 / 11", title:"Phase 2 · Classify + consent",
            desc:"Example C (shopping) in one screen. Astrology would get OPERATE-STANDARD birth fields only; payment never shares card/bank (OPERATE-SENSITIVE prohibited).",
            crypto:"verify_token(age18)\nconsent_token(address, TTL=delivery+7d)\nintent_token(₹499, TTL=5min)",
            resp:{ tags:["dpdp"], text:"Informed before share — specific fields, agent, purpose, TTL." } },
          action:(done)=>{ makePacket({ fromKey:"agentRight",toKey:"byoLeft",label:"Classify",color:"#22d3ee",onArrive:()=>{ highlightDevice("byosync",700); makePacket({ fromKey:"byoBottom",toKey:"enclaveTop",label:"vsock",color:"#f472b6",onArrive:()=>{ highlightDevice("enclave",900); makePacket({ fromKey:"byoLeft",toKey:"phone",label:"Consent",color:"#a78bfa",onArrive:()=>{ renderPhoneScene("consent-a2a-shopping"); highlightDevice("phone",1200); setTimeout(()=>{
              renderPhoneScene("approved"); makePacket({ fromKey:"phone",toKey:"byoLeft",label:"3 tokens",color:"#34d399",onArrive:()=>{ highlightDevice("byosync",1000); done(); } });
            },700); } }); } }); } }); } },

        { label:"Phase 3 — A2A task (token only, no raw PII)", narration:"User Agent dispatches A2A task to remote agent. Parts hold tokenized refs; metadata carries consent tokens — raw birth date, address, and PAN never ride in the message.",
          side:{ num:"04 / 11", title:"Phase 3 · Dispatch",
            desc:"Agent-to-agent message is a redeemable claim. Intercepted tasks leak no PII.",
            crypto:"POST /a2a/tasks\nparts: [{ ref: byosync://vault/... }]\nmetadata: { verifyToken, consentToken, intentToken }",
            resp:{ tags:["dpdp"], text:"Minimization: data fetched only at runtime unlock." } },
          action:(done)=>{ renderDesktopScene("a2a-task"); makePacket({ fromKey:"agentRight",toKey:"desktop",label:"A2A task",color:"#a78bfa",onArrive:()=>{ highlightDevice("desktop",1400); done(); } }); } },

        { label:"Phase 4a — Verify-token → boolean (no DOB)", narration:"Remote agent redeems verify-token. Enclave returns age18plus:true — date of birth never leaves the vault.",
          side:{ num:"05 / 11", title:"Phase 4a · VERIFY unlock",
            desc:"VERIFY class: nobody receives raw; Argon2id hash → yes/no inside enclave.",
            crypto:"unlock(verify_token) → boolean(age18)\n// DOB stays in vault",
            resp:{ tags:["dpdp"], text:"Age-restricted commerce without revealing DOB." } },
          action:(done)=>{ makePacket({ fromKey:"desktop",toKey:"byoRight",label:"verify-token",color:"#22d3ee",onArrive:()=>{ highlightDevice("byosync",700); makePacket({ fromKey:"byoBottom",toKey:"enclaveTop",label:"vsock",color:"#f472b6",onArrive:()=>{ highlightDevice("enclave",900); makePacket({ fromKey:"enclaveRight",toKey:"desktop",label:"age18: true",color:"#34d399",onArrive:()=>{ renderDesktopScene("a2a-boolean"); highlightDevice("desktop",1200); done(); } }); } }); } }); } },

        { label:"Phase 4b — Consent-token → address (encrypt-to-agent)", narration:"Remote agent redeems consent-token. Enclave checks jti ACTIVE, scope, TTL — then releases only delivery address, re-encrypted to ShopCo's public key.",
          side:{ num:"06 / 11", title:"Phase 4b · OPERATE-STANDARD unlock",
            desc:"Astrology path is the same pattern with {dob,birthTime,birthCity} only — name, phone, payment never in scope.",
            crypto:"unlock(consent_token)\n  Redis jti == ACTIVE\nvault → enclave → ECIES(agent_pubkey)",
            resp:{ tags:["soc2"], text:"Runtime fail-closed: revoke kills next unlock." } },
          action:(done)=>{ makePacket({ fromKey:"desktop",toKey:"byoRight",label:"consent-token",color:"#a78bfa",onArrive:()=>{ highlightDevice("byosync",700); makePacket({ fromKey:"byoBottom",toKey:"enclaveTop",label:"check jti",color:"#f472b6",onArrive:()=>{ highlightDevice("enclave",800); makePacket({ fromKey:"byoBottom",toKey:"vaultTop",label:"fetch",color:"#34d399",onArrive:()=>{ highlightDevice("vault",800); makePacket({ fromKey:"vaultTop",toKey:"enclaveBottom",label:"cipher ↑",color:"#f472b6",onArrive:()=>{ makePacket({ fromKey:"enclaveRight",toKey:"desktop",label:"address enc",color:"#34d399",onArrive:()=>{ highlightDevice("desktop",1200); done(); } }); } }); } }); } }); } }); } },

        { label:"Phase 4c — Payment intent (no instrument on wire)", narration:"Intent-token authorizes ₹499 to merchant — ByoSync never sees PAN, bank, or UPI. Payment rail charges the instrument it already holds; lineage records authorization only.",
          side:{ num:"07 / 11", title:"Phase 4c · Intent (AP2)",
            desc:"OPERATE-SENSITIVE is a hard no for external agents. Payment = signed intent, not a data share.",
            crypto:"intent := { amount:499, payee, jti, TTL:5m }\n// no card/bank in token\nrail.charge(user_instrument)",
            resp:{ tags:["pci","dpdp"], text:"Biometric binds human presence to payment — zero instrument exposure." } },
          action:(done)=>{ renderPhoneScene("approved"); makePacket({ fromKey:"phone",toKey:"byoLeft",label:"Intent ₹499",color:"#fbbf24",onArrive:()=>{ highlightDevice("byosync",1000); makePacket({ fromKey:"byoRight",toKey:"desktop",label:"intent OK",color:"#fbbf24",onArrive:()=>{ highlightDevice("desktop",1200); done(); } }); } }); } },

        { label:"Phase 5 — Artifact + lineage edges", narration:"ShopCo places order and returns artifact. ByoSync writes separate lineage edges for VERIFY boolean, OPERATE address share, and payment authorization event.",
          side:{ num:"08 / 11", title:"Phase 5 · Artifact + lineage",
            desc:"Orchestrated flow (§6): AstroCorp birth share, ShopCo address, MerchantM intent — each token agent-bound; revoke session cascades all three.",
            crypto:"lineage: USER→ShopCo (age:VERIFY)\nlineage: USER→ShopCo (addr:OPERATE)\nlineage: USER→MerchantM (intent)",
            resp:{ tags:["dpdp"], text:"DPDP system-of-record: who received what, when, for what purpose." } },
          action:(done)=>{ renderDesktopScene("a2a-artifact-order"); makePacket({ fromKey:"desktop",toKey:"agent",label:"Artifact",color:"#34d399",onArrive:()=>{ highlightDevice("userAgent",800); makePacket({ fromKey:"enclaveTop",toKey:"byoBottom",label:"lineage ×3",color:"#34d399",onArrive:()=>{ highlightDevice("byosync",1200); done(); } }); } }); } },

        { label:"Phase 6a — Revoke: future access cut instantly", narration:"User revokes session mandate. All downstream consent, verify, and intent tokens invalidate — next runtime unlock fails closed (guaranteed on ByoSync's side).",
          side:{ num:"09 / 11", title:"Phase 6a · Revoke (guaranteed)",
            desc:"Honest claim: agent may have seen authorized fields; user cuts off all further access immediately.",
            crypto:"revoke(session) → cascade(jti_*)\nRedis: all tokens REVOKED",
            resp:{ tags:["dpdp","soc2"], text:"Phase 4 enforcement teeth — fail-closed at use-time." } },
          action:(done)=>{ renderPhoneScene("dashboard"); highlightDevice("phone",1000); setTimeout(()=>{ renderPhoneScene("revoked"); makePacket({ fromKey:"phone",toKey:"byoLeft",label:"Revoke",color:"#f87171",onArrive:()=>{ highlightDevice("byosync",1000); renderDesktopScene("revoked-notification"); highlightDevice("desktop",1200); done(); } }); },700); } },

        { label:"Phase 6b — Deletion callback (directed + verified)", narration:"On TTL or revoke, deletion callback fires. ShopCo must confirmDeletion(jti); non-confirmation is flagged — ByoSync verifies, cannot physically force erasure on third-party systems.",
          side:{ num:"10 / 11", title:"Phase 6b · Deletion callback",
            desc:"Address TTL = delivery+7d. Astrology birth data deleted on expiry. User directs deletion; ByoSync records confirmation.",
            crypto:"POST /deletion-callback { jti }\n→ agent.confirmDeletion(jti)\n→ audit: CONFIRMED | BREACH",
            resp:{ tags:["dpdp"], text:"Minimization + short TTL limit what a non-deleting agent retains." } },
          action:(done)=>{ makePacket({ fromKey:"byoRight",toKey:"desktop",label:"delete?",color:"#f87171",onArrive:()=>{ highlightDevice("desktop",1000); setTimeout(done,900); } }); } },

        { label:"Dashboard — orchestrated lineage view", narration:"User sees three separate edges: AstroCorp birth (deleted), ShopCo address (expires), MerchantM ₹499 intent (instrument never shared). Multi-hop tokens were never reusable across agents.",
          side:{ num:"11 / 11", title:"Orchestrated recap (§6)",
            desc:"One mandate fans to AstroCorp + ShopCo + payment rail. Each hop had its own narrowed token; revoke cascaded all.",
            crypto:"// tokens never cross agents\nastro_token ≠ shop_token ≠ intent_token",
            resp:{ tags:["dpdp"], text:"Informed consent + control — not prevention of legitimate OPERATE-STANDARD shares." } },
          action:(done)=>{ makePacket({ fromKey:"byoLeft",toKey:"phone",label:"Lineage",color:"#60a5fa",onArrive:()=>{ renderPhoneScene("dashboard-a2a"); highlightDevice("phone",1400); highlightDevice("userAgent",1000); done(); } }); } },
      ],

      /* ── SCENARIO 07: Encrypted field share (v2 · in-person) ─────────── */
      encrypted_share: [
        { label:"Employee verifies face → hybrid ciphertext to enclave",
          narration:"An employee scans their face; the payload is hybrid-encrypted. The parent relays it to the Nitro enclave for BCH verification — the parent never sees embedding bits.",
          side:{ num:"01 / 06", title:"Employee gate in enclave",
            desc:"Same vsock pattern as user login. Templates are KMS-wrapped in Mongo; only the enclave can unwrap them for matching.",
            crypto:"POST /employees/verify-face (hybrid cipher)\nparent → vsock → enclave.verifyFace(emp)\n← { verified: true }",
            resp:{ tags:["soc2"], text:"Privileged actions require biometric proof inside the TEE." } },
          action:(done)=>{ highlightDevice("desktop",1200); makePacket({ fromKey:"desktop",toKey:"byoRight",label:"Emp verify",color:"#fbbf24",onArrive:()=>{ highlightDevice("byosync",1300); done(); } }); } },

        { label:"User face scan → share-data ciphertext",
          narration:"The data principal scans face (2 frames). share-data body is hybrid-encrypted and relayed. Inside the enclave: BCH match, consent ACTIVE, hash-chained audit entries.",
          side:{ num:"02 / 06", title:"Consent created in enclave",
            desc:"All consent state changes run through the enclave. v2 requires hybrid encryption on approve/revoke/share routes (closes v1 plain-body gaps).",
            crypto:"enclave.shareData({\n  phoneHash, faceId_cipher, fields, purposes\n})\n→ Consent ACTIVE\n→ audit: NOTICE_SENT, CONSENT_GIVEN\n  (prevHash chained)",
            resp:{ tags:["dpdp"], text:"DPDP Sec 5 notice + Sec 6 consent recorded tamper-evidently." } },
          action:(done)=>{ makePacket({ fromKey:"phone",toKey:"byoLeft",label:"Share cipher",color:"#22d3ee",onArrive:()=>{ highlightDevice("byosync",800); makePacket({ fromKey:"byoBottom",toKey:"enclaveTop",label:"vsock ↓",color:"#f472b6",onArrive:()=>{ highlightDevice("enclave",1400); done(); } }); } }); } },

        { label:"Enclave asks parent to fetch Drive blob",
          narration:"The enclave requests the encrypted identity file. Parent googleProxy downloads ciphertext from Google; the blob is handed back to the enclave over vsock.",
          side:{ num:"03 / 06", title:"Fetch · parent has no DEK",
            desc:"Parent performs TLS to Google. Enclave holds OAuth unwrap + Drive decrypt capability — not the relay tier.",
            crypto:"enclave → parent: FETCH(fileId)\nparent → Drive: GET user_identity.json\nparent → enclave: { encrypted, iv, tag }",
            resp:{ tags:["dpdp","soc2"], text:"Separation: network on parent, secrets in enclave." } },
          action:(done)=>{ makePacket({ fromKey:"byoBottom",toKey:"vaultTop",label:"googleProxy fetch",color:"#60a5fa",onArrive:()=>{ highlightDevice("vault",1000); makePacket({ fromKey:"vaultTop",toKey:"enclaveBottom",label:"Cipher ↑",color:"#f472b6",onArrive:()=>{ highlightDevice("enclave",1200); done(); } }); } }); } },

        { label:"Enclave decrypts · filters · encrypt-to-company",
          narration:"Inside Nitro: decrypt identity, keep only consented fields, encrypt the subset to the company's registered public key, sign with the enclave key. Memory wiped.",
          side:{ num:"04 / 06", title:"No plain JSON to company",
            desc:"<strong>v2 closes the v1 hole</strong> where sharedData was plain HTTPS JSON. ByoSync API relays ciphertext; the company decrypts with its own private key.",
            crypto:"plain := decryptDrive(blob, DEK_user)\nsubset := pick(plain, consent.sharedFields)\ncipher_co := RSA_encrypt(subset, company_pubkey)\nout := enclave_sign(cipher_co)\nzero(plain); zero(DEK_user)",
            resp:{ tags:["dpdp","soc2"], text:"Operator cannot read shared name/phone/email. Subpoena of parent logs yields ciphertext only." } },
          action:(done)=>{ highlightDevice("enclave",1600); setTimeout(()=>{ makePacket({ fromKey:"enclaveTop",toKey:"byoBottom",label:"cipher_co ↑",color:"#34d399",onArrive:()=>{ highlightDevice("byosync",800); done(); } }); },600); } },

        { label:"Company decrypts sharedData locally",
          narration:"AcmePay's backend receives encrypted sharedData + enclave signature. It decrypts client-side and shows only the consented fields in the employee console.",
          side:{ num:"05 / 06", title:"Company-held private key",
            desc:"Prerequisite: company registered an RSA public key with ByoSync during onboarding.",
            crypto:"// Company server\nshared := RSA_decrypt(cipher_co, company_privkey)\n// → { fullName, phone, ... } per consent\n\n// ByoSync never stored this plaintext",
            resp:{ tags:["dpdp"], text:"Purpose limitation: only fields listed in ACTIVE consent." } },
          action:(done)=>{ makePacket({ fromKey:"byoRight",toKey:"desktop",label:"Encrypted share",color:"#34d399",onArrive:()=>{ renderDesktopScene("result-boolean"); highlightDevice("desktop",1400); done(); } }); } },

        { label:"Invariant · operator blindness",
          narration:"Parent EC2, Mongo, and ByoSync engineers see ciphertext and hashes — never plaintext PII or live biometric bits.",
          side:{ num:"06 / 06", title:"v2 invariant",
            desc:"This is the target claim: <strong>zero data, not even ByoSync.</strong> Requires Nitro + PCR-gated KMS (see migration order in spec).",
            crypto:"Parent sees:  hybrid cipher in, signed/cipher out\nEnclave sees:  brief plaintext, then zeroed\nCompany sees:  decrypts only its ciphertext\nMongo sees:    wrapped templates, hashes",
            resp:{ tags:["soc2","dpdp"], text:"v2 enclave + v3 lineage spec." } },
          action:(done)=>{ highlightDevice("byosync",1000); highlightDevice("enclave",1000); highlightDevice("vault",1000); setTimeout(done,1200); } },
      ],

      /* ── SCENARIO 05: Vault Data Update ────────────────────────────────
         When a user needs to correct or refresh their KYC data.
         Same data-minimisation contract as enrollment:
           - Biometric gate releases UMK before any field can change
           - New per-field DEKs generated; old DEKs zeroed (forward secrecy)
           - Data written DIRECTLY to vault — ByoSync excluded from PII path
           - Active consent holders notified via signed webhook
      ──────────────────────────────────────────────────────────────────── */
      data_update: [
        { label:"User taps Update Profile — nothing changed yet",
          narration:"User opens ByoSync and selects 'Update my profile'. A biometric gate must pass before any field can be read or modified. Nothing changes at this point.",
          side:{ num:"01 / 07", title:"Data lifecycle trigger",
            desc:"DPDP Section 11 gives users the <strong>right to correct</strong> their data. ByoSync enforces a biometric gate before any write — no employee or admin can trigger an update on a user's behalf.",
            crypto:"// Current vault state (version 1)\nname:    AES-256-GCM(ct_v1) + wDEK_v1\naddress: AES-256-GCM(ct_v1) + wDEK_v1\nkyc:     AES-256-GCM(ct_v1) + wDEK_v1\n\n// Pending: face + voice re-auth required\n// No field readable until UMK released",
            resp:{ tags:["dpdp","soc2"], text:"DPDP Section 11(b) — right to correction. SOC 2 CC6.1 — biometric gate before any data write. No privileged bypass." } },
          action:(done)=>{ renderPhoneScene("dashboard"); highlightDevice("phone",1300); setTimeout(done,1000); } },

        { label:"Face + voice re-auth — UMK released from Secure Enclave",
          narration:"The fuzzy extractor reconstructs k2 from the live face and voice scan using stored helper_data. k2 plus the device hardware key activates the Enclave to release the UMK.",
          side:{ num:"02 / 07", title:"UMK released · re-auth gate",
            desc:"Same mechanism as enrollment: <strong>helper_data + live scan → k2 → UMK</strong>. Raw biometrics zeroed immediately. No new biometric is transmitted to ByoSync.",
            crypto:"// Fuzzy extractor reconstruct\nk2 := FuzzyExtract.reconstruct(\n  face_geometry_vector,  // live scan\n  voice_prosody_vector,\n  helper_data            // stored locally in Enclave\n)\n\n// Release UMK from Enclave\nUMK := Enclave.unwrap(wrapped_UMK,\n  kdf(k2, device_hw_key)\n)\nzero(k2)\n\n// Raw biometrics zeroed immediately\nzero(face_geometry_vector)\nzero(voice_prosody_vector)",
            resp:{ tags:["soc2","dpdp"], text:"SOC 2 CC6 — re-authentication required at point of write. Raw biometrics never leave the device." } },
          action:(done)=>{ renderPhoneScene("enroll-capture"); highlightDevice("phone",1700); setTimeout(done,1700); } },

        { label:"User edits fields — re-encrypted with fresh DEKs on device",
          narration:"Each changed field gets a new randomly generated DEK wrapped by the UMK. Old DEK versions are zeroed on device. Forward secrecy: a past vault snapshot cannot be decrypted with new DEKs.",
          side:{ num:"03 / 07", title:"Per-field re-encryption · fresh DEKs",
            desc:"New DEK on every field update. If an attacker exfiltrated the vault at version 1, the old DEKs are now permanently zeroed — v1 snapshot is cryptographically useless.",
            crypto:"// Per-field re-encryption\nfor field in updated_fields:\n  DEK_new := SecureRandom.bytes(32)\n  ct_v2   := AES_GCM_encrypt(field.value_new, DEK_new)\n  wDEK_v2 := AES_GCM_encrypt(DEK_new, UMK)\n  zero(DEK_new)\n  zero(field.value_new)\n\n// Old DEKs destroyed immediately\nfor field in updated_fields:\n  zero(DEK_v1[field])\n\n// UMK re-wrapped into Enclave\nwrapped_UMK := Enclave.wrap(UMK, kdf(k2_reconstructed, device_hw_key))\nzero(UMK)",
            resp:{ tags:["soc2","pci","dpdp"], text:"SOC 2 CC6.1 — key rotation on data change. PCI DSS Req 3.7 — periodic key changes. Forward secrecy: DEK_v1 is gone; v1 ciphertext is permanently unreadable." } },
          action:(done)=>{ renderPhoneScene("enroll-kyc"); highlightDevice("phone",1500); setTimeout(done,1500); } },

        { label:"Updated ciphertext → direct PUT to vault · ByoSync excluded",
          narration:"Encrypted v2 entries travel directly from the phone to the user's cloud vault, bypassing ByoSync entirely. ByoSync holds only an opaque vault pointer — it cannot see the update.",
          side:{ num:"04 / 07", title:"Vault update · direct write · ByoSync excluded",
            desc:"<strong>ByoSync is architecturally excluded from the personal data path</strong> — exactly the same as during enrollment. The vault pointer it holds is opaque ciphertext; the updated contents are invisible to it.",
            crypto:"// Direct PUT to vault (not via ByoSync API)\nfor field in updated_fields:\n  PUT vault_url + '/usr_8a2f/' + field.name\n    body: { ct: ct_v2, wDEK: wDEK_v2, version: 2 }\n\n// Vault atomically replaces v1 entry\n// ByoSync DB: unchanged — still holds only vault_ptr_enc\n// ByoSync cannot see: field values, old or new DEKs",
            resp:{ tags:["dpdp","soc2"], text:"DPDP Section 8(1) — data minimisation. ByoSync's blast-radius unchanged: still holds zero PII. User controls their own data lifecycle." } },
          action:(done)=>{ renderPhoneScene("enroll-kyc"); highlightDevice("phone",1200); setTimeout(()=>{
            makePacket({ fromKey:"phone", toKey:"vaultTop", label:"Updated fields (direct)", color:"#22d3ee",
              waypoints:[{x:320,y:440},{x:358,y:538},{x:413,y:590},{x:486,y:598},{x:580,y:562},ANCHOR.vaultTop],
              onArrive:()=>{ highlightDevice("vault",1400); setTimeout(done,700); } });
          },700); } },

        { label:"ByoSync fires data.updated webhook to active consent holders",
          narration:"ByoSync emits a signed data.updated webhook to every company holding an active consent for this user. Cached data is now stale and must be discarded.",
          side:{ num:"05 / 07", title:"Consent holders notified · cache invalidation",
            desc:"Companies are contractually required to re-fetch or invalidate cached data on receipt of <strong>data.updated</strong>. Failure to comply is a DPDP fiduciary breach.",
            crypto:"// Signed webhook to each active consent holder\nPOST https://acmepay.com/webhooks/byosync\n{\n  event: 'data.updated',\n  user_token: 'usr_8a2f',\n  fields_changed: ['address', 'kyc'],\n  data_version: 2,\n  updated_at: now,\n  sig: ByoSync.sign(payload)\n}\n← 202 Accepted\n\n// ByoSync retries for up to 24h if 5xx",
            resp:{ tags:["dpdp"], text:"DPDP Section 8(3) — data accuracy obligation. Companies must not process stale PII after receiving data.updated. Non-acknowledgement = fiduciary breach." } },
          action:(done)=>{ highlightDevice("byosync",1200); setTimeout(()=>{ makePacket({ fromKey:"byoRight",toKey:"desktop",label:"data.updated",color:"#fbbf24",onArrive:()=>{ highlightDevice("desktop",1300); done(); } }); },600); } },

        { label:"Audit committed · version hash-chain incremented",
          narration:"An immutable audit entry records what changed, when, and by whom. The vault's version counter increments and the event is hash-chained to the prior entry.",
          side:{ num:"06 / 07", title:"Audit + version chain",
            desc:"<strong>Append-only WORM audit log.</strong> Retroactive modification is impossible. A regulator or the user can verify the complete update history at any time.",
            crypto:"audit.append({\n  event: 'vault_data_updated',\n  user_token: 'usr_8a2f',\n  fields: ['address', 'kyc'],\n  version_before: 1,\n  version_after:  2,\n  initiated_by: 'user_self',\n  prev_hash: '0x3b7e...',\n  event_hash: '0xa12f...'\n})\n\n// Vault version pointer updated\nvault_version := 2",
            resp:{ tags:["dpdp","soc2"], text:"DPDP Rule 6(1)(c)+(e) — logs retained 1 year. SOC 2 CC4 — monitoring. Provides irrefutable evidence of when and what changed." } },
          action:(done)=>{ makePacket({ fromKey:"enclaveTop",toKey:"byoBottom",label:"Audit hash",color:"#34d399",onArrive:()=>done() }); } },

        { label:"Update complete · old DEKs gone · forward secrecy achieved",
          narration:"UMK is re-wrapped and sealed in the Secure Enclave. Old DEKs are permanently zeroed. Any prior vault snapshot is now cryptographically useless.",
          side:{ num:"07 / 07", title:"Cleanup · forward secrecy",
            desc:"Old DEKs cannot decrypt v2 ciphertext. New DEKs cannot decrypt v1 ciphertext. Even an attacker who holds a v1 vault snapshot cannot decrypt it — the DEKs are gone.",
            crypto:"// Old DEKs permanently zeroed\nfor field in updated_fields:\n  secure_zero(DEK_v1[field])\n\n// UMK re-sealed in Enclave\nzero(UMK)\n\n// Final state\nVault version:    2\nActive DEKs:      only DEK_v2 (wDEK_v2 in vault)\nDeleted DEKs:     DEK_v1 (zeroed — irrecoverable)\nByoSync DB:       unchanged (still no PII)\nForward secrecy:  v1 snapshots permanently unreadable",
            resp:{ tags:["soc2","pci","dpdp"], text:"PCI DSS Req 3.7 — old keys purged after rotation. Perfect forward secrecy: past snapshots cryptographically neutered the moment the old DEK is zeroed." } },
          action:(done)=>{ renderPhoneScene("enroll-keygen"); highlightDevice("phone",1400); setTimeout(done,1400); } },
      ],

      /* ── SCENARIO 06: New Device Recovery ──────────────────────────────
         User gets a new phone. Critical real-world flow:
           - New device generates a fresh keypair in its Secure Enclave
           - Old device approves the cross-device UMK transfer
           - UMK is re-wrapped for the new device's public key
           - ByoSync DB updated: new device_pubkey registered
           - Vault becomes accessible from the new device
           - Old device can be revoked optionally
      ──────────────────────────────────────────────────────────────────── */
      new_device: [
        { label:"User installs ByoSync on new phone — no keys present",
          narration:"Fresh installation on a new device. The Secure Enclave is empty. No wrapped_UMK, no vault pointer, no biometric template. ByoSync recognises only the user_token entered during setup.",
          side:{ num:"01 / 07", title:"New device · zero-state",
            desc:"The new phone has no cryptographic material. The user identifies themselves with their ByoSync account (user_token). No PII is entered — ByoSync verifies identity, not data.",
            crypto:"// New phone state\nSecureEnclave:  empty\nwrapped_UMK:    absent\nvault_ptr:      absent\nhelper_data:    absent\n\n// User provides only:\nuser_token: 'usr_8a2f'  // pseudonymous ID\n\n// ByoSync looks up: user_token → device_pubkey_old\n// Recovery request queued for old-device approval",
            resp:{ tags:["soc2","dpdp"], text:"SOC 2 CC6.1 — no credentials accepted without multi-factor verification. ByoSync's recovery flow requires old-device approval, not just a password." } },
          action:(done)=>{ renderPhoneScene("enroll-start"); highlightDevice("phone",1300); setTimeout(done,1000); } },

        { label:"New device generates fresh keypair in Secure Enclave",
          narration:"The new phone's Secure Enclave generates a new asymmetric keypair. The private key never leaves the Enclave. Only the public key is used in the recovery flow.",
          side:{ num:"02 / 07", title:"New device keypair generated",
            desc:"Hardware-backed keypair generated on the new device. <strong>Private key is non-exportable</strong> — it cannot be extracted even by the OS or ByoSync.",
            crypto:"// Inside new phone's Secure Enclave\nnew_device_keypair := Enclave.generateKeyPair(\n  algorithm: 'EC_P256',\n  extractable: false,  // hardware-bound\n  purpose: ['sign', 'unwrap']\n)\n\nnew_device_pubkey := new_device_keypair.public\n\n// Sent to ByoSync as part of recovery request\nPOST /v1/device/recover\n{\n  user_token: 'usr_8a2f',\n  new_device_pubkey: new_device_pubkey,\n  nonce: 'nr_8a2f',\n  attestation: new_device_keypair.sign(nonce)\n}",
            resp:{ tags:["soc2","pci"], text:"SOC 2 CC6.1 — hardware-backed key generation. PCI DSS Req 3.6 — key management lifecycle. Non-extractable private key: device theft does not expose the key material." } },
          action:(done)=>{ renderPhoneScene("enroll-keygen"); highlightDevice("phone",1600); setTimeout(()=>{ makePacket({ fromKey:"phone",toKey:"byoLeft",label:"Recovery req",color:"#22d3ee",onArrive:()=>{ highlightDevice("byosync",1300); done(); } }); },600); } },

        { label:"ByoSync sends approval request to the old device",
          narration:"ByoSync validates the new device's attestation, then pushes an approval request to the user's registered old device. The old device must sign the cross-device transfer.",
          side:{ num:"03 / 07", title:"Old device approval required",
            desc:"<strong>No single-device bypass.</strong> The old device must explicitly approve the new device's public key. This prevents account takeover from a stolen user_token alone.",
            crypto:"// ByoSync → old device push notification\nPOST /v1/push  (to old device_pubkey)\n{\n  type: 'NEW_DEVICE_APPROVAL',\n  new_device_pubkey: '04:9f:2a:…',\n  new_device_attestation: '<signed>',\n  request_id: 'req_7b4c',\n  expires_in: '10m'\n}\n\n// Old device shows:\n// 'Approve new iPhone 15 Pro joining your vault?'\n// User sees new device model + timestamp",
            resp:{ tags:["soc2","dpdp"], text:"SOC 2 CC6 — multi-party approval for credential migration. If the old device is unavailable, a fallback KYC re-verification path is offered (not shown in this flow)." } },
          action:(done)=>{ makePacket({ fromKey:"byoLeft",toKey:"phone",label:"Approve?",color:"#f87171",onArrive:()=>{ renderPhoneScene("consent-prompt-plaintext"); highlightDevice("phone",1400); done(); } }); } },

        { label:"Old device approves · signs the cross-device transfer",
          narration:"The user reviews the new device details on their old phone and approves. The old device signs a transfer intent binding the new device's public key.",
          side:{ num:"04 / 07", title:"Transfer approval signed by old device",
            desc:"The approval signature is <strong>bound to the exact new_device_pubkey</strong>. Any other public key = signature mismatch = rejected. Man-in-the-middle cannot substitute their own public key.",
            crypto:"// On old device\ntransfer_intent :=\n  'APPROVE_DEVICE' || new_device_pubkey ||\n  request_id || nonce || ts\n\ntransfer_sig := OldDeviceKey.sign(transfer_intent)\n\nPOST /v1/device/approve\n{\n  request_id: 'req_7b4c',\n  transfer_sig: transfer_sig\n}\n\n// ByoSync verifies:\n// • transfer_sig valid for old device_pubkey\n// • new_device_pubkey matches request",
            resp:{ tags:["soc2","pci"], text:"SOC 2 CC6 — explicit user intent required. Signature is bound to the specific new device key — replay and MITM attacks are cryptographically prevented." } },
          action:(done)=>{ renderPhoneScene("approved"); highlightDevice("phone",1200); setTimeout(()=>{ makePacket({ fromKey:"phone",toKey:"byoLeft",label:"Approved",color:"#34d399",onArrive:()=>{ highlightDevice("byosync",1300); done(); } }); },700); } },

        { label:"ByoSync re-wraps UMK for new device · vault pointer migrated",
          narration:"ByoSync's KMS re-wraps the UMK with the new device's public key. The re-wrapped UMK and encrypted vault pointer are sent to the new device.",
          side:{ num:"05 / 07", title:"UMK re-wrapped for new device",
            desc:"The UMK itself never travels in plaintext. The KMS performs a <strong>key re-wrapping operation</strong>: decrypt with old device key (inside KMS TEE), re-encrypt with new device public key. The result is sent to the new device.",
            crypto:"// Inside ByoSync KMS (TEE)\nUMK_plain := KMS.unwrap(wrapped_UMK_old, old_device_pubkey)\n\nnew_wrapped_UMK := KMS.wrap(\n  UMK_plain,\n  new_device_pubkey  // new device's EC P-256 key\n)\nzero(UMK_plain)  // never persisted\n\n// Sent to new device:\nPOST /v1/device/recover/complete\n{\n  new_wrapped_UMK: new_wrapped_UMK,\n  vault_ptr_enc: vault_ptr_enc  // encrypted vault URL\n}",
            resp:{ tags:["soc2","pci"], text:"PCI DSS Req 3.6 — split knowledge / dual control in KMS TEE. UMK plaintext exists only transiently inside the KMS hardware boundary." } },
          action:(done)=>{ makePacket({ fromKey:"byoLeft",toKey:"phone",label:"Re-wrapped UMK",color:"#60a5fa",onArrive:()=>{ renderPhoneScene("enroll-keygen"); highlightDevice("phone",1400); done(); } }); } },

        { label:"ByoSync DB updated · new device registered · old optionally revoked",
          narration:"ByoSync's Identity Registry swaps in the new device_pubkey. The old device is moved to 'pending-revocation' status. The user can choose to revoke it immediately.",
          side:{ num:"06 / 07", title:"Identity Registry updated",
            desc:"ByoSync's DB now recognises the new device. Old device access can be revoked in one tap. <strong>A device stolen before recovery approval cannot be used</strong> — the new_wrapped_UMK bound to the old key is no longer valid.",
            crypto:"// ByoSync DB update\nIdentityRegistry.update('usr_8a2f', {\n  device_pubkey: new_device_pubkey,\n  prev_device_pubkey: old_device_pubkey,\n  prev_device_status: 'pending-revocation',\n  recovered_at: now\n})\n\n// Audit entry\naudit.append({\n  event: 'device_recovered',\n  user_token: 'usr_8a2f',\n  old_device: old_device_pubkey[:8]+'…',\n  new_device: new_device_pubkey[:8]+'…'\n})",
            resp:{ tags:["soc2","dpdp"], text:"SOC 2 CC6.2 — device de-provisioning. DPDP — user controls their own device trust list. Immediate revocation available from the dashboard." } },
          action:(done)=>{ makePacket({ fromKey:"enclaveTop",toKey:"byoBottom",label:"Audit hash",color:"#34d399",onArrive:()=>{ renderDesktopScene("enroll-registered"); highlightDevice("byosync",1300); done(); } }); } },

        { label:"Recovery complete · vault accessible from new device",
          narration:"New phone can now decrypt the vault: it holds the re-wrapped UMK, the vault pointer, and has biometric templates captured via fresh enrollment on the new device.",
          side:{ num:"07 / 07", title:"Recovery complete · full access restored",
            desc:"The user re-enrolls biometrics on the new device (one short scan). New helper_data + k2 are generated and stored locally. The vault is fully accessible without any PII ever touching ByoSync.",
            crypto:"// New device final state\nSecureEnclave:\n  wrapped_UMK: new_wrapped_UMK\n  device_keypair: new_device_keypair\n  helper_data: new_helper_data  // from fresh biometric scan\n\nvault_ptr: decrypted from vault_ptr_enc\n\n// Vault access test\nk2  := FuzzyExtract.reconstruct(live_scan, new_helper_data)\nUMK := Enclave.unwrap(new_wrapped_UMK, kdf(k2, device_hw_key))\nDEK := AES_decrypt(wDEK, UMK)\nplaintext := AES_decrypt(ct, DEK)  // ✓ vault accessible",
            resp:{ tags:["soc2","dpdp","pci"], text:"Recovery flow never transmits UMK in plaintext. ByoSync is not in the personal data path before or after recovery. Zero PII exposed during the entire flow." } },
          action:(done)=>{ renderPhoneScene("enroll-start"); highlightDevice("phone",1400); highlightDevice("vault",1400); setTimeout(done,1600); } },
      ],
    };

    /* ── dossier renderer ── */
    function renderDossier() {
      const c = container.querySelector<HTMLElement>("#sf-dossierBody");
      if (!c) return;
      c.innerHTML = "";
      const scen = SCENARIOS[currentScenario];
      if (!scen) return;
      if (currentStep === 0) {
        const titles: Record<string,string> = { vault_inception:"Vault inception · v2 enclave", boolean:"Boolean proof (default)", payment:"Face-payment · PCI", plaintext:"Plaintext view (high-risk)", revoke:"Revoke + cascade · v3", lineage_reshare:"Lineage re-share · v3", a2a_agent:"A2A agent-to-agent · worked flows", encrypted_share:"Encrypted field share · v2", data_update:"Vault data update", new_device:"New device recovery" };
        const descs: Record<string,string> = { vault_inception:"Registration: hybrid cipher → DB → Nitro enclave → vault. Mongo + lineage ledger store wrapped blobs only.", boolean:"Boolean answers in Nitro. Signed JWS to Company A — no field values.", payment:"Face + voice SCA on tokenized payment intent. PAN never on ByoSync.", plaintext:"High-risk: googleProxy fetch → enclave decrypt → watermarked stream.", revoke:"v3 cascade: lineage REVOKED, delegated JWTs dead, webhooks + deletion callbacks, hash-chain audit.", lineage_reshare:"Sanctioned A→B re-share through enclave re-encrypt. Lineage edge + consent #2 for transferee.", a2a_agent:"Six phases (0–6): mandate → KYA card → 3-tier consent → A2A task → runtime unlock → artifact/lineage → revoke + deletion. Shopping + orchestrated §6.", encrypted_share:"In-person share: enclave encrypt-to Company A pubkey.", data_update:"KYC refresh with forward secrecy; cipher to vault.", new_device:"Old device approves · KMS re-wrap." };
        c.innerHTML = `<div class="sf-entry"><div class="sf-entry-num">Step 0 · Ready</div><div class="sf-entry-title">${titles[currentScenario]}</div><div class="sf-entry-desc">${descs[currentScenario]}</div></div>`;
        return;
      }
      const s = scen[currentStep-1];
      if (!s) return;
      const sd = s.side;
      const tags = (sd.resp.tags||[]).map(tag => {
        const label = tag==="dpdp"?"DPDP":tag==="soc2"?"SOC 2":"PCI DSS";
        return `<span class="sf-tag sf-tag-${tag}">${label}</span>`;
      }).join("");
      c.innerHTML = `<div class="sf-entry"><div class="sf-entry-num">${sd.num}</div><div class="sf-entry-title">${sd.title}</div><div class="sf-entry-desc">${sd.desc}</div>${sd.crypto?`<div class="sf-crypto-block">${sd.crypto}</div>`:""}${sd.resp?`<div class="sf-resp-block"><div class="sf-resp-tags">${tags}</div>${sd.resp.text}</div>`:""}</div>`;
    }

    function updateMeter() {
      const total = (SCENARIOS[currentScenario]||[]).length;
      const numEl   = container.querySelector<HTMLElement>("#sf-stepNum");
      const totalEl = container.querySelector<HTMLElement>("#sf-stepTotal");
      const fill    = container.querySelector<HTMLElement>("#sf-timelineFill");
      const narr    = container.querySelector<HTMLElement>("#sf-narration");
      if (numEl)   numEl.textContent   = String(currentStep);
      if (totalEl) totalEl.textContent = String(total);
      if (fill)    fill.style.width    = total===0 ? "0%" : Math.min(100,(currentStep/total)*100)+"%";
      if (narr) {
        if (currentStep===0)     narr.innerHTML = "Choose a scenario above and press <strong>Play</strong>. Target v3 (on v2 enclave): Consent Manager rail with lineage ledger, A→B re-share, Google A2A + KYA, cascade revoke, and runtime fail-closed tokens. Spec: BYOSYNC_FLOW_V3_LINEAGE_A2A_COMPLIANCE.md.";
        else if (currentStep > total) narr.innerHTML = "Flow complete. Press <strong>Reset</strong> to restart, or switch scenarios above.";
        else narr.textContent = (SCENARIOS[currentScenario]||[])[currentStep-1]?.narration || "";
      }
    }

    function advanceAnimated(onDone?: () => void) {
      const scen = SCENARIOS[currentScenario]||[];
      if (currentStep >= scen.length) { onDone && onDone(); return; }
      currentStep++;
      renderDossier();
      updateMeter();
      scen[currentStep-1].action(() => onDone && onDone());
    }

    function play() {
      if (playing) return;
      playing = true;
      const playBtn = container.querySelector<HTMLButtonElement>("#sf-playBtn");
      if (playBtn) playBtn.innerHTML = '<span>⏸</span>Pause';
      function loop() {
        if (!playing) return;
        const scen = SCENARIOS[currentScenario]||[];
        if (currentStep >= scen.length) { pauseFn(); return; }
        advanceAnimated(() => { playTimeout = setTimeout(loop, 1700); });
      }
      loop();
    }
    function pauseFn() {
      playing = false;
      const playBtn = container.querySelector<HTMLButtonElement>("#sf-playBtn");
      if (playBtn) playBtn.innerHTML = '<span>▶</span>Play';
      if (playTimeout) { clearTimeout(playTimeout); playTimeout = null; }
    }
    function resetFn() {
      pauseFn();
      currentStep = 0;
      clearAllHighlights();
      const layer = scene.querySelector<SVGGElement>("#sf-packets");
      if (layer) while (layer.firstChild) layer.removeChild(layer.firstChild);
      renderPhoneIdle();
      renderDesktopIdle();
      setDesktopChrome("COMPANY A · AcmePay");
      renderDossier();
      updateMeter();
    }
    function applyScenarioLayout(name: string) {
      const isA2a = name === "a2a_agent";
      container.classList.toggle("sf-scene-a2a", isA2a);
      if (!isA2a) setDesktopChrome("COMPANY A · AcmePay");
    }

    function switchScenario(name: string) {
      pauseFn();
      currentScenario = name;
      applyScenarioLayout(name);
      container.querySelectorAll<HTMLButtonElement>(".sf-tab").forEach(tab => {
        tab.classList.toggle("sf-active", tab.dataset.scenario===name);
        if (tab.dataset.scenario === name) {
          tab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
      });
      resetFn();
    }

    /* ── init ── */
    drawScene();
    applyScenarioLayout(currentScenario);
    renderDossier();
    updateMeter();

    /* ── go-back (no animation replay — dossier + meter update only) ── */
    function goBack() {
      if (currentStep === 0) return;
      pauseFn();
      currentStep--;
      renderDossier();
      updateMeter();
    }

    /* ── wire nav scroll arrows ── */
    const scenNav   = container.querySelector<HTMLElement>("#sf-scenarios-nav");
    const navLeft   = container.querySelector<HTMLButtonElement>("#sf-nav-left");
    const navRight  = container.querySelector<HTMLButtonElement>("#sf-nav-right");
    const SCROLL_AMT = 260;
    function updateNavArrows() {
      if (!scenNav || !navLeft || !navRight) return;
      navLeft.dataset.hidden  = scenNav.scrollLeft <= 4 ? "true" : "false";
      navRight.dataset.hidden = scenNav.scrollLeft + scenNav.clientWidth >= scenNav.scrollWidth - 4 ? "true" : "false";
    }
    const onNavLeft  = () => { scenNav?.scrollBy({ left: -SCROLL_AMT, behavior: "smooth" }); };
    const onNavRight = () => { scenNav?.scrollBy({ left:  SCROLL_AMT, behavior: "smooth" }); };
    navLeft?.addEventListener("click",  onNavLeft);
    navRight?.addEventListener("click", onNavRight);
    scenNav?.addEventListener("scroll", updateNavArrows);
    updateNavArrows();

    /* ── wire controls ── */
    const playBtn  = container.querySelector<HTMLButtonElement>("#sf-playBtn");
    const stepBtn  = container.querySelector<HTMLButtonElement>("#sf-stepBtn");
    const resetBtn = container.querySelector<HTMLButtonElement>("#sf-resetBtn");
    const onPlay  = () => { if (playing) pauseFn(); else play(); };
    const onStep  = () => { const scen=SCENARIOS[currentScenario]||[]; if (currentStep<scen.length) advanceAnimated(); };
    const onReset = () => resetFn();
    playBtn?.addEventListener("click",  onPlay);
    stepBtn?.addEventListener("click",  onStep);
    resetBtn?.addEventListener("click", onReset);
    container.querySelectorAll<HTMLButtonElement>(".sf-tab").forEach(tab => {
      const handler = () => switchScenario(tab.dataset.scenario || "boolean");
      tab.addEventListener("click", handler);
      (tab as HTMLButtonElement & { _sfHandler?: () => void })._sfHandler = handler;
    });

    /* ── keyboard navigation ── */
    const onKeyDown = (e: KeyboardEvent) => {
      // Only activate when demo section is in the viewport
      const rect = container.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.9 && rect.bottom > window.innerHeight * 0.1;
      if (!inView) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const scen = SCENARIOS[currentScenario]||[];
        if (currentStep < scen.length) advanceAnimated();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goBack();
      } else if (e.key === " ") {
        e.preventDefault();
        if (playing) pauseFn(); else play();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      pauseFn();
      playBtn?.removeEventListener("click",  onPlay);
      stepBtn?.removeEventListener("click",  onStep);
      resetBtn?.removeEventListener("click", onReset);
      navLeft?.removeEventListener("click",  onNavLeft);
      navRight?.removeEventListener("click", onNavRight);
      scenNav?.removeEventListener("scroll", updateNavArrows);
      document.removeEventListener("keydown", onKeyDown);
      container.querySelectorAll<HTMLButtonElement & { _sfHandler?: () => void }>(".sf-tab").forEach(tab => {
        if (tab._sfHandler) tab.removeEventListener("click", tab._sfHandler);
      });
    };
  }, []);

  return (
    <div
      id="byosync-sf"
      ref={containerRef}
      className={isFullscreen ? "sf-fullscreen" : "sf-embedded"}
      style={isFullscreen ? { marginTop: "3.5rem" } : undefined}
    >
      <style dangerouslySetInnerHTML={{ __html: SF_CSS }} />

      {/* ── Compact legend + scenarios (fullscreen) or full header (embedded) ── */}
      <div className="sf-top-strip">
      {isFullscreen ? (
        <div className="sf-legend" aria-label="Diagram legend">
          <div className="sf-legend-row"><span className="sf-lg-dot" style={{color:"#5dc97e",background:"#5dc97e"}} />Phone</div>
          <div className="sf-legend-row sf-legend-a2a-row"><span className="sf-lg-dot" style={{color:"#a78bfa",background:"#a78bfa"}} />Agent</div>
          <div className="sf-legend-row"><span className="sf-lg-dot" style={{color:"#1d4ed8",background:"#1d4ed8"}} />DB</div>
          <div className="sf-legend-row"><span className="sf-lg-dot" style={{color:"#f472b6",background:"#f472b6"}} />Enclave</div>
          <div className="sf-legend-row"><span className="sf-lg-dot" style={{color:"#38bdf8",background:"#38bdf8"}} />Co. A</div>
          <div className="sf-legend-row"><span className="sf-lg-dot" style={{color:"#fbbf24",background:"#fbbf24"}} />Co. B</div>
          <div className="sf-legend-row"><span className="sf-lg-dot" style={{color:"#00e5d3",background:"#00e5d3"}} />Vault</div>
        </div>
      ) : null}
      <div className="sf-header">
        <p className="sf-eyebrow">Target architecture · v3 · lineage + A2A + compliance</p>
        <h2 className="sf-h2">
          See exactly how <span>trust moves</span><br />through ByoSync.
        </h2>
        <p className="sf-subtitle">
          v3 extends the v2 enclave stack: ByoSync as Consent Manager (lineage ledger, hash-chain audit), sanctioned Company A→B re-share, Google A2A agent overlay with KYA credentials, and cascade revoke with deletion callbacks. Decrypt only in Nitro — between DB and vault.
        </p>
        {/* Legend */}
        <div className="sf-legend">
          <div className="sf-legend-row">
            <span className="sf-lg-dot" style={{color:"#5dc97e",background:"#5dc97e"}} />User / Phone
          </div>
          <div className="sf-legend-row sf-legend-a2a-row">
            <span className="sf-lg-dot" style={{color:"#a78bfa",background:"#a78bfa"}} />User agent (A2A)
          </div>
          <div className="sf-legend-row">
            <span className="sf-lg-dot" style={{color:"#1d4ed8",background:"#1d4ed8"}} />ByoSync DB + lineage
          </div>
          <div className="sf-legend-row">
            <span className="sf-lg-dot" style={{color:"#f472b6",background:"#f472b6"}} />Nitro enclave
          </div>
          <div className="sf-legend-row">
            <span className="sf-lg-dot" style={{color:"#38bdf8",background:"#38bdf8"}} />Company A
          </div>
          <div className="sf-legend-row">
            <span className="sf-lg-dot" style={{color:"#fbbf24",background:"#fbbf24"}} />Company B · lineage
          </div>
          <div className="sf-legend-row">
            <span className="sf-lg-dot" style={{color:"#00e5d3",background:"#00e5d3"}} />User vault
          </div>
        </div>
      </div>
      </div>

      {/* ── Scenario Tabs ── */}
      <div className="sf-nav-wrap">
        <button id="sf-nav-left"  className="sf-nav-arrow sf-nav-left"  aria-label="Scroll scenarios left"  data-hidden="true">‹</button>
        <button id="sf-nav-right" className="sf-nav-arrow sf-nav-right" aria-label="Scroll scenarios right">›</button>
        <nav id="sf-scenarios-nav" className="sf-scenarios">
          <button className="sf-tab sf-active" data-scenario="vault_inception">
            <div className="sf-sc-num">SCENARIO · 00</div>
            <div className="sf-sc-title">Vault inception</div>
            <div className="sf-sc-desc">Hybrid cipher → Nitro enclave → wrapped Mongo + Drive.</div>
          </button>
          <button className="sf-tab" data-scenario="boolean">
            <div className="sf-sc-num">SCENARIO · 01</div>
            <div className="sf-sc-title">Boolean proof</div>
            <div className="sf-sc-desc">Decrypt in Nitro · signed assertion only.</div>
          </button>
          <button className="sf-tab" data-scenario="payment">
            <div className="sf-sc-num">SCENARIO · 02</div>
            <div className="sf-sc-title">Face-payment</div>
            <div className="sf-sc-desc">Face + voice 2FA, tokenized payment intent.</div>
          </button>
          <button className="sf-tab" data-scenario="plaintext">
            <div className="sf-sc-num">SCENARIO · 03</div>
            <div className="sf-sc-title">Plaintext access</div>
            <div className="sf-sc-desc">High-risk view. Employee MFA + watermark.</div>
          </button>
          <button className="sf-tab" data-scenario="revoke">
            <div className="sf-sc-num">SCENARIO · 04</div>
            <div className="sf-sc-title">Revoke + cascade</div>
            <div className="sf-sc-desc">Lineage REVOKED · deletion callbacks · fail-closed.</div>
          </button>
          <button className="sf-tab" data-scenario="lineage_reshare">
            <div className="sf-sc-num">SCENARIO · 05</div>
            <div className="sf-sc-title">Lineage re-share</div>
            <div className="sf-sc-desc">A→B through enclave · consent #2 · ledger edge.</div>
          </button>
          <button className="sf-tab" data-scenario="a2a_agent">
            <div className="sf-sc-num">SCENARIO · 06</div>
            <div className="sf-sc-title">A2A agent-to-agent</div>
            <div className="sf-sc-desc">6 phases · 3 data classes · orchestrated.</div>
          </button>
          <button className="sf-tab" data-scenario="encrypted_share">
            <div className="sf-sc-num">SCENARIO · 07</div>
            <div className="sf-sc-title">Encrypted share</div>
            <div className="sf-sc-desc">Enclave → encrypt-to-company pubkey.</div>
          </button>
          <button className="sf-tab" data-scenario="data_update">
            <div className="sf-sc-num">SCENARIO · 08</div>
            <div className="sf-sc-title">Vault data update</div>
            <div className="sf-sc-desc">KYC refresh, forward secrecy, cache invalidation.</div>
          </button>
          <button className="sf-tab" data-scenario="new_device">
            <div className="sf-sc-num">SCENARIO · 09</div>
            <div className="sf-sc-title">New device recovery</div>
            <div className="sf-sc-desc">Old device approves · UMK re-wrapped · zero PII.</div>
          </button>
        </nav>
      </div>

      {/* ── Stage ── */}
      <main className="sf-stage">
        <section className="sf-theatre">
          <div className="sf-controls">
            <button id="sf-playBtn" className="sf-btn sf-btn-primary"><span>▶</span>Play</button>
            <button id="sf-stepBtn" className="sf-btn sf-btn-ghost"><span>›</span>Step</button>
            <button id="sf-resetBtn" className="sf-btn sf-btn-ghost"><span>↻</span>Reset</button>
            <div className="sf-zoom-controls" role="group" aria-label="Diagram zoom">
              <button type="button" className="sf-btn sf-btn-ghost sf-zoom-btn" onClick={zoomOut} aria-label="Zoom out" title="Zoom out">−</button>
              <span className="sf-zoom-label" id="sf-zoom-label">{Math.round(zoom * 100)}%</span>
              <button type="button" className="sf-btn sf-btn-ghost sf-zoom-btn" onClick={zoomIn} aria-label="Zoom in" title="Zoom in">+</button>
              <button type="button" className="sf-btn sf-btn-ghost sf-zoom-btn sf-zoom-fit" onClick={zoomFit} aria-label="Fit full diagram in view" title="Fit to screen">Fit</button>
            </div>
            <div className="sf-step-meter">
              <span>Step <strong id="sf-stepNum">0</strong>/<strong id="sf-stepTotal">0</strong></span>
              <div className="sf-timeline"><div className="sf-timeline-fill" id="sf-timelineFill" /></div>
            </div>
            <div className="sf-kbd-hint">
              <kbd>←</kbd><kbd>→</kbd> step &nbsp; <kbd>Space</kbd> play &nbsp; <kbd>Ctrl</kbd>+wheel zoom
            </div>
          </div>
          <div className="sf-scene-frame">
            <div className="sf-scene-viewport" ref={viewportRef} title="Scroll to pan · Ctrl+wheel to zoom">
              <div
                className="sf-scene-inner"
                style={{ transform: `scale(${zoom})` }}
              >
                <svg id="sf-scene" className="sf-scene" viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} xmlns="http://www.w3.org/2000/svg" aria-label="ByoSync v3 architecture: phone, user agent, database, enclave, vault, and companies" />
              </div>
            </div>
          </div>
        </section>

        <aside className="sf-dossier">
          <div className="sf-dossier-head">Dossier · current step</div>
          <div id="sf-narration" className="sf-narration sf-narration-in-panel">
            Choose a scenario above and press <strong>Play</strong>. v3: lineage ledger, A→B re-share, A2A+KYA, cascade revoke — on v2 Nitro enclave between DB and vault.
          </div>
          <div id="sf-dossierBody">
            <div className="sf-entry">
              <div className="sf-entry-num">Step 0 · Ready</div>
              <div className="sf-entry-title">Press <em>Play</em></div>
              <div className="sf-entry-desc">
                Each step shows what&apos;s happening on each device, what cryptography is running, and which clauses of <strong>DPDP Rules 2025</strong>, <strong>SOC 2</strong>, and <strong>PCI DSS v4.0.1</strong> apply.<br /><br />
                <strong>v3 on v2:</strong> enclave decrypts; DB holds lineage + hash-chain audit; VERIFY default, OPERATE minimal. Specs: BYOSYNC_FLOW_V2_ENCLAVE_TARGET.md + BYOSYNC_FLOW_V3_LINEAGE_A2A_COMPLIANCE.md.
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};
