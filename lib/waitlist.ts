import { Redis } from "@upstash/redis";
import fs from "fs/promises";
import path from "path";

export const WAITLIST_NOTIFY_DEFAULT = "varun.k@byosync.in";

/** Redis list key — survives Vercel serverless (ephemeral disk). */
const REDIS_KEY = "byosync:waitlist:v1";

export const DATA_DIR = path.join(process.cwd(), "data");
export const CSV_PATH = path.join(DATA_DIR, "waitlist.csv");

export function hasUpstashRedis(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

export function hasResend(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function getRedis(): Redis | null {
  if (!hasUpstashRedis()) return null;
  return Redis.fromEnv();
}

export function escapeCsvCell(value: string): string {
  const cleaned = value.replace(/\r\n|\r|\n/g, " ").trim();
  if (/[",]/.test(cleaned)) return `"${cleaned.replace(/"/g, '""')}"`;
  return cleaned;
}

export type WaitlistPayload = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
};

type StoredRow = WaitlistPayload & { timestamp: string };

async function appendWaitlistFileRow(row: WaitlistPayload): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  let exists = true;
  try {
    await fs.access(CSV_PATH);
  } catch {
    exists = false;
  }

  const cells = [
    new Date().toISOString(),
    row.name,
    row.email,
    row.phone,
    row.linkedin,
  ].map(escapeCsvCell);

  const line = cells.join(",") + "\n";

  if (!exists) {
    const header = "timestamp,name,email,phone,linkedin_url\n";
    await fs.writeFile(CSV_PATH, header + line, "utf8");
  } else {
    await fs.appendFile(CSV_PATH, line, "utf8");
  }
}

/**
 * Persist signup. On Vercel, use Upstash Redis (not the local CSV).
 * Locally, uses data/waitlist.csv when Redis is not configured.
 */
export async function appendWaitlistRow(row: WaitlistPayload): Promise<void> {
  const redis = getRedis();
  const entry: StoredRow = {
    timestamp: new Date().toISOString(),
    ...row,
  };

  if (redis) {
    await redis.rpush(REDIS_KEY, JSON.stringify(entry));
    return;
  }

  if (process.env.VERCEL === "1") {
    console.warn(
      "[waitlist] Vercel: no Upstash Redis — signup not in database (use Resend email and/or add Redis).",
    );
    return;
  }

  await appendWaitlistFileRow(row);
}

/** Full CSV for export (Redis or local file). */
export async function buildWaitlistCsv(): Promise<string> {
  const header = "timestamp,name,email,phone,linkedin_url\n";
  const redis = getRedis();

  if (redis) {
    const items = await redis.lrange<string>(REDIS_KEY, 0, -1);
    if (!items?.length) return header;
    const lines = items
      .map((raw) => {
        try {
          const o = JSON.parse(raw) as StoredRow;
          return [
            o.timestamp,
            o.name,
            o.email,
            o.phone,
            o.linkedin ?? "",
          ]
            .map(escapeCsvCell)
            .join(",");
        } catch {
          return "";
        }
      })
      .filter(Boolean);
    return header + lines.join("\n") + "\n";
  }

  try {
    const raw = await fs.readFile(CSV_PATH, "utf8");
    if (raw.trim()) return raw.endsWith("\n") ? raw : raw + "\n";
  } catch {
    /* no local file */
  }
  return header;
}

/**
 * Vercel: need a real sink — email (Resend) and/or Redis export.
 * Local dev: always OK (writes CSV).
 */
export function waitlistVercelReady(): boolean {
  if (process.env.VERCEL !== "1") return true;
  return hasUpstashRedis() || hasResend();
}

function persistedSomewhere(): boolean {
  if (hasUpstashRedis()) return true;
  if (process.env.VERCEL !== "1") return true;
  return false;
}

/**
 * Send you a real email via Resend (works on Vercel).
 * reply_to = applicant email so you can hit Reply in your inbox.
 * Returns true if skipped (no API key), or Resend accepted the message.
 */
export async function notifyWaitlistByEmail(row: WaitlistPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return true;

  const to = (process.env.WAITLIST_NOTIFY_EMAIL || WAITLIST_NOTIFY_DEFAULT).trim();
  const from =
    process.env.RESEND_FROM?.trim() ||
    "ByoSync Waitlist <onboarding@resend.dev>";

  const html = `
    <h2 style="font-family:sans-serif;color:#0f172a;">New waitlist signup</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;">
      <tr><td style="padding:6px 12px 6px 0;color:#64748b;">Name</td><td>${escapeHtml(row.name)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#64748b;">Email</td><td><a href="mailto:${escapeHtml(row.email)}">${escapeHtml(row.email)}</a></td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#64748b;">Phone</td><td>${escapeHtml(row.phone)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#64748b;">LinkedIn</td><td>${row.linkedin ? escapeHtml(row.linkedin) : "—"}</td></tr>
    </table>
    <p style="font-family:sans-serif;font-size:13px;color:#475569;margin-top:16px;">
      <strong>Reply</strong> to this email goes to the applicant (${escapeHtml(row.email)}).
    </p>
    <p style="font-family:monospace;font-size:12px;color:#94a3b8;margin-top:8px;">${storageNoteHtml()}</p>
  `.trim();

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: row.email,
        subject: `[ByoSync Waitlist] ${row.name} — ${row.email}`,
        html,
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[waitlist] Resend error:", res.status, errText);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[waitlist] Resend request failed:", e);
    return false;
  }
}

/** After a signup: fail the request if nothing was stored AND email did not send. */
export async function deliverWaitlistNotifications(
  row: WaitlistPayload,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const emailOk = await notifyWaitlistByEmail(row);
  const stored = persistedSomewhere();

  if (!emailOk && !stored) {
    return {
      ok: false,
      message:
        "Could not save or email this signup. Check RESEND_API_KEY / domain on Resend, or add Upstash Redis.",
    };
  }

  if (!emailOk && stored) {
    console.error(
      "[waitlist] Resend failed but signup is in Redis/local file — follow up via export.",
    );
  }

  return { ok: true };
}

function storageNoteHtml(): string {
  if (hasUpstashRedis()) {
    return "Also stored in Upstash Redis — export CSV from your /api/waitlist/export link.";
  }
  if (process.env.VERCEL === "1") {
    return "Running on Vercel — add Upstash Redis if you also want a downloadable spreadsheet.";
  }
  return "Also appended to data/waitlist.csv on this machine.";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
