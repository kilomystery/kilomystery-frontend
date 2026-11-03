import { NextRequest, NextResponse } from "next/server";
import { requirePoporamaSession } from "@/app/lib/poporama-auth";
import { advanceJob } from "@/app/lib/poporama-import-jobs";
import { jobError, validJobHandle, workerAuthorized } from "@/app/lib/poporama-job-http";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
async function run(request: NextRequest, handle?: string) {
  if (!await workerAuthorized(request)) { const unauthorized = await requirePoporamaSession(); if (unauthorized) return unauthorized; }
  try {
    if (handle && !validJobHandle(handle)) throw new Error("Lavoro non valido.");
    return NextResponse.json({ ok: true, job: await advanceJob(handle) });
  } catch (e) { return jobError(e); }
}
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  return run(request, typeof body.handle === "string" ? body.handle : undefined);
}
export async function GET(request: NextRequest) { return run(request); }
