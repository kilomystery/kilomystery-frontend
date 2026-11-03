import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { requirePoporamaSession } from "@/app/lib/poporama-auth";
import { parseManifest } from "@/app/lib/poporama-manifest";
import { jobError } from "@/app/lib/poporama-job-http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  const unauthorized = await requirePoporamaSession(); if (unauthorized) return unauthorized;
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file === "string" || file.size > 25 * 1024 * 1024) throw new Error("Carica un manifest fino a 25 MB.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    return NextResponse.json({ ok: true, digest: createHash("sha256").update(bytes).digest("hex"), rows: parseManifest(bytes, file.name) });
  } catch (e) { return jobError(e); }
}
