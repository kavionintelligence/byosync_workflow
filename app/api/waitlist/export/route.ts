import { NextRequest, NextResponse } from "next/server";
import { buildWaitlistCsv } from "@/lib/waitlist";

/**
 * Download all waitlist rows as CSV (opens in Excel).
 * Works on Vercel when Upstash Redis is configured (same data as POST).
 *
 *   GET /api/waitlist/export?token=WAITLIST_EXPORT_TOKEN
 */
export async function GET(req: NextRequest) {
  const secret = process.env.WAITLIST_EXPORT_TOKEN;
  if (!secret) {
    return NextResponse.json(
      { error: "Export not configured. Set WAITLIST_EXPORT_TOKEN in Vercel env." },
      { status: 503 },
    );
  }

  const token = req.nextUrl.searchParams.get("token");
  if (token !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await buildWaitlistCsv();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="byosync-waitlist.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
