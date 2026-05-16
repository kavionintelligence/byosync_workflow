import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { CSV_PATH } from "@/lib/waitlist";

/**
 * Download all waitlist rows as CSV (opens in Excel).
 * Set WAITLIST_EXPORT_TOKEN in .env and call:
 *   GET /api/waitlist/export?token=YOUR_TOKEN
 */
export async function GET(req: NextRequest) {
  const secret = process.env.WAITLIST_EXPORT_TOKEN;
  if (!secret) {
    return NextResponse.json(
      { error: "Export not configured. Set WAITLIST_EXPORT_TOKEN in .env." },
      { status: 503 },
    );
  }

  const token = req.nextUrl.searchParams.get("token");
  if (token !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const raw = await fs.readFile(CSV_PATH, "utf8");
    const body = raw.trim() ? raw : "timestamp,name,email,phone,linkedin_url\n";
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="byosync-waitlist.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    const empty = "timestamp,name,email,phone,linkedin_url\n";
    return new NextResponse(empty, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="byosync-waitlist.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }
}
