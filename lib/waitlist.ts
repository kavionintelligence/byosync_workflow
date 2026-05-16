import fs from "fs/promises";
import path from "path";

export const WAITLIST_NOTIFY_DEFAULT = "varun.k@byosync.in";

export const DATA_DIR = path.join(process.cwd(), "data");
export const CSV_PATH = path.join(DATA_DIR, "waitlist.csv");

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

export async function appendWaitlistRow(row: WaitlistPayload): Promise<void> {
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
    <p style="font-family:monospace;font-size:12px;color:#94a3b8;margin-top:16px;">Also appended to data/waitlist.csv on this server.</p>
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
