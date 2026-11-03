import { NextRequest, NextResponse } from "next/server";
import { requirePoporamaSession } from "@/app/lib/poporama-auth";
import { uploadChunk } from "@/app/lib/poporama-import-jobs";
import { jobError, validJobHandle } from "@/app/lib/poporama-job-http";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function POST(request: NextRequest, { params }: { params: { handle: string } }) {
  const unauthorized = await requirePoporamaSession(); if (unauthorized) return unauthorized;
  try {
    if (!validJobHandle(params.handle)) throw new Error("Lavoro non valido.");
    const text = await request.text();
    if (Buffer.byteLength(text) > 800000) throw new Error("Blocco troppo grande.");
    const body = JSON.parse(text);
    return NextResponse.json({ ok: true, job: await uploadChunk(params.handle, body.index, body.rows) });
  } catch (e) { return jobError(e); }
}
