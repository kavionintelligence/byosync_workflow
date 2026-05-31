/** Blue/white palette for landing demo UI (ported from byosync-landing) */
export const DEMO = {
  primary: "#2563eb",
  primaryLight: "#3b82f6",
  primaryDark: "#1d4ed8",
  sky: "#0284c7",
  muted: "#64748b",
  text: "#172554",
  textSoft: "#1e40af",
  border: "rgba(37,99,235,0.18)",
  borderLight: "rgba(37,99,235,0.12)",
  panel: "#ffffff",
  panelMuted: "#f8fafc",
  panelBlue: "#eff6ff",
  shellGradient: "linear-gradient(180deg, #ffffff 0%, #eff6ff 100%)",
  risk: "#dc2626",
  warn: "#d97706",
  ok: "#2563eb",
} as const;

export const STEP_COLORS = [
  DEMO.muted,
  DEMO.primary,
  DEMO.primary,
  DEMO.primaryLight,
  DEMO.primaryDark,
  DEMO.primary,
] as const;

export const AGENT_STEP_COLORS = [
  DEMO.primary,
  DEMO.muted,
  DEMO.warn,
  DEMO.risk,
  DEMO.primary,
  DEMO.primary,
  DEMO.primary,
  DEMO.warn,
  DEMO.primary,
  DEMO.primary,
] as const;

export const LAYER_COLORS = [
  DEMO.primary,
  DEMO.primaryLight,
  DEMO.primaryDark,
  DEMO.sky,
  DEMO.muted,
] as const;
