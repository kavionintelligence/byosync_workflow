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
      "[waitlist] Vercel: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — signup not persisted to DB (use Resend email only or add Upstash).",
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

/** Vercel needs Redis and/or Resend or signups are not retained. */
export function waitlistVercelReady(): boolean {
  if (process.env.VERCEL !== "1") return true;
  return hasUpstashRedis() || Boolean(process.env.RESEND_API_KEY?.trim());
}

function storageNoteHtml(): string {
  if (hasUpstashRedis()) {
    return "This signup was stored in Upstash Redis (export CSV from your admin link).";
  }
  if (process.env.VERCEL === "1") {
    return "Deployed on Vercel — ensure Upstash Redis and/or Resend is configured so signups are retained.";
  }
  return "This signup was appended to data/waitlist.csv on the server.";
}

/** Optional: notify via Resend when RESEND_API_KEY is set. Does not throw. */
export async function notifyWaitlistByEmail(row: WaitlistPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

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
    <p style="font-family:monospace;font-size:12px;color:#94a3b8;margin-top:16px;">${storageNoteHtml()}</p>
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
        subject: `[ByoSync Waitlist] ${row.name}`,
        html,
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[waitlist] Resend error:", res.status, errText);
    }
  } catch (e) {
    console.error("[waitlist] Resend request failed:", e);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
