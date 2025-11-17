// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { safeError } from "@/app/lib/safeLog";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_KEY) {
  // singolo argomento stringa => nessuna serializzazione “furba” dell’overlay
  console.error("Stripe misconfig: STRIPE_SECRET_KEY is missing");
}
const stripe = STRIPE_KEY
  ? new Stripe(STRIPE_KEY, { apiVersion: "2024-06-20" })
  : (null as unknown as Stripe);

type CartItem = { name: string; price: number; qty: number };

// Sanitizza stringhe e numeri
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const sanitizeName = (s: string) => s.replace(/\s+/g, " ").trim().slice(0, 80);

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe non configurato" }, { status: 500 });
    }

    const formData = await req.formData();
    const payload = formData.get("payload");
    const langRaw = (formData.get("lang") as string | null) || "it";
    const lang = (["it", "en", "es", "fr", "de"] as const).includes(langRaw as any) ? langRaw : "it";

    if (typeof payload !== "string" || !payload.length) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    // parse sicuro
    let cart: CartItem[] = [];
    try {
      const decoded = decodeURIComponent(payload);
      const parsed = JSON.parse(decoded);
      if (!Array.isArray(parsed)) throw new Error("Payload must be array");
      cart = parsed
        .map((i: any) => ({
          name: sanitizeName(String(i?.name ?? "Item")),
          price: Number(i?.price ?? 0),
          qty: clamp(Number(i?.qty ?? 1), 1, 99),
        }))
        .filter((i) => Number.isFinite(i.price) && i.price > 0 && i.qty > 0);
    } catch (e) {
      safeError("Invalid cart payload", e);
      return NextResponse.json({ error: "Payload non valido" }, { status: 400 });
    }

    if (cart.length === 0) {
      return NextResponse.json({ error: "Carrello vuoto" }, { status: 400 });
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.map((i) => ({
      price_data: {
        currency: "eur",
        product_data: { name: i.name },
        unit_amount: Math.round(i.price * 100),
      },
      quantity: i.qty,
      adjustable_quantity: { enabled: true, minimum: 1 },
    }));

    const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
    const success_url = `${base}/${lang}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${base}/${lang}/cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url,
      cancel_url,
      billing_address_collection: "auto",
      automatic_tax: { enabled: false },
      metadata: { brand: "Kilomistery", lang },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Impossibile creare sessione" }, { status: 500 });
    }

    // Redirect 303 verso Stripe
    return NextResponse.redirect(session.url, { status: 303 });
  } catch (err) {
    safeError("Checkout error", err);
    return NextResponse.json({ error: "Checkout error" }, { status: 500 });
  }
}