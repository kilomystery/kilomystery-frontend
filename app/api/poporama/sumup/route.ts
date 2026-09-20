import { requirePoporamaSession } from "@/app/lib/poporama-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUMUP_BASE_URL = "https://api.sumup.com";
function getApiKey() {
  const apiKey = process.env.SUMUP_API_KEY;

  if (!apiKey) {
    throw new Error("SUMUP_API_KEY non configurata.");
  }

  return apiKey;
}

async function sumupFetch(path: string, init?: RequestInit) {
  const response = await fetch(`${SUMUP_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  let data: any = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    const detail =
      data?.detail ||
      data?.message ||
      data?.error_description ||
      data?.error ||
      `Errore SumUp HTTP ${response.status}`;

    const error = new Error(detail) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return data;
}

async function getMerchantCode() {
  const me = await sumupFetch("/v0.1/me", { method: "GET" });

  const merchantCode =
    me?.merchant_profile?.merchant_code ||
    me?.merchant_code ||
    me?.merchant?.merchant_code;

  if (!merchantCode) {
    throw new Error(
      "SumUp ha autenticato la API key, ma non è stato possibile ricavare il Merchant Code."
    );
  }

  return String(merchantCode);
}

async function listReaders(merchantCode: string) {
  const data = await sumupFetch(
    `/v0.1/merchants/${encodeURIComponent(merchantCode)}/readers`,
    { method: "GET" }
  );

  return Array.isArray(data?.items) ? data.items : [];
}

export async function GET(request: NextRequest) {
  const unauthorized = await requirePoporamaSession();
  if (unauthorized) return unauthorized;

  try {
    const merchantCode = await getMerchantCode();
    const readers = await listReaders(merchantCode);

    return NextResponse.json({
      ok: true,
      authenticated: true,
      merchantCode,
      affiliateConfigured: Boolean(process.env.SUMUP_AFFILIATE_KEY),
      readers: readers.map((reader: any) => ({
        id: reader?.id || "",
        name: reader?.name || "",
        status: reader?.status || "unknown",
        model: reader?.device?.model || "",
        identifier: reader?.device?.identifier || "",
        createdAt: reader?.created_at || "",
        updatedAt: reader?.updated_at || "",
      })),
    });
  } catch (error) {
    console.error("Errore GET SumUp POPORAMA:", error);

    const status =
      typeof (error as any)?.status === "number"
        ? (error as any).status
        : 500;

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Errore SumUp sconosciuto.",
      },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requirePoporamaSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const action = String(body?.action || "").toLowerCase();

    if (action !== "pair") {
      return NextResponse.json(
        { ok: false, error: "Azione SumUp non valida." },
        { status: 400 }
      );
    }

    const pairingCode = String(body?.pairingCode || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");

    if (!/^[A-Z0-9]{8,9}$/.test(pairingCode)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Il codice di pairing SumUp deve contenere 8 o 9 caratteri alfanumerici.",
        },
        { status: 400 }
      );
    }

    const merchantCode = await getMerchantCode();

    const reader = await sumupFetch(
      `/v0.1/merchants/${encodeURIComponent(merchantCode)}/readers`,
      {
        method: "POST",
        body: JSON.stringify({
          pairing_code: pairingCode,
          name: "POPORAMA SOLO",
          metadata: {
            application: "POPORAMA",
          },
        }),
      }
    );

    return NextResponse.json({
      ok: true,
      message: "Richiesta di associazione inviata a SumUp.",
      merchantCode,
      reader: {
        id: reader?.id || "",
        name: reader?.name || "",
        status: reader?.status || "unknown",
        model: reader?.device?.model || "",
        identifier: reader?.device?.identifier || "",
      },
    });
  } catch (error) {
    console.error("Errore pairing SumUp POPORAMA:", error);

    const status =
      typeof (error as any)?.status === "number"
        ? (error as any).status
        : 500;

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Errore pairing SumUp sconosciuto.",
      },
      { status }
    );
  }
}
