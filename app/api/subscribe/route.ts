import { NextRequest, NextResponse } from "next/server";

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
// 👇 se il tuo token è in SHOPIFY_ADMIN_ACCESS_TOKEN lascia così.
// se invece è in SHOPIFY_ADMIN_API_ACCESS_TOKEN, cambia qui di conseguenza.
const ADMIN_TOKEN =
  process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ||
  process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

const API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-07";

const IS_DEV = process.env.NODE_ENV !== "production";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function createCustomer(email: string) {
  const url = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/customers.json`;

  const body = {
    customer: {
      email,
      email_marketing_consent: {
        state: "subscribed",
        opt_in_level: "single_opt_in",
        consent_updated_at: new Date().toISOString(),
      },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": ADMIN_TOKEN as string,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    // se non è JSON, leggiamo il testo per debug
    const txt = await res.text().catch(() => "");
    data = { raw: txt };
  }

  console.error("[newsletter] createCustomer response", res.status, data);

  return { ok: res.ok, status: res.status, data };
}

async function findCustomerByEmail(email: string) {
  const url = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/customers/search.json?query=email:${encodeURIComponent(
    email
  )}`;

  const res = await fetch(url, {
    headers: {
      "X-Shopify-Access-Token": ADMIN_TOKEN as string,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("[newsletter] search error", res.status, txt);
    return null;
  }

  const data = await res.json().catch(() => null);
  if (!data || !Array.isArray(data.customers) || data.customers.length === 0) {
    return null;
  }

  return data.customers[0];
}

async function updateCustomerMarketingConsent(customerId: number | string) {
  const url = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/customers/${customerId}.json`;

  const body = {
    customer: {
      id: customerId,
      email_marketing_consent: {
        state: "subscribed",
        opt_in_level: "single_opt_in",
        consent_updated_at: new Date().toISOString(),
      },
    },
  };

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "X-Shopify-Access-Token": ADMIN_TOKEN as string,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    const txt = await res.text().catch(() => "");
    data = { raw: txt };
  }

  console.error("[newsletter] updateCustomer response", res.status, data);

  return { ok: res.ok, status: res.status, data };
}

export async function POST(req: NextRequest) {
  try {
    if (!STORE_DOMAIN || !ADMIN_TOKEN) {
      console.error("[newsletter] env mancanti", {
        STORE_DOMAIN: !!STORE_DOMAIN,
        ADMIN_TOKEN: !!ADMIN_TOKEN,
      });
      return NextResponse.json(
        { error: "Shopify non configurato (env mancanti)" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const emailRaw = body?.email;
    const email = String(emailRaw || "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Email non valida" },
        { status: 400 }
      );
    }

    // 1) Prova a creare il customer
    const created = await createCustomer(email);

    if (created.ok) {
      return NextResponse.json({ ok: true });
    }

    // Se è un 422 per email già esistente, aggiorniamo il consenso
    const rawErrors = created.data?.errors || created.data?.customer?.errors;
    const isDuplicate =
      created.status === 422 &&
      JSON.stringify(rawErrors || "").toLowerCase().includes("email");

    if (isDuplicate) {
      const existing = await findCustomerByEmail(email);
      if (existing?.id) {
        const updated = await updateCustomerMarketingConsent(existing.id);
        if (updated.ok) {
          return NextResponse.json({ ok: true });
        }
        return NextResponse.json(
          {
            error: "Errore aggiornando consenso marketing",
            shopifyStatus: updated.status,
            shopifyBody: updated.data,
          },
          { status: 500 }
        );
      }
    }

    // 🔍 QUI: ritorniamo tutti i dettagli dell’errore Shopify al client
    return NextResponse.json(
      {
        error: "Shopify error",
        shopifyStatus: created.status,
        shopifyBody: created.data,
      },
      { status: 500 }
    );
  } catch (err) {
    console.error("[newsletter] generic error", err);
    return NextResponse.json(
      {
        error: "Errore interno",
        details: String(err),
      },
      { status: 500 }
    );
  }
}
