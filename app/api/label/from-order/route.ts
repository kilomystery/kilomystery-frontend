import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Mode = "items" | "order";

function qp(url: URL, key: string) {
  return (url.searchParams.get(key) ?? "").trim();
}

function yyyymmdd(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

// es: "PRM-5KG" / "STD-10KG" / "EXP-15KG" / "UP-PRM-1KG"
function parseSku(sku: string) {
  const clean = (sku || "").toUpperCase().replace(/\s+/g, "");
  const kgMatch = clean.match(/(\d+)\s*KG/);
  const kg = kgMatch ? `${kgMatch[1]} KG` : "";

  // tipo base per lotto (PRM-5KG ecc)
  // se SKU è "UP-PRM-1KG" -> base = "UP-PRM-1KG"
  // se SKU è "PRM-5KG" -> base = "PRM-5KG"
  const base = clean;

  return { base, kg };
}

async function shopifyGql<T>(query: string, variables: Record<string, any>) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || "2024-10";

  if (!domain || !token) {
    throw new Error("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_ACCESS_TOKEN env vars");
  }

  const res = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok) throw new Error(`Shopify HTTP ${res.status}: ${JSON.stringify(json)}`);
  if (json.errors) throw new Error(`Shopify GQL errors: ${JSON.stringify(json.errors)}`);
  return json.data as T;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const orderNumberRaw = qp(url, "order"); // puoi passare "1234" o "#1234"
    const lang = qp(url, "lang") || "it";
    const mode = (qp(url, "mode") as Mode) || "items";
    const packages = Math.max(1, parseInt(qp(url, "packages") || "1", 10));
    const warehouse = qp(url, "warehouse") || "Brindisi (BR)";

    if (!orderNumberRaw) {
      return NextResponse.json({ error: "Missing query param: order" }, { status: 400 });
    }

    const orderName = orderNumberRaw.startsWith("#") ? orderNumberRaw : `#${orderNumberRaw}`;

    const QUERY = /* GraphQL */ `
      query GetOrder($q: String!) {
        orders(first: 1, query: $q) {
          edges {
            node {
              id
              name
              createdAt
              lineItems(first: 50) {
                edges {
                  node {
                    title
                    quantity
                    sku
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await shopifyGql<{
      orders: { edges: Array<{ node: any }> };
    }>(QUERY, { q: `name:${orderName}` });

    const order = data.orders.edges[0]?.node;
    if (!order) {
      return NextResponse.json({ error: `Order not found: ${orderName}` }, { status: 404 });
    }

    // data etichetta: oggi (semplice). Se vuoi la data ordine: new Date(order.createdAt)
    const today = yyyymmdd(new Date());
    const dateHuman = new Date().toLocaleDateString("it-IT"); // 29/01/2026 ecc

    const orderNum = order.name.replace("#", "");
    const items = order.lineItems.edges.map((e: any) => e.node);

    // ✅ Se vuoi ignorare gli upsell 1kg, puoi filtrare qui (OPZIONALE)
    // const filtered = items.filter((it: any) => !String(it.sku || "").toUpperCase().startsWith("UP-"));
    const filtered = items;

    // Helper per costruire URL PDF già pronto
    const makePdfUrl = (payload: {
      id: string;
      product: string;
      weightKg: string;
      date: string;
      warehouse: string;
      lang: string;
    }) => {
      const u = new URL("https://www.kilomystery.com/api/label");
      u.searchParams.set("id", payload.id);
      u.searchParams.set("product", payload.product);
      u.searchParams.set("weightKg", payload.weightKg);
      u.searchParams.set("date", payload.date);
      u.searchParams.set("warehouse", payload.warehouse);
      u.searchParams.set("lang", payload.lang);
      return u.toString();
    };

    const labels: Array<{
      lotId: string;
      pdfUrl: string;
      product: string;
      weightKg: string;
    }> = [];

    // =========================
    // MODE "items": 1 label per line item (o per qty)
    // MODE "order": 1 label per ordine (o per colli)
    // =========================

    let seq = 1;

    if (mode === "order") {
      // Riassunto prodotti
      const summary = filtered
        .map((it: any) => {
          const sku = String(it.sku || "").trim();
          const { base, kg } = parseSku(sku);
          const title = String(it.title || "Item");
          const qty = Number(it.quantity || 1);
          return `${qty}× ${title}${base ? ` (${base})` : ""}${kg ? ` - ${kg}` : ""}`;
        })
        .join(" | ");

      for (let p = 1; p <= packages; p++) {
        const lotId = `KM-${today}-ORDER-${orderNum}-${String(p).padStart(2, "0")}`;
        labels.push({
          lotId,
          product: `Order ${orderName}`,
          weightKg: `${packages} package(s)`,
          pdfUrl: makePdfUrl({
            id: lotId,
            product: summary || `Order ${orderName}`,
            weightKg: `${packages} package(s)`,
            date: dateHuman,
            warehouse,
            lang,
          }),
        });
      }
    } else {
      // items
      for (const it of filtered) {
        const title = String(it.title || "Item");
        const sku = String(it.sku || "").trim();
        const qty = Math.max(1, Number(it.quantity || 1));

        const { base, kg } = parseSku(sku);

        // 1 etichetta per quantità (se qty>1)
        for (let i = 1; i <= qty; i++) {
          const lotCore = base || "ITEM";
          const lotId = `KM-${today}-${lotCore}-${orderNum}-${String(seq).padStart(2, "0")}`;
          seq++;

          labels.push({
            lotId,
            product: title,
            weightKg: kg || "",
            pdfUrl: makePdfUrl({
              id: lotId,
              product: title,
              weightKg: kg || "",
              date: dateHuman,
              warehouse,
              lang,
            }),
          });
        }
      }
    }

    return NextResponse.json(
      {
        orderName,
        mode,
        packages,
        warehouse,
        count: labels.length,
        labels,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to generate labels from order", details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
