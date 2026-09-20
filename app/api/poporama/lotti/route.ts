import { requirePoporamaSession } from "@/app/lib/poporama-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SHOPIFY_API_VERSION = "2026-07";
const CURRENCY = "EUR";

const PERCENTUALI = [
  { name: "percentualeNuovo", key: "percentuale_nuovo", defaultValue: 60 },
  { name: "percentualeGradoA", key: "percentuale_grado_a", defaultValue: 50 },
  { name: "percentualeGradoB", key: "percentuale_grado_b", defaultValue: 30 },
  { name: "percentualeGradoC", key: "percentuale_grado_c", defaultValue: 20 },
  { name: "percentualeGradoN", key: "percentuale_grado_n", defaultValue: 30 },
] as const;

type PercentualiBody = Partial<
  Record<(typeof PERCENTUALI)[number]["name"], number | string>
>;

type LottoBody = PercentualiBody & {
  codiceLotto?: string;
  dataAcquisto?: string;
  fornitore?: string;
  provenienza?: string;
  numeroPezziDichiarato?: number | string;
  riferimentoAcquisto?: string;
  costoMerce?: number | string;
  costoTrasporto?: number | string;
  altriCosti?: number | string;
  note?: string;
};

//
// AUTENTICAZIONE SHOPIFY
//

async function getShopifyAccessToken() {
  const shop = process.env.SHOPIFY_SHOP;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!shop || !clientId || !clientSecret) {
    throw new Error(
      "Configurazione Shopify mancante nelle variabili ambiente"
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
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    console.error("Errore autenticazione Shopify:", data);
    throw new Error("Impossibile autenticarsi con Shopify");
  }

  return data.access_token as string;
}

//
// GET
// LEGGE TUTTI I LOTTI
//

export async function GET() {
  const unauthorized = await requirePoporamaSession();
  if (unauthorized) return unauthorized;
  try {
    const shop = process.env.SHOPIFY_SHOP;

    if (!shop) {
      return NextResponse.json(
        {
          ok: false,
          error: "SHOPIFY_SHOP mancante.",
        },
        { status: 500 }
      );
    }

    const accessToken = await getShopifyAccessToken();

    const query = `
      query PoporamaLotti($after: String) {
        metaobjects(
          type: "poporama_lotto"
          first: 250
          after: $after
        ) {
          nodes {
            id
            handle
            type
            createdAt
            updatedAt

            codiceLotto: field(key: "codice_lotto") {
              value
            }

            dataAcquisto: field(key: "data_acquisto") {
              value
            }

            fornitore: field(key: "fornitore") {
              value
            }

            provenienza: field(key: "provenienza") {
              value
            }

            numeroPezzi: field(
              key: "numero_pezzi_dichiarato"
            ) {
              value
            }

            riferimentoAcquisto: field(
              key: "riferimento_acquisto"
            ) {
              value
            }

            costoMerce: field(key: "costo_merce") {
              value
            }

            costoTrasporto: field(
              key: "costo_trasporto"
            ) {
              value
            }

            altriCosti: field(key: "altri_costi") {
              value
            }

            costoTotale: field(key: "costo_totale") {
              value
            }

            ${PERCENTUALI.map(({ name, key }) =>
              `${name}: field(key: "${key}") { value }`
            ).join("\n")}

            note: field(key: "note") {
              value
            }
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    `;

    const uniqueNodes = new Map<string, any>();
    const seenCursors = new Set<string>();
    let after: string | null = null;
    while (true) {
      const response: Response = await fetch(
        `https://${shop}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
          body: JSON.stringify({
            query,
            variables: { after },
          }),
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Errore HTTP Shopify:", data);

        return NextResponse.json(
          {
            ok: false,
            error: "Errore comunicazione con Shopify.",
            details: data,
          },
          { status: 502 }
        );
      }

      if (data.errors?.length) {
        console.error(
          "Errori GraphQL Shopify:",
          data.errors
        );

        return NextResponse.json(
          {
            ok: false,
            error: "Errore GraphQL Shopify.",
            details: data.errors,
          },
          { status: 500 }
        );
      }

      const connection = data.data?.metaobjects;
      if (!Array.isArray(connection?.nodes) || typeof connection?.pageInfo?.hasNextPage !== "boolean") {
        throw new Error("Risposta Shopify lotti incompleta.");
      }
      for (const node of connection.nodes) {
        if (!node?.id) throw new Error("Lotto Shopify senza identificativo.");
        uniqueNodes.set(node.id, node);
      }
      if (!connection.pageInfo.hasNextPage) break;
      const next = connection.pageInfo.endCursor;
      if (typeof next !== "string" || !next || seenCursors.has(next)) {
        throw new Error("Paginazione Shopify lotti non valida.");
      }
      seenCursors.add(next);
      after = next;
    }
    const nodes = [...uniqueNodes.values()];

    const lotti = nodes.map((node: any) => ({
      id: node.id,
      handle: node.handle,
      type: node.type,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,

      codiceLotto:
        node.codiceLotto?.value ?? "",

      dataAcquisto:
        node.dataAcquisto?.value ?? "",

      fornitore:
        node.fornitore?.value ?? "",

      provenienza:
        node.provenienza?.value ?? "",

      numeroPezzi:
        numberValue(node.numeroPezzi?.value),

      riferimentoAcquisto:
        node.riferimentoAcquisto?.value ?? "",

      costoMerce:
        moneyValue(node.costoMerce?.value),

      costoTrasporto:
        moneyValue(node.costoTrasporto?.value),

      altriCosti:
        moneyValue(node.altriCosti?.value),

      costoTotale:
        moneyValue(node.costoTotale?.value),

      percentualeNuovo: numberValue(node.percentualeNuovo?.value),
      percentualeGradoA: numberValue(node.percentualeGradoA?.value),
      percentualeGradoB: numberValue(node.percentualeGradoB?.value),
      percentualeGradoC: numberValue(node.percentualeGradoC?.value),
      percentualeGradoN: numberValue(node.percentualeGradoN?.value),

      note:
        node.note?.value ?? "",
    }));

    return NextResponse.json({
      ok: true,
      totale: lotti.length,
      lotti,
    });
  } catch (error) {
    console.error(
      "Errore lettura lotti POPORAMA:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Errore sconosciuto",
      },
      { status: 500 }
    );
  }
}

//
// POST
// CREA UN NUOVO LOTTO
//

export async function POST(request: NextRequest) {
  const unauthorized = await requirePoporamaSession();
  if (unauthorized) return unauthorized;
  try {
    const body =
      (await request.json()) as LottoBody;

    const percentualiFields = percentageFields(body, true);

    const codiceLotto =
      body.codiceLotto?.trim();

    const dataAcquisto =
      body.dataAcquisto?.trim();

    const fornitore =
      body.fornitore?.trim();

    const provenienza =
      body.provenienza?.trim();

    const riferimentoAcquisto =
      body.riferimentoAcquisto?.trim() || "";

    const note =
      body.note?.trim() || "";

    if (!codiceLotto) {
      return NextResponse.json(
        {
          ok: false,
          error: "Inserisci il codice lotto",
        },
        { status: 400 }
      );
    }

    if (!dataAcquisto) {
      return NextResponse.json(
        {
          ok: false,
          error: "Inserisci la data di acquisto",
        },
        { status: 400 }
      );
    }

    if (!fornitore) {
      return NextResponse.json(
        {
          ok: false,
          error: "Inserisci il fornitore",
        },
        { status: 400 }
      );
    }

    if (!provenienza) {
      return NextResponse.json(
        {
          ok: false,
          error: "Inserisci la provenienza",
        },
        { status: 400 }
      );
    }

    const numeroPezzi = Number(
      body.numeroPezziDichiarato ?? 0
    );

    if (
      !Number.isInteger(numeroPezzi) ||
      numeroPezzi < 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Numero pezzi dichiarato non valido",
        },
        { status: 400 }
      );
    }

    const costoMerce =
      parseMoney(body.costoMerce);

    const costoTrasporto =
      parseMoney(body.costoTrasporto);

    const altriCosti =
      parseMoney(body.altriCosti);

    const costoTotale =
      Math.round(
        (
          costoMerce +
          costoTrasporto +
          altriCosti
        ) * 100
      ) / 100;

    const accessToken =
      await getShopifyAccessToken();

    const shop =
      process.env.SHOPIFY_SHOP!;

    const mutation = `
      mutation CreatePoporamaLotto(
        $metaobject: MetaobjectCreateInput!
      ) {
        metaobjectCreate(
          metaobject: $metaobject
        ) {
          metaobject {
            id
            handle
            type
            displayName
            createdAt
            updatedAt

            fields {
              key
              value
            }
          }

          userErrors {
            field
            message
            code
          }
        }
      }
    `;

    const fields = [
      ...percentualiFields,
      {
        key: "codice_lotto",
        value: codiceLotto,
      },
      {
        key: "data_acquisto",
        value: dataAcquisto,
      },
      {
        key: "fornitore",
        value: fornitore,
      },
      {
        key: "provenienza",
        value: provenienza,
      },
      {
        key: "numero_pezzi_dichiarato",
        value: String(numeroPezzi),
      },
      {
        key: "riferimento_acquisto",
        value: riferimentoAcquisto,
      },
      {
        key: "costo_merce",
        value: moneyValueForShopify(costoMerce),
      },
      {
        key: "costo_trasporto",
        value: moneyValueForShopify(
          costoTrasporto
        ),
      },
      {
        key: "altri_costi",
        value: moneyValueForShopify(altriCosti),
      },
      {
        key: "costo_totale",
        value: moneyValueForShopify(costoTotale),
      },
      {
        key: "note",
        value: note,
      },
    ];

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
          query: mutation,
          variables: {
            metaobject: {
              type: "poporama_lotto",
              fields,
            },
          },
        }),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Errore HTTP Shopify:",
        data
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Errore comunicazione con Shopify",
        },
        { status: 502 }
      );
    }

    if (data.errors?.length) {
      console.error(
        "Errori GraphQL Shopify:",
        data.errors
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Errore GraphQL Shopify",
          details: data.errors,
        },
        { status: 500 }
      );
    }

    const result =
      data.data?.metaobjectCreate;

    if (result?.userErrors?.length) {
      console.error(
        "Errore creazione lotto:",
        result.userErrors
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Shopify non ha creato il lotto",
          details: result.userErrors,
        },
        { status: 400 }
      );
    }

    if (!result?.metaobject) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Shopify non ha restituito il lotto creato",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        "Lotto POPORAMA creato correttamente",
      lotto: result.metaobject,

      riepilogo: {
        codiceLotto,
        numeroPezzi,
        costoMerce,
        costoTrasporto,
        altriCosti,
        costoTotale,
      },
    });
  } catch (error) {
    if (error instanceof PercentageValidationError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    console.error(
      "Errore API POPORAMA lotti:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Errore sconosciuto",
      },
      { status: 500 }
    );
  }
}


//
// PATCH
// AGGIORNA PARZIALMENTE COSTI E PERCENTUALI DI UN LOTTO ESISTENTE
//
export async function PATCH(request: NextRequest) {
  const unauthorized = await requirePoporamaSession();
  if (unauthorized) return unauthorized;
  try {
    const body = (await request.json()) as PercentualiBody & {
      handle?: string;
      costoMerce?: number | string;
      costoTrasporto?: number | string;
      altriCosti?: number | string;
    };

    const handle = body.handle?.trim();

    if (!handle) {
      return NextResponse.json(
        {
          ok: false,
          error: "Handle lotto mancante.",
        },
        { status: 400 }
      );
    }

    const fields = percentageFields(body, false);
    const costFields = [
      { name: "costoMerce", key: "costo_merce" },
      { name: "costoTrasporto", key: "costo_trasporto" },
      { name: "altriCosti", key: "altri_costi" },
    ] as const;
    const suppliedCosts: Partial<Record<(typeof costFields)[number]["name"], number>> = {};

    for (const { name, key } of costFields) {
      if (body[name] !== undefined) {
        const value = parseMoney(body[name]);
        suppliedCosts[name] = value;
        fields.push({ key, value: moneyValueForShopify(value) });
      }
    }

    if (!fields.length) {
      return NextResponse.json(
        { ok: false, error: "Fornisci almeno un costo o una percentuale da aggiornare." },
        { status: 400 }
      );
    }

    const shop = process.env.SHOPIFY_SHOP;

    if (!shop) {
      return NextResponse.json(
        {
          ok: false,
          error: "SHOPIFY_SHOP mancante.",
        },
        { status: 500 }
      );
    }

    const accessToken =
      await getShopifyAccessToken();

    const endpoint =
      `https://${shop}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

    const findQuery = `
      query FindPoporamaLotto($handle: String!) {
        metaobjectByHandle(
          handle: {
            type: "poporama_lotto"
            handle: $handle
          }
        ) {
          id
          handle
          costoMerce: field(key: "costo_merce") { value }
          costoTrasporto: field(key: "costo_trasporto") { value }
          altriCosti: field(key: "altri_costi") { value }
        }
      }
    `;

    const findResponse = await fetch(
      endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token":
            accessToken,
        },
        body: JSON.stringify({
          query: findQuery,
          variables: {
            handle,
          },
        }),
        cache: "no-store",
      }
    );

    const findData =
      await findResponse.json();

    if (!findResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Errore comunicazione con Shopify.",
          details: findData,
        },
        { status: 502 }
      );
    }

    if (findData.errors?.length) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Errore GraphQL durante la ricerca del lotto.",
          details: findData.errors,
        },
        { status: 500 }
      );
    }

    const lotto =
      findData.data?.metaobjectByHandle;

    if (!lotto?.id) {
      return NextResponse.json(
        {
          ok: false,
          error: "Lotto non trovato.",
        },
        { status: 404 }
      );
    }

    const mutation = `
      mutation UpdatePoporamaLotto(
        $id: ID!
        $metaobject: MetaobjectUpdateInput!
      ) {
        metaobjectUpdate(
          id: $id
          metaobject: $metaobject
        ) {
          metaobject {
            id
            handle
            updatedAt
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `;

    // I costi omessi restano invariati; il totale cambia solo se cambia un costo.
    let costi: {
      costoMerce: number;
      costoTrasporto: number;
      altriCosti: number;
      costoTotale: number;
    } | undefined;

    if (Object.keys(suppliedCosts).length) {
      const costoMerce = suppliedCosts.costoMerce ?? moneyValue(lotto.costoMerce?.value);
      const costoTrasporto = suppliedCosts.costoTrasporto ?? moneyValue(lotto.costoTrasporto?.value);
      const altriCosti = suppliedCosts.altriCosti ?? moneyValue(lotto.altriCosti?.value);
      const costoTotale = Math.round((costoMerce + costoTrasporto + altriCosti) * 100) / 100;
      costi = { costoMerce, costoTrasporto, altriCosti, costoTotale };
      fields.push({ key: "costo_totale", value: moneyValueForShopify(costoTotale) });
    }

    const updateResponse = await fetch(
      endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token":
            accessToken,
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            id: lotto.id,
            metaobject: {
              fields,
            },
          },
        }),
        cache: "no-store",
      }
    );

    const updateData =
      await updateResponse.json();

    if (!updateResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Errore comunicazione con Shopify.",
          details: updateData,
        },
        { status: 502 }
      );
    }

    if (updateData.errors?.length) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Errore GraphQL durante l'aggiornamento del lotto.",
          details: updateData.errors,
        },
        { status: 500 }
      );
    }

    const result =
      updateData.data?.metaobjectUpdate;

    if (result?.userErrors?.length) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Shopify non ha aggiornato il lotto.",
          details: result.userErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        "Lotto aggiornato correttamente.",
      lotto: result?.metaobject,
      ...(costi ? { costi } : {}),
    });
  } catch (error) {
    if (error instanceof PercentageValidationError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    console.error(
      "Errore aggiornamento costi lotto POPORAMA:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Errore sconosciuto",
      },
      { status: 500 }
    );
  }
}

//
// FUNZIONI DI SUPPORTO
//

class PercentageValidationError extends Error {}

function percentageFields(body: PercentualiBody, useDefaults: boolean) {
  const fields: { key: string; value: string }[] = [];

  for (const { name, key, defaultValue } of PERCENTUALI) {
    const value = body[name];
    if (value === undefined && !useDefaults) continue;

    const percentage = value === undefined
      ? defaultValue
      : parsePercentage(value, name);
    // I campi Decimal ricevono il numero come stringa, senza oggetto Money.
    fields.push({ key, value: String(percentage) });
  }

  return fields;
}

function parsePercentage(value: unknown, name: string) {
  const normalized = typeof value === "string"
    ? value.trim().replace(",", ".")
    : String(value);
  const number = Number(normalized);

  if (
    (typeof value !== "number" && typeof value !== "string") ||
    !/^\d+(?:\.\d{1,2})?$/.test(normalized) ||
    !Number.isFinite(number) ||
    number < 0 ||
    number > 100
  ) {
    throw new PercentageValidationError(
      `${name}: inserisci un numero tra 0 e 100 con massimo 2 decimali.`
    );
  }

  return number;
}

function parseMoney(
  value: number | string | undefined
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return 0;
  }

  const normalized =
    typeof value === "string"
      ? value.replace(",", ".")
      : value;

  const number = Number(normalized);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    throw new Error("Importo non valido");
  }

  return Math.round(number * 100) / 100;
}

function moneyValueForShopify(amount: number) {
  return JSON.stringify({
    amount: amount.toFixed(2),
    currency_code: CURRENCY,
  });
}

function numberValue(
  value: string | undefined
) {
  if (!value) return 0;

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function moneyValue(
  value: string | undefined
) {
  if (!value) return 0;

  try {
    const parsed = JSON.parse(value);

    if (
      parsed &&
      typeof parsed === "object" &&
      "amount" in parsed
    ) {
      const amount = Number(parsed.amount);

      return Number.isFinite(amount)
        ? amount
        : 0;
    }
  } catch {
    // Non è JSON: proviamo come numero.
  }

  const amount = Number(value);

  return Number.isFinite(amount)
    ? amount
    : 0;
}
