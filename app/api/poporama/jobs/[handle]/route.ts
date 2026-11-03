import { NextRequest, NextResponse } from "next/server";
import { requirePoporamaSession } from "@/app/lib/poporama-auth";
import { JOB_TYPE, read } from "@/app/lib/poporama-job-store";
import { retryJob, type ImportJob } from "@/app/lib/poporama-import-jobs";
import { jobError, validJobHandle } from "@/app/lib/poporama-job-http";
export const dynamic = "force-dynamic";
export async function GET(_request: NextRequest, { params }: { params: { handle: string } }) {
  const unauthorized = await requirePoporamaSession(); if (unauthorized) return unauthorized;
  try {
    if (!validJobHandle(params.handle)) throw new Error("Lavoro non valido.");
    const job = await read<ImportJob>(JOB_TYPE, params.handle);
    if (!job) return NextResponse.json({ ok: false, error: "Lavoro non trovato" }, { status: 404 });
    return NextResponse.json({ ok: true, job });
  } catch (e) { return jobError(e); }
}

export async function POST(request: NextRequest, { params }: { params: { handle: string } }) {
  const unauthorized = await requirePoporamaSession(); if (unauthorized) return unauthorized;
  try {
    if (!validJobHandle(params.handle) || (await request.json()).action !== "retry") throw new Error("Operazione non valida.");
    return NextResponse.json({ ok: true, job: await retryJob(params.handle) });
  } catch (e) { return jobError(e); }
}
