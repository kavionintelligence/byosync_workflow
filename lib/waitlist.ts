import { Redis } from "@upstash/redis";
import fs from "fs/promises";
import path from "path";

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

/** True when running `vercel dev` (local). Uses writable disk; keys optional. */
export function isVercelDevCli(): boolean {
  return process.env.VERCEL === "1" && process.env.VERCEL_ENV === "development";
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
 * Persist signup. On Vercel production/preview, Upstash Redis is required (no durable disk).
 * Locally (`npm run dev`) or `vercel dev`, uses data/waitlist.csv when Redis is not configured.
 * @returns whether the row was written to Redis or local CSV.
 */
export async function appendWaitlistRow(row: WaitlistPayload): Promise<boolean> {
  const redis = getRedis();
  const entry: StoredRow = {
    timestamp: new Date().toISOString(),
    ...row,
  };

  if (redis) {
    await redis.rpush(REDIS_KEY, JSON.stringify(entry));
    return true;
  }

  const noDiskOnVercelHost =
    process.env.VERCEL === "1" && !isVercelDevCli();

  if (noDiskOnVercelHost) {
    console.warn(
      "[waitlist] Vercel host: no Upstash Redis — row not persisted.",
    );
    return false;
  }

  await appendWaitlistFileRow(row);
  return true;
}

/** Shown in API/UI when Production/Preview has no Upstash (required to store signups on Vercel). */
export const WAITLIST_VERCEL_SETUP_HINT =
  "Vercel → Project → Settings → Environment Variables: add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (https://upstash.com → Redis → REST API). Set WAITLIST_EXPORT_TOKEN to download CSV from /api/waitlist/export?token=… . Use Production + Preview, then Deployments → Redeploy.";

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
 * Production/Preview on Vercel need Upstash Redis (only durable store on serverless).
 * `npm run dev` / `vercel dev` may use local CSV without Redis.
 */
export function waitlistVercelReady(): boolean {
  if (process.env.VERCEL !== "1") return true;
  if (isVercelDevCli()) return true;
  return hasUpstashRedis();
}
