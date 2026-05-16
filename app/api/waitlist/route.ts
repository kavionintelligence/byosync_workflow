import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const CSV_PATH = path.join(DATA_DIR, "waitlist.csv");

function escapeCsvCell(value: string): string {
  const cleaned = value.replace(/\r\n|\r|\n/g, " ").trim();
  if (/[",]/.test(cleaned)) return `"${cleaned.replace(/"/g, '""')}"`;
  return cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name : "";
    const email = typeof body.email === "string" ? body.email : "";
    const phone = typeof body.phone === "string" ? body.phone : "";
    const linkedin = typeof body.linkedin === "string" ? body.linkedin : "";

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and contact number are required." },
        { status: 400 }
      );
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    await fs.mkdir(DATA_DIR, { recursive: true });

    let exists = true;
    try {
      await fs.access(CSV_PATH);
    } catch {
      exists = false;
    }

    const row = [
      new Date().toISOString(),
      name,
      email,
      phone,
      linkedin,
    ].map(escapeCsvCell);

    const line = row.join(",") + "\n";

    if (!exists) {
      const header = "timestamp,name,email,phone,linkedin_url\n";
      await fs.writeFile(CSV_PATH, header + line, "utf8");
    } else {
      await fs.appendFile(CSV_PATH, line, "utf8");
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[waitlist]", e);
    return NextResponse.json(
      { error: "Could not save your request. Please try again." },
      { status: 500 }
    );
  }
}
