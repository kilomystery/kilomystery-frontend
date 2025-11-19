import { NextRequest, NextResponse } from "next/server";

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

if (!STORE_DOMAIN || !ADMIN_TOKEN) {
  console.warn(
    "[newsletter] Manca SHOPIFY_STORE_DOMAIN o SHOPIFY_ADMIN_API_ACCESS_TOKEN nelle env"
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Crea un customer con consenso marketing.
 */
async function createCustomer(email: string) {
  const url = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/customers.json`;

  const body = {
    customer: {
      email,
      // Nuovo sistema di consensi marketing
      email_marketing_consent: {
        state: "subscribed",          // subscribed | not_subscribed | unsubscribed
        opt_in_level: "single_opt_in", // o confirmed_opt_in se usi double opt-in
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

  const data = await res.json().catch(() => ({}));

  // Se l'email esiste già, Shopify di solito risponde 422 con errore "Email has already been taken"
  if (!res.ok) {
    return { ok: false, status: res.status, data };
  }

  return { ok: true, status: res.status, data };
}

/**
 * Cerca un customer per email
 */
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

  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  if (!data || !Array.isArray(data.customers) || data.customers.length === 0)
    return null;

  return data.customers[0]; // prendiamo il primo match
}

/**
 * Aggiorna consenso marketing per un customer esistente
 */
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

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { ok: false, status: res.status, data };
  }

  return { ok: true, status: res.status, data };
}

/**
 * Handler POST /api/subscribe
 */
export async function POST(req: NextRequest) {
  try {
    if (!STORE_DOMAIN || !ADMIN_TOKEN) {
      return NextResponse.json(
        { error: "Shopify non configurato (env mancanti)" },
        { status: 500 }
      );
    }

    const { email } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Email non valida" },
        { status: 400 }
      );
    }

    // 1. Proviamo a creare il customer
    const created = await createCustomer(normalizedEmail);

    if (created.ok) {
      return NextResponse.json({ ok: true });
    }

    // Se l'errore è "email già esistente", cerchiamo e aggiorniamo consenso
    const errors = created.data?.errors || created.data?.customer?.errors;
    const isDuplicate =
      created.status === 422 &&
      JSON.stringify(errors || "").toLowerCase().includes("email");

    if (isDuplicate) {
      const existing = await findCustomerByEmail(normalizedEmail);
      if (existing?.id) {
        const updated = await updateCustomerMarketingConsent(existing.id);
        if (updated.ok) {
          return NextResponse.json({ ok: true });
        }
      }
    }

    console.error("[newsletter] Shopify error", created);
    return NextResponse.json(
      { error: "Impossibile iscrivere alla newsletter" },
      { status: 500 }
    );
  } catch (err) {
    console.error("[newsletter] generic error", err);
    return NextResponse.json(
      { error: "Errore interno" },
      { status: 500 }
    );
  }
}
