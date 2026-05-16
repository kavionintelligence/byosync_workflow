import { NextRequest, NextResponse } from "next/server";
import {
  appendWaitlistRow,
  notifyWaitlistByEmail,
} from "@/lib/waitlist";

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
        { status: 400 },
      );
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const row = { name, email, phone, linkedin };

    await appendWaitlistRow(row);

    // Fire-and-forget email to Varun (requires RESEND_API_KEY – see lib/waitlist.ts)
    void notifyWaitlistByEmail(row);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[waitlist]", e);
    return NextResponse.json(
      { error: "Could not save your request. Please try again." },
      { status: 500 },
    );
  }
}
