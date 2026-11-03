import { requirePoporamaSession } from "@/app/lib/poporama-auth";
import { shopifyDiagnostics } from "@/app/lib/poporama-shopify-diagnostics";
import { safeShopifyText } from "@/app/lib/poporama-shopify-scopes";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;
const headers = { "Cache-Control": "private, no-store, max-age=0", Pragma: "no-cache" };
export async function GET(request: NextRequest) {
  const unauthorized = await requirePoporamaSession(); if (unauthorized) return unauthorized;
  try {
    const diagnosis = await shopifyDiagnostics({ refresh: request.nextUrl.searchParams.get("refresh") === "1" });
    return NextResponse.json({ ok: true, ...diagnosis }, { headers });
  } catch (error) {
    return NextResponse.json({ ok: false, error: safeShopifyText(error instanceof Error ? error.message : "Diagnostica Shopify non disponibile") }, { status: 502, headers });
  }
}
