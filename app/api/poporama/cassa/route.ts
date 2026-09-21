import { requirePoporamaSession } from "@/app/lib/poporama-auth";
import { NextRequest, NextResponse } from "next/server";
import { DELETE as logoutSession } from "@/app/api/poporama/session/route";
import { allocateCents, centsToDecimal, parseCents, sumCents } from "@/app/lib/poporama-cassa-pricing";

export const dynamic = "force-dynamic";

const SHOPIFY_API_VERSION = "2026-07";

type ShopifyTokenResponse = {
  access_token?: string;
  accessToken?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
};

// Questo lock protegge solo le richieste servite dalla stessa istanza.
// MetaobjectUpdateInput non offre compare-and-set: la rilettura finale rileva
// conflitti osservabili, ma non rende atomiche vendite tra istanze diverse.
const salesInProgress = new Set<string>();

let cachedAccessToken = "";
let cachedAccessTokenExpiresAt = 0;

async function getShopifyAccessToken() {
  const now = Date.now();

  if (
    cachedAccessToken &&
    cachedAccessTokenExpiresAt > now + 60_000
  ) {
    return cachedAccessToken;
  }

  const shop = process.env.SHOPIFY_SHOP;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!shop || !clientId || !clientSecret) {
    throw new Error(
      "Configurazione Shopify incompleta: SHOPIFY_SHOP, SHOPIFY_CLIENT_ID o SHOPIFY_CLIENT_SECRET mancanti."
    );
  }

  const response = await fetch(
    `https://${shop}.myshopify.com/admin/oauth/access_token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
      cache: "no-store",
    }
  );

  const data = (await response.json()) as ShopifyTokenResponse;

  if (!response.ok) {
    throw new Error(
      data.error_description ||
        data.error ||
        "Impossibile ottenere il token Shopify."
    );
  }

  const token = data.access_token || data.accessToken;

  if (!token) {
    throw new Error(
      "Shopify non ha restituito un access token."
    );
  }

  cachedAccessToken = token;
  cachedAccessTokenExpiresAt =
    now + Math.max(300, data.expires_in || 3600) * 1000;

  return token;
}

function normalizeCode(value: unknown) {
  const raw = String(value || "")
    .trim()
    .toUpperCase();

  const match = raw.match(/(?:^|[^A-Z0-9_-])(PP-\d{6,})(?=$|[^A-Z0-9_-])/);

  return match ? match[1] : "";
}

function handleFromCode(code: string) {
  return code.toLowerCase();
}

function moneyValue(value?: string | null) {
  if (!value) return 0;

  try {
    const parsed = JSON.parse(value);

    if (
      parsed &&
      typeof parsed === "object" &&
      "amount" in parsed
    ) {
      const amount = Number(parsed.amount);
      return Number.isFinite(amount) ? amount : 0;
    }
  } catch {
    // Shopify può restituire anche un valore numerico semplice.
  }

  const number = Number(
    String(value).replace(",", ".")
  );

  return Number.isFinite(number) ? number : 0;
}

function fieldValue(
  fields: Array<{
    key: string;
    value: string | null;
  }> | undefined,
  key: string
) {
  return (
    fields?.find((field) => field.key === key)
      ?.value || ""
  );
}

async function shopifyGraphql(
  query: string,
  variables: Record<string, unknown>
) {
  const shop = process.env.SHOPIFY_SHOP;

  if (!shop) {
    throw new Error("SHOPIFY_SHOP mancante.");
  }

  const accessToken =
    await getShopifyAccessToken();

  const response = await fetch(
    `https://${shop}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token":
          accessToken,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      "Errore di comunicazione con Shopify."
    );
  }

  if (data.errors?.length) {
    throw new Error(
      data.errors
        .map(
          (error: { message?: string }) =>
            error.message || "Errore GraphQL"
        )
        .join(" | ")
    );
  }

  return data;
}

async function loadArticle(code: string) {
  const query = `
    query PoporamaCassaArticolo(
      $handle: String!
    ) {
      metaobjectByHandle(
        handle: {
          type: "poporama_articolo"
          handle: $handle
        }
      ) {
        id
        handle
        fields {
          key
          value
          type
        }
        definition {
          fieldDefinitions { key type { name } }
        }
        lotto: field(key: "lotto") {
          reference {
            ... on Metaobject {
              handle
              codiceLotto: field(key: "codice_lotto") { value }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyGraphql(
    query,
    {
      handle: handleFromCode(code),
    }
  );

  const node =
    data.data?.metaobjectByHandle;

  if (!node?.id) {
    return null;
  }

  const fields = node.fields || [];

  return {
    id: node.id as string,
    handle: node.handle as string,
    codicePP:
      fieldValue(fields, "codice_pp") || code,
    lotto: node.lotto?.reference?.codiceLotto?.value ||
      node.lotto?.reference?.handle || fieldValue(fields, "lotto"),
    nomeProdotto:
      fieldValue(fields, "nome_prodotto"),
    ean: fieldValue(fields, "ean"),
    asin: fieldValue(fields, "asin"),
    grado:
      fieldValue(fields, "grado") || "N",
    retail:
      moneyValue(
        fieldValue(fields, "retail")
      ),
    percentualePrezzo:
      Number(
        fieldValue(
          fields,
          "percentuale_prezzo"
        ) || 0
      ),
    prezzoPoporama:
      moneyValue(
        fieldValue(
          fields,
          "prezzo_poporama"
        )
      ),
    statoVendita:
      fieldValue(
        fields,
        "stato_vendita"
      ).trim().toUpperCase(),
    prezzoVendita:
      moneyValue(
        fieldValue(
          fields,
          "prezzo_vendita"
        )
      ),
    prezzoVenditaCentesimi: shopifyMoneyCents(fieldValue(fields, "prezzo_vendita")),
    // La definizione resta disponibile anche se il valore non è ancora impostato.
    tipoDataVendita: node.definition?.fieldDefinitions?.find(
      (field: { key: string; type: { name: string } }) => field.key === "data_vendita"
    )?.type?.name || fields.find((field: { key: string; type?: string }) => field.key === "data_vendita")?.type || "date_time",
    dataVendita:
      fieldValue(
        fields,
        "data_vendita"
      ),
  };
}

// Shopify Money può restituire "50", "50.00" o "50.000" dentro JSON.
// Non trasformare valori mancanti/non validi in zero durante la verifica.
function shopifyMoneyCents(value: string): number | null {
  let amount: unknown = value;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      if (parsed.currency_code && parsed.currency_code !== "EUR") return null;
      amount = parsed.amount;
    } else amount = parsed;
  } catch { /* Valore numerico semplice. */ }
  if (typeof amount !== "number" && typeof amount !== "string") return null;
  const normalized = String(amount).trim().replace(",", ".");
  const canonical = normalized.includes(".") ? normalized.replace(/0+$/, "").replace(/\.$/, "") : normalized;
  return parseCents(canonical);
}

function saleDateMatches(actual: string, expected: string, type: string) {
  if (type === "date") return /^\d{4}-\d{2}-\d{2}$/.test(actual) && actual === expected.slice(0, 10);
  // DateTime: timezone equivalente e precisione al secondo; non accettare
  // una semplice data quando lo schema permette di conservare l'orario.
  if (!actual.includes("T") || !expected.includes("T")) return false;
  const a = Date.parse(actual);
  const b = Date.parse(expected);
  return Number.isFinite(a) && Number.isFinite(b) && Math.floor(a / 1000) === Math.floor(b / 1000);
}

const VERIFICATION_DELAYS_MS = [0, 200, 500, 1000] as const;
type CashArticle = NonNullable<Awaited<ReturnType<typeof loadArticle>>>;

async function verifyArticle(code: string, matches: (article: CashArticle) => boolean) {
  let last: CashArticle | null = null;
  let readError = "";
  for (const delay of VERIFICATION_DELAYS_MS) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    try {
      last = await loadArticle(code);
      readError = "";
      if (last && matches(last)) return { verified: last, last, readError };
    } catch (error) {
      readError = error instanceof Error ? error.message : "Lettura Shopify non riuscita.";
    }
  }
  return { verified: null, last, readError };
}

export async function GET(
  request: NextRequest
) {
  const unauthorized = await requirePoporamaSession();
  if (unauthorized) return unauthorized;
  try {
    const rawCode = request.nextUrl.searchParams.get("code");
    const code = normalizeCode(rawCode);

    if (rawCode !== null && !code) {
      return NextResponse.json({ ok: false, error: "Codice PP non valido." }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({
        ok: true,
        authenticated: true,
      });
    }

    const articolo =
      await loadArticle(code);

    if (!articolo) {
      return NextResponse.json(
        {
          ok: false,
          authenticated: true,
          error:
            "Articolo POPORAMA non trovato.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      authenticated: true,
      articolo,
    });
  } catch (error) {
    console.error(
      "Errore GET cassa POPORAMA:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Errore sconosciuto.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  const unauthorized = await requirePoporamaSession();
  if (unauthorized) return unauthorized;
  let lockedCodes: string[] = [];
  let report: { code: string; stato: "non_avviato" | "venduto" | "non_registrato" | "incerto";
    prezzoVendita: number; dataVendita?: string; errore?: string }[] = [];
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ ok: false, error: "Richiesta JSON non valida." }, { status: 400 });
    }
    const action = String(
      body?.action || ""
    ).toLowerCase();

    if (action === "cancelsale") {
      const code = typeof body.code === "string" ? normalizeCode(body.code) : "";
      const expectedCents = parseCents(body.prezzoVenditaAtteso);
      if (!code || expectedCents === null || typeof body.dataVenditaAttesa !== "string" ||
          Object.keys(body).some((key) => !["action", "code", "prezzoVenditaAtteso", "dataVenditaAttesa"].includes(key))) {
        return NextResponse.json({ ok: false, error: "Codice e dati della vendita da annullare non validi." }, { status: 400 });
      }
      if (salesInProgress.has(code)) {
        return NextResponse.json({ ok: false, error: `${code}: operazione già in corso. Aggiorna e riprova.` }, { status: 409 });
      }
      salesInProgress.add(code);
      lockedCodes = [code];
      const article = await loadArticle(code);
      if (!article) return NextResponse.json({ ok: false, error: "Articolo non trovato." }, { status: 404 });
      if (article.statoVendita !== "VENDUTO") {
        return NextResponse.json({ ok: false, error: `${code}: non risulta VENDUTO. Nessuna modifica eseguita.` }, { status: 409 });
      }
      const sameDate = article.dataVendita === body.dataVenditaAttesa ||
        saleDateMatches(article.dataVendita, body.dataVenditaAttesa, article.tipoDataVendita);
      if (article.prezzoVenditaCentesimi !== expectedCents || !sameDate) {
        return NextResponse.json({ ok: false, error: "La vendita è cambiata. Aggiorna il lotto e conferma nuovamente i dati." }, { status: 409 });
      }
      let mutationError = "";
      try {
        const update = await shopifyGraphql(`
          mutation PoporamaAnnullaVendita($id: ID!, $metaobject: MetaobjectUpdateInput!) {
            metaobjectUpdate(id: $id, metaobject: $metaobject) {
              metaobject { id }
              userErrors { field message code }
            }
          }
        `, {
          id: article.id,
          metaobject: { fields: [
            { key: "stato_vendita", value: "DISPONIBILE" },
            { key: "prezzo_vendita", value: JSON.stringify({ amount: "0.00", currency_code: "EUR" }) },
            // Campo Date opzionale nello schema attuale: stringa vuota per svuotarlo.
            { key: "data_vendita", value: "" },
          ] },
        });
        const result = update.data?.metaobjectUpdate;
        if (result?.userErrors?.length) {
          return NextResponse.json({ ok: false, error: result.userErrors.map((err: { message: string }) => err.message).join("; ") }, { status: 400 });
        }
        if (!result?.metaobject?.id) mutationError = "Shopify non ha confermato la mutation.";
      } catch (error) {
        mutationError = error instanceof Error ? error.message : "Risposta Shopify non ricevuta.";
      }
      const check = await verifyArticle(code, (current) => current.id === article.id &&
        current.statoVendita === "DISPONIBILE" && current.prezzoVenditaCentesimi === 0 && !current.dataVendita.trim());
      if (!check.verified) {
        return NextResponse.json({ ok: false, esitoIncerto: true,
          error: `${code}: annullamento non verificato. Aggiorna il lotto e verifica lo stato prima di riprovare.`,
          details: mutationError || check.readError || "Stato, prezzo o data non ancora coerenti.",
        }, { status: 502 });
      }
      return NextResponse.json({ ok: true, articolo: check.verified, message: `${code}: vendita annullata, articolo DISPONIBILE.` });
    }

    if (action !== "sell" && action !== "sellcart") {
      return NextResponse.json(
        {
          ok: false,
          error: "Azione non valida.",
        },
        { status: 400 }
      );
    }

    const legacy = action === "sell";
    const allowed = legacy ? ["action", "code", "prezzoVendita"] : ["action", "items", "totaleManuale"];
    if (Object.keys(body).some((key) => !allowed.includes(key))) {
      return NextResponse.json({ ok: false, error: "Campi della vendita non validi." }, { status: 400 });
    }
    const rawItems = legacy ? [{ code: body.code, prezzoVendita: body.prezzoVendita }] : body.items;
    const manual = !legacy && Object.hasOwn(body, "totaleManuale");
    const manualCents = manual ? parseCents(body.totaleManuale) : null;
    if (!Array.isArray(rawItems) || !rawItems.length || (manual && manualCents === null)) {
      return NextResponse.json({ ok: false, error: "Carrello vuoto o totale manuale non valido (minimo 0, massimo 2 decimali)." }, { status: 400 });
    }
    const items: { code: string; cents: number; expected: number | null }[] = [];
    for (const item of rawItems) {
      const code = typeof item?.code === "string" ? normalizeCode(item.code) : "";
      const cents = parseCents(item?.prezzoVendita);
      const expected = parseCents(item?.prezzoPoporamaAtteso);
      if (!item || typeof item !== "object" || Array.isArray(item) ||
          Object.keys(item).some((key) => !["code", "prezzoVendita", "prezzoPoporamaAtteso"].includes(key)) ||
          !code || cents === null || (manual && expected === null)) {
        return NextResponse.json({ ok: false, error: `${code || "Articolo"}: codice o prezzo non valido. Usa importi da 0 con massimo 2 decimali.` }, { status: 400 });
      }
      if (items.some((entry) => entry.code === code)) {
        return NextResponse.json({ ok: false, error: `${code}: ARTICOLO GIÀ PRESENTE NEL CARRELLO` }, { status: 400 });
      }
      items.push({ code, cents, expected });
    }
    // Acquisizione sincrona, tutti-o-nessuno: nessun await tra controllo e lock.
    const codes = items.map((item) => item.code).sort();
    const busyCode = codes.find((code) => salesInProgress.has(code));
    if (busyCode) {
      return NextResponse.json({ ok: false, error: `${busyCode}: vendita già in corso. Riprova dopo averne verificato lo stato.` }, { status: 409 });
    }
    codes.forEach((code) => salesInProgress.add(code));
    lockedCodes = codes;
    report = items.map((item) => ({ code: item.code, stato: "non_avviato", prezzoVendita: item.cents / 100 }));
    let legacyArticle: Awaited<ReturnType<typeof loadArticle>> = null;
    const fail = (error: string, status: number) => NextResponse.json({
      ok: false, error, report, ...(legacy ? { articolo: legacyArticle } : {}),
    }, { status });

    // Preflight completo: nessuna scrittura finché ogni PP non è disponibile.
    const articles: NonNullable<Awaited<ReturnType<typeof loadArticle>>>[] = [];
    const problems: string[] = [];
    for (const item of items) {
      const article = await loadArticle(item.code);
      if (legacy) legacyArticle = article;
      if (!article) problems.push(`${item.code}: articolo non trovato`);
      else {
        articles.push(article);
        if (article.statoVendita !== "DISPONIBILE") {
          problems.push(`${item.code}: ${article.statoVendita === "VENDUTO" ? "ARTICOLO GIÀ VENDUTO" : "articolo non disponibile"}`);
        }
        if (manual && parseCents(article.prezzoPoporama) !== item.expected) {
          problems.push(`${item.code}: prezzo POPORAMA cambiato. Rimuovi e aggiungi nuovamente l'articolo per rivedere la ripartizione`);
        }
      }
    }
    if (problems.length) return fail(`IMPOSSIBILE COMPLETARE LA VENDITA. ${problems.join(". ")}. Rimuovi gli articoli indicati e riprova.`, articles.length !== items.length ? 404 : 409);

    const shares = manual
      ? allocateCents(manualCents!, items.map((item, i) => ({ code: item.code, weight: parseCents(articles[i].prezzoPoporama)! })))
      : items.map((item) => item.cents);
    let total: number;
    try { total = sumCents(shares); }
    catch { return fail("Totale troppo elevato.", 400); }
    report.forEach((entry, i) => { entry.prezzoVendita = shares[i] / 100; });
    const dataVendita = new Date(Math.floor(Date.now() / 1000) * 1000).toISOString();
    const mutation = `
      mutation PoporamaVendiArticolo($id: ID!, $metaobject: MetaobjectUpdateInput!) {
        metaobjectUpdate(id: $id, metaobject: $metaobject) {
          metaobject { id handle updatedAt }
          userErrors { field message code }
        }
      }
    `;
    const verifiedArticles: NonNullable<Awaited<ReturnType<typeof loadArticle>>>[] = [];
    // Update sequenziali e verificati. Nessun rollback: Shopify non offre una
    // transazione multi-metaobject né un compare-and-set tra istanze serverless.
    for (let i = 0; i < items.length; i++) {
      const { code } = items[i];
      const entry = report[i];
      let attempted = false;
      let verification: Awaited<ReturnType<typeof verifyArticle>> | null = null;
      const matches = (article: CashArticle) =>
        article.id === articles[i].id && article.statoVendita === "VENDUTO" &&
        article.prezzoVenditaCentesimi === shares[i] &&
        saleDateMatches(article.dataVendita, dataVendita, articles[i].tipoDataVendita);
      try {
        const current = await loadArticle(code);
        if (!current || current.id !== articles[i].id || current.statoVendita !== "DISPONIBILE" ||
            (manual && parseCents(current.prezzoPoporama) !== items[i].expected)) {
          entry.errore = "Disponibilità o prezzo cambiati prima dell'aggiornamento.";
          return fail(`${code}: ${entry.errore} Vendita interrotta; verifica il riepilogo.`, 409);
        }
        attempted = true;
        entry.stato = "incerto";
        entry.dataVendita = dataVendita;
        const update = await shopifyGraphql(mutation, {
          id: current.id,
          metaobject: { fields: [
            { key: "stato_vendita", value: "VENDUTO" },
            { key: "prezzo_vendita", value: JSON.stringify({ amount: centsToDecimal(shares[i]), currency_code: "EUR" }) },
            { key: "data_vendita", value: current.tipoDataVendita === "date" ? dataVendita.slice(0, 10) : dataVendita },
          ] },
        });
        const result = update.data?.metaobjectUpdate;
        if (result?.userErrors?.length) {
          entry.stato = "non_registrato";
          entry.errore = result.userErrors.map((err: { message: string }) => err.message).join("; ");
          return fail(`${code}: Shopify ha rifiutato la vendita. ${entry.errore}. Verifica il riepilogo.`, 400);
        }
        if (!result?.metaobject?.id) throw new Error("Aggiornamento non confermato da Shopify.");
        verification = await verifyArticle(code, matches);
        if (!verification.verified) {
          const last = verification.last;
          throw new Error(verification.readError || `Verifica esaurita: stato=${last?.statoVendita || "assente"}, centesimi=${last?.prezzoVenditaCentesimi ?? "non validi"}, data=${last?.dataVendita || "assente"}; attesi VENDUTO, ${shares[i]}, ${dataVendita} (${articles[i].tipoDataVendita}).`);
        }
        entry.stato = "venduto";
        entry.dataVendita = verification.verified.dataVendita;
        verifiedArticles.push(verification.verified);
      } catch (error) {
        entry.errore = error instanceof Error ? error.message : "Errore Shopify.";
        if (attempted && !verification) verification = await verifyArticle(code, matches);
        if (verification?.verified) {
          // Anche una risposta mutation persa può essere confermata dalle letture:
          // prosegui col prossimo PP, senza ripetere l'update già riuscito.
          entry.stato = "venduto";
          entry.dataVendita = verification.verified.dataVendita;
          delete entry.errore;
          verifiedArticles.push(verification.verified);
          continue;
        }
        return fail(`${code}: vendita interrotta. Controlla gli articoli registrati e quelli con esito incerto prima di procedere.`, 502);
      }
    }
    return NextResponse.json({
      ok: true,
      report,
      vendita: { numeroArticoli: items.length, totale: total / 100, dataVendita,
        ...(legacy ? { codicePP: items[0].code, prezzoVendita: shares[0] / 100, statoVendita: "VENDUTO" } : {}) },
      ...(legacy ? { articolo: verifiedArticles[0] } : {}),
    });
  } catch (error) {
    console.error(
      "Errore POST cassa POPORAMA:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Errore sconosciuto.",
        report,
      },
      { status: 500 }
    );
  } finally {
    lockedCodes.forEach((code) => salesInProgress.delete(code));
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requirePoporamaSession();
  if (unauthorized) return unauthorized;
  return logoutSession(request);
}
