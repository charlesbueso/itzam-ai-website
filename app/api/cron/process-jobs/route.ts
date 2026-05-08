import { NextResponse } from "next/server";
import { processJobs } from "@/lib/jobs/processor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Vercel Cron endpoint. Configure in vercel.json:
 *   { "crons": [{ "path": "/api/cron/process-jobs", "schedule": "*\/5 * * * *" }] }
 *
 * Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically when
 * `CRON_SECRET` is set in the project. We require it.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }
  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await processJobs({ limit: 20 });
  return NextResponse.json(result);
}

// POST allowed for manual trigger via authenticated curl.
export const POST = GET;
