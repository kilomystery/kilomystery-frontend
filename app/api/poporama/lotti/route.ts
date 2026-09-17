import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SHOPIFY_API_VERSION = "2026-07";
const CURRENCY = "EUR";

type LottoBody = {
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
      query PoporamaLotti {
        metaobjects(
          type: "poporama_lotto"
          first: 100
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

            note: field(key: "note") {
              value
            }
          }
        }
      }
    `;

    const response = await fetch(
      `https://${shop}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query,
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

    const nodes =
      data.data?.metaobjects?.nodes ?? [];

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
  try {
    const body =
      (await request.json()) as LottoBody;

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
// AGGIORNA I COSTI DI UN LOTTO ESISTENTE
//
export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as {
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

    const costoMerce = parseMoney(body.costoMerce);
    const costoTrasporto = parseMoney(body.costoTrasporto);
    const altriCosti = parseMoney(body.altriCosti);

    const costoTotale =
      Math.round(
        (
          costoMerce +
          costoTrasporto +
          altriCosti
        ) * 100
      ) / 100;

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

    const fields = [
      {
        key: "costo_merce",
        value:
          moneyValueForShopify(costoMerce),
      },
      {
        key: "costo_trasporto",
        value:
          moneyValueForShopify(
            costoTrasporto
          ),
      },
      {
        key: "altri_costi",
        value:
          moneyValueForShopify(altriCosti),
      },
      {
        key: "costo_totale",
        value:
          moneyValueForShopify(costoTotale),
      },
    ];

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
            "Shopify non ha aggiornato i costi del lotto.",
          details: result.userErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        "Costi lotto aggiornati correttamente.",
      lotto: result?.metaobject,
      costi: {
        costoMerce,
        costoTrasporto,
        altriCosti,
        costoTotale,
      },
    });
  } catch (error) {
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