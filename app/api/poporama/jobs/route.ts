import { NextRequest, NextResponse } from "next/server";
import { requirePoporamaSession } from "@/app/lib/poporama-auth";
import { createJob, type ImportJob } from "@/app/lib/poporama-import-jobs";
import { JOB_TYPE, decode } from "@/app/lib/poporama-job-store";
import { graphql, page } from "@/app/lib/poporama-shopify";
import { jobError } from "@/app/lib/poporama-job-http";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  const unauthorized = await requirePoporamaSession(); if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    if (!["import", "translate"].includes(body?.kind)) throw new Error("Tipo lavoro non valido.");
    const job = await createJob(body);
    return NextResponse.json({ ok: true, job });
  } catch (e) { return jobError(e); }
}
export async function GET(request: NextRequest) {
  const unauthorized = await requirePoporamaSession(); if (unauthorized) return unauthorized;
  try {
    const definition = await graphql(`query PoporamaJobsExist($type: String!) { metaobjectDefinitionByType(type:$type) { id } }`, { type: JOB_TYPE });
    if (!definition.metaobjectDefinitionByType) return NextResponse.json({ ok: true, jobs: [], translationConfigured: !!process.env.DEEPL_API_KEY });
    const after = request.nextUrl.searchParams.get("after");
    const result = await page(JOB_TYPE, after, 100, "handle:job-*");
    const lot = request.nextUrl.searchParams.get("lottoHandle");
    return NextResponse.json({ ok: true, jobs: result.nodes.map(node => decode<ImportJob>(node)).filter(job => !lot || job.lottoHandle === lot), next: result.pageInfo.hasNextPage ? result.pageInfo.endCursor : null, translationConfigured: !!process.env.DEEPL_API_KEY });
  } catch (e) { return jobError(e); }
}
