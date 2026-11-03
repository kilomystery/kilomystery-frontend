import { NextRequest, NextResponse } from "next/server";
import { requirePoporamaSession } from "@/app/lib/poporama-auth";
import { articleByPP, field, updateNode } from "@/app/lib/poporama-shopify";
import { titleInfo, withTitle } from "@/app/lib/poporama-titles";
import { jobError } from "@/app/lib/poporama-job-http";
export const dynamic = "force-dynamic";
export async function PATCH(request: NextRequest, { params }: { params: { code: string } }) {
  const unauthorized = await requirePoporamaSession(); if (unauthorized) return unauthorized;
  try {
    const code = params.code.trim().toUpperCase();
    if (!/^PP-\d{6,}$/.test(code)) throw new Error("Codice PP non valido.");
    const body = await request.json();
    if (typeof body.nomeItaliano !== "string" || !body.nomeItaliano.trim() || body.nomeItaliano.length > 4000) throw new Error("Inserisci un nome italiano da 1 a 4000 caratteri.");
    const node = await articleByPP(code);
    if (!node || field(node, "codice_pp").toUpperCase() !== code) return NextResponse.json({ ok: false, error: "Articolo non trovato" }, { status: 404 });
    const info = titleInfo(node.fields);
    const updated = await updateNode(node.id, [{ key: "risultati_test", value: withTitle(node.fields, { version: 1, original: info.nomeOriginale, italian: body.nomeItaliano.trim(), status: "manual", updatedAt: new Date().toISOString() }) }]);
    return NextResponse.json({ ok: true, ...titleInfo(updated.fields) });
  } catch (e) { return jobError(e); }
}
