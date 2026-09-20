import { requirePoporamaSession } from "@/app/lib/poporama-auth";
import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic = "force-dynamic";

const SHOPIFY_API_VERSION = "2026-07";
const CURRENCY = "EUR";

type ArticoloBody = {
  lottoId?: string;
  lottoHandle?: string;

  codicePP?: string;
  nomeProdotto?: string;

  asin?: string;
  ean?: string;
  upc?: string;
  fnsku?: string;
  lpn?: string;

  palletId?: string;
  condizioneOriginale?: string;

  categoria?: string;
  sottocategoria?: string;

  retail?: number | string;
  costoManifest?: number | string;

  grado?: string;
  percentualePrezzo?: number | string;
  prezzoPoporama?: number | string;

  numeroSeriale?: string;
};

type ShopifyField = {
  key: string;
  value: string | null;
};

type ShopifyMetaobject = {
  id: string;
  handle: string;
  type: string;
  displayName?: string | null;
  createdAt?: string;
  updatedAt?: string;
  fields: ShopifyField[];
};

type ShopifyMetaobjectEdge = {
  cursor: string;
  node: ShopifyMetaobject;
};

// ============================================================
// AUTENTICAZIONE SHOPIFY
// ============================================================

async function getShopifyAccessToken() {
  const shop = process.env.SHOPIFY_SHOP;
  const clientId =
    process.env.SHOPIFY_CLIENT_ID;
  const clientSecret =
    process.env.SHOPIFY_CLIENT_SECRET;

  if (
    !shop ||
    !clientId ||
    !clientSecret
  ) {
    throw new Error(
      "Configurazione Shopify mancante nelle variabili ambiente."
    );
  }

  const response = await fetch(
    `https://${shop}.myshopify.com/admin/oauth/access_token`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        grant_type:
          "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
      cache: "no-store",
    }
  );

  const data =
    await response.json();

  if (
    !response.ok ||
    !data.access_token
  ) {
    console.error(
      "Errore autenticazione Shopify:",
      data
    );

    throw new Error(
      "Impossibile autenticarsi con Shopify."
    );
  }

  return data.access_token as string;
}

// ============================================================
// CHIAMATA GRAPHQL SHOPIFY
// ============================================================

async function shopifyGraphQL(
  accessToken: string,
  query: string,
  variables: Record<string, unknown> = {}
) {
  const shop =
    process.env.SHOPIFY_SHOP;

  if (!shop) {
    throw new Error(
      "SHOPIFY_SHOP non configurato."
    );
  }

  const response = await fetch(
    `https://${shop}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
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

  const data =
    await response.json();

  if (!response.ok) {
    console.error(
      "Errore HTTP Shopify:",
      data
    );

    throw new Error(
      "Errore comunicazione con Shopify."
    );
  }

  if (data.errors?.length) {
    console.error(
      "Errori GraphQL Shopify:",
      data.errors
    );

    throw new Error(
      data.errors
        .map(
          (item: {
            message?: string;
          }) =>
            item.message ||
            "Errore GraphQL"
        )
        .join(" | ")
    );
  }

  return data;
}

// ============================================================
// GET
//
// /api/poporama/articoli
//
// restituisce:
// - totale articoli
// - ultimo PP
// - prossimo PP
//
// Esempio:
//
// /api/poporama/articoli?from=2&to=600
//
// verifica l'intervallo.
//
// Con:
//
// /api/poporama/articoli?from=2&to=600&details=1
//
// restituisce anche tutti i dati degli articoli.
// ============================================================

export async function GET(
  request: NextRequest
) {
  const unauthorized = await requirePoporamaSession();
  if (unauthorized) return unauthorized;
  try {
    const accessToken =
      await getShopifyAccessToken();

    const url =
      new URL(request.url);

    const fromParam =
      url.searchParams.get("from");

    const toParam =
      url.searchParams.get("to");

    const details =
      url.searchParams.get(
        "details"
      ) === "1";

    const from =
      fromParam !== null
        ? parsePositiveInteger(
            fromParam,
            "from"
          )
        : null;

    const to =
      toParam !== null
        ? parsePositiveInteger(
            toParam,
            "to"
          )
        : null;

    if (
      from !== null &&
      to !== null &&
      from > to
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Intervallo non valido: from è maggiore di to.",
        },
        { status: 400 }
      );
    }

    const articoli =
      await getAllArticoli(
        accessToken
      );

    // --------------------------------------------------------
    // NUMERI PP REALI
    //
    // Consideriamo soltanto codici nel formato:
    //
    // PP-000001
    // PP-000002
    // ...
    //
    // Quindi PP-TEST-000001 non entra nella sequenza.
    // --------------------------------------------------------

    const numeriPP =
      articoli
        .map((articolo) => {
          const codice =
            getFieldValue(
              articolo,
              "codice_pp"
            );

          return extractPPNumber(
            codice
          );
        })
        .filter(
          (
            value
          ): value is number =>
            value !== null
        )
        .sort(
          (a, b) => a - b
        );

    const ultimoNumeroPP =
      numeriPP.length > 0
        ? numeriPP[
            numeriPP.length - 1
          ]
        : 0;

    const prossimoNumeroPP =
      ultimoNumeroPP + 1;

    const prossimoCodicePP =
      formatPPCode(
        prossimoNumeroPP
      );

    // --------------------------------------------------------
    // NESSUN INTERVALLO RICHIESTO
    // --------------------------------------------------------

    if (
      from === null ||
      to === null
    ) {
      return NextResponse.json({
        ok: true,
        totaleArticoli:
          articoli.length,
        ultimoNumeroPP,
        prossimoNumeroPP,
        prossimoCodicePP,
        intervallo: null,
      });
    }

    // --------------------------------------------------------
    // CONTROLLO INTERVALLO
    // --------------------------------------------------------

    const numeriSet =
      new Set(numeriPP);

    const codiciEsistenti: string[] =
      [];

    const codiciMancanti: string[] =
      [];

    for (
      let numero = from;
      numero <= to;
      numero += 1
    ) {
      const codice =
        formatPPCode(numero);

      if (
        numeriSet.has(numero)
      ) {
        codiciEsistenti.push(
          codice
        );
      } else {
        codiciMancanti.push(
          codice
        );
      }
    }

    // --------------------------------------------------------
    // SENZA DETTAGLI
    // --------------------------------------------------------

    if (!details) {
      return NextResponse.json({
        ok: true,

        totaleArticoli:
          articoli.length,

        ultimoNumeroPP,
        prossimoNumeroPP,
        prossimoCodicePP,

        intervallo: {
          from,
          to,

          totaleEsistenti:
            codiciEsistenti.length,

          codiciEsistenti,

          totaleMancanti:
            codiciMancanti.length,

          codiciMancanti,
        },
      });
    }

    // --------------------------------------------------------
    // CON DETTAGLI PER ETICHETTE
    // --------------------------------------------------------

    const articoliIntervallo =
      articoli
        .map((articolo) =>
          normalizeArticolo(
            articolo
          )
        )
        .filter((articolo) => {
          const numero =
            extractPPNumber(
              articolo.codicePP
            );

          return (
            numero !== null &&
            numero >= from &&
            numero <= to
          );
        })
        .sort((a, b) => {
          const numeroA =
            extractPPNumber(
              a.codicePP
            ) || 0;

          const numeroB =
            extractPPNumber(
              b.codicePP
            ) || 0;

          return (
            numeroA -
            numeroB
          );
        });

    return NextResponse.json({
      ok: true,

      totaleArticoli:
        articoli.length,

      ultimoNumeroPP,
      prossimoNumeroPP,
      prossimoCodicePP,

      intervallo: {
        from,
        to,

        totaleEsistenti:
          codiciEsistenti.length,

        codiciEsistenti,

        totaleMancanti:
          codiciMancanti.length,

        codiciMancanti,
      },

      totaleDettagli:
        articoliIntervallo.length,

      articoli:
        articoliIntervallo,
    });
  } catch (error) {
    console.error(
      "Errore GET POPORAMA articoli:",
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

// ============================================================
// POST
//
// CREA UN ARTICOLO POPORAMA
// ============================================================

export async function POST(
  request: NextRequest
) {
  const unauthorized = await requirePoporamaSession();
  if (unauthorized) return unauthorized;
  try {
    const body =
      (await request.json()) as ArticoloBody;

    const codicePP =
      body.codicePP?.trim();

    const nomeProdotto =
      body.nomeProdotto?.trim() ||
      "";

    if (!codicePP) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Codice PP mancante.",
        },
        { status: 400 }
      );
    }

    const grado =
      (
        body.grado?.trim() ||
        "N"
      ).toUpperCase();

    if (
      ![
        "A",
        "B",
        "C",
        "D",
        "N",
      ].includes(grado)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Grado POPORAMA non valido.",
        },
        { status: 400 }
      );
    }

    const retail =
      parseMoney(
        body.retail
      );

    const costoManifest =
      parseMoney(
        body.costoManifest
      );

    const percentualePrezzo =
      parsePercentage(
        body.percentualePrezzo
      );

    const prezzoPoporama =
      body.prezzoPoporama ===
        undefined ||
      body.prezzoPoporama ===
        null ||
      body.prezzoPoporama ===
        ""
        ? roundMoney(
            retail *
              (
                percentualePrezzo /
                100
              )
          )
        : parseMoney(
            body.prezzoPoporama
          );

    const accessToken =
      await getShopifyAccessToken();

    // --------------------------------------------------------
    // LOTTO
    // --------------------------------------------------------

    let lottoId =
      body.lottoId?.trim() ||
      "";

    const lottoHandle =
      body.lottoHandle?.trim() ||
      "";

    if (
      !lottoId &&
      lottoHandle
    ) {
      lottoId =
        await findLottoIdByHandle(
          accessToken,
          lottoHandle
        );
    }

    if (!lottoId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Lotto POPORAMA non trovato.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------------
    // HANDLE ARTICOLO
    // --------------------------------------------------------

    const articoloHandle =
      createHandleFromPP(
        codicePP
      );

    // --------------------------------------------------------
    // CONTROLLO DUPLICATO
    //
    // È utile soprattutto per retry / recupero import.
    // --------------------------------------------------------

    const articoloEsistente =
      await findArticoloByHandle(
        accessToken,
        articoloHandle
      );

    if (articoloEsistente) {
      return NextResponse.json(
        {
          ok: false,
          error:
            `Il codice ${codicePP} esiste già in Shopify.`,
          duplicate: true,
          articolo:
            articoloEsistente,
        },
        { status: 409 }
      );
    }

    // --------------------------------------------------------
    // MUTATION
    // --------------------------------------------------------

    const mutation = `
      mutation CreatePoporamaArticolo(
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
        key: "codice_pp",
        value: codicePP,
      },

      {
        key: "lotto",
        value: lottoId,
      },

      {
        key: "nome_prodotto",
        value:
          nomeProdotto,
      },

      {
        key: "asin",
        value:
          body.asin?.trim() ||
          "",
      },

      {
        key: "ean",
        value:
          body.ean?.trim() ||
          "",
      },

      {
        key: "pallet_id",
        value:
          body.palletId?.trim() ||
          "",
      },

      {
        key:
          "condizione_originale",
        value:
          body.condizioneOriginale?.trim() ||
          "",
      },

      {
        key: "upc",
        value:
          body.upc?.trim() ||
          "",
      },

      {
        key: "fnsku",
        value:
          body.fnsku?.trim() ||
          "",
      },

      {
        key: "lpn",
        value:
          body.lpn?.trim() ||
          "",
      },

      {
        key: "categoria",
        value:
          body.categoria?.trim() ||
          "",
      },

      {
        key: "sottocategoria",
        value:
          body.sottocategoria?.trim() ||
          "",
      },

      {
        key: "retail",
        value:
          moneyValueForShopify(
            retail
          ),
      },

      {
        key: "costo_manifest",
        value:
          moneyValueForShopify(
            costoManifest
          ),
      },

      {
        key: "grado",
        value: grado,
      },

      {
        key:
          "percentuale_prezzo",
        value: String(
          percentualePrezzo
        ),
      },

      {
        key:
          "prezzo_poporama",
        value:
          moneyValueForShopify(
            prezzoPoporama
          ),
      },

      {
        key:
          "numero_seriale",
        value:
          body.numeroSeriale?.trim() ||
          "",
      },

      {
        key:
          "stato_vendita",
        value: "DISPONIBILE",
      },
    ];

    const data =
      await shopifyGraphQL(
        accessToken,
        mutation,
        {
          metaobject: {
            type:
              "poporama_articolo",

            handle:
              articoloHandle,

            fields,
          },
        }
      );

    const result =
      data.data
        ?.metaobjectCreate;

    if (
      result?.userErrors
        ?.length
    ) {
      console.error(
        "Errore creazione articolo:",
        result.userErrors
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Shopify non ha creato l'articolo.",
          details:
            result.userErrors,
        },
        { status: 400 }
      );
    }

    if (
      !result?.metaobject
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Shopify non ha restituito l'articolo creato.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,

      message:
        "Articolo POPORAMA creato correttamente.",

      articolo:
        result.metaobject,

      riepilogo: {
        codicePP,
        lottoId,
        lottoHandle,
        nomeProdotto,
        grado,
        retail,
        percentualePrezzo,
        prezzoPoporama,
      },
    });
  } catch (error) {
    console.error(
      "Errore POST POPORAMA articoli:",
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

// ============================================================
// RECUPERA TUTTI GLI ARTICOLI SHOPIFY
//
// Usa paginazione GraphQL.
// Quindi non siamo limitati ai primi 250 articoli.
// ============================================================

async function getAllArticoli(
  accessToken: string
) {
  const articoli: ShopifyMetaobject[] =
    [];

  let hasNextPage = true;

  let after:
    | string
    | null = null;

  const query = `
    query GetPoporamaArticoli(
      $first: Int!
      $after: String
    ) {
      metaobjects(
        type: "poporama_articolo"
        first: $first
        after: $after
      ) {
        edges {
          cursor

          node {
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
        }

        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  while (hasNextPage) {
    const data =
      await shopifyGraphQL(
        accessToken,
        query,
        {
          first: 250,
          after,
        }
      );

    const connection =
      data.data?.metaobjects;

    const edges:
      ShopifyMetaobjectEdge[] =
        connection?.edges ||
        [];

    for (
      const edge of edges
    ) {
      articoli.push(
        edge.node
      );
    }

    hasNextPage =
      Boolean(
        connection?.pageInfo
          ?.hasNextPage
      );

    after =
      connection?.pageInfo
        ?.endCursor ||
      null;

    if (
      hasNextPage &&
      !after
    ) {
      throw new Error(
        "Paginazione Shopify non valida."
      );
    }
  }

  return articoli;
}

// ============================================================
// TROVA LOTTO DA HANDLE
// ============================================================

async function findLottoIdByHandle(
  accessToken: string,
  handle: string
) {
  const query = `
    query GetPoporamaLotti(
      $first: Int!
      $after: String
    ) {
      metaobjects(
        type: "poporama_lotto"
        first: $first
        after: $after
      ) {
        edges {
          cursor

          node {
            id
            handle
            type
          }
        }

        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  let hasNextPage = true;

  let after:
    | string
    | null = null;

  while (hasNextPage) {
    const data =
      await shopifyGraphQL(
        accessToken,
        query,
        {
          first: 250,
          after,
        }
      );

    const connection =
      data.data?.metaobjects;

    const edges =
      connection?.edges ||
      [];

    for (
      const edge of edges
    ) {
      if (
        edge.node?.handle ===
        handle
      ) {
        return edge.node.id as string;
      }
    }

    hasNextPage =
      Boolean(
        connection?.pageInfo
          ?.hasNextPage
      );

    after =
      connection?.pageInfo
        ?.endCursor ||
      null;

    if (
      hasNextPage &&
      !after
    ) {
      break;
    }
  }

  return "";
}

// ============================================================
// TROVA ARTICOLO DA HANDLE
// ============================================================

async function findArticoloByHandle(
  accessToken: string,
  handle: string
) {
  const articoli =
    await getAllArticoli(
      accessToken
    );

  return (
    articoli.find(
      (articolo) =>
        articolo.handle ===
        handle
    ) || null
  );
}

// ============================================================
// NORMALIZZA ARTICOLO
//
// Questa è la struttura che useremo per le etichette.
// ============================================================

function normalizeArticolo(
  articolo: ShopifyMetaobject
) {
  return {
    id:
      articolo.id,

    handle:
      articolo.handle,

    codicePP:
      getFieldValue(
        articolo,
        "codice_pp"
      ),

    nomeProdotto:
      getFieldValue(
        articolo,
        "nome_prodotto"
      ),

    asin:
      getFieldValue(
        articolo,
        "asin"
      ),

    ean:
      getFieldValue(
        articolo,
        "ean"
      ),

    upc:
      getFieldValue(
        articolo,
        "upc"
      ),

    fnsku:
      getFieldValue(
        articolo,
        "fnsku"
      ),

    lpn:
      getFieldValue(
        articolo,
        "lpn"
      ),

    palletId:
      getFieldValue(
        articolo,
        "pallet_id"
      ),

    condizioneOriginale:
      getFieldValue(
        articolo,
        "condizione_originale"
      ),

    categoria:
      getFieldValue(
        articolo,
        "categoria"
      ),

    sottocategoria:
      getFieldValue(
        articolo,
        "sottocategoria"
      ),

    retail:
      parseShopifyMoney(
        getFieldValue(
          articolo,
          "retail"
        )
      ),

    costoManifest:
      parseShopifyMoney(
        getFieldValue(
          articolo,
          "costo_manifest"
        )
      ),

    grado:
      getFieldValue(
        articolo,
        "grado"
      ) || "N",

    percentualePrezzo:
      parseShopifyDecimal(
        getFieldValue(
          articolo,
          "percentuale_prezzo"
        )
      ),

    prezzoPoporama:
      parseShopifyMoney(
        getFieldValue(
          articolo,
          "prezzo_poporama"
        )
      ),

    condizioneEstetica:
      getFieldValue(
        articolo,
        "condizione_estetica"
      ),

    accessoriMancanti:
      getFieldValue(
        articolo,
        "accessori_mancanti"
      ),

    difettiDichiarati:
      getFieldValue(
        articolo,
        "difetti_dichiarati"
      ),

    noteTest:
      getFieldValue(
        articolo,
        "note_test"
      ),

    risultatiTest:
      getFieldValue(
        articolo,
        "risultati_test"
      ),

    testatoDa:
      getFieldValue(
        articolo,
        "testato_da"
      ),

    dataTest:
      getFieldValue(
        articolo,
        "data_test"
      ),

    statoVendita:
      getFieldValue(
        articolo,
        "stato_vendita"
      ),

    prezzoVendita:
      parseShopifyMoney(
        getFieldValue(
          articolo,
          "prezzo_vendita"
        )
      ),

    dataVendita:
      getFieldValue(
        articolo,
        "data_vendita"
      ),

    numeroSeriale:
      getFieldValue(
        articolo,
        "numero_seriale"
      ),

    createdAt:
      articolo.createdAt ||
      "",

    updatedAt:
      articolo.updatedAt ||
      "",
  };
}

// ============================================================
// FIELD HELPER
// ============================================================

function getFieldValue(
  articolo: ShopifyMetaobject,
  key: string
) {
  const field =
    articolo.fields?.find(
      (item) =>
        item.key === key
    );

  return (
    field?.value || ""
  );
}

// ============================================================
// PP
// ============================================================

function extractPPNumber(
  codice: string
) {
  const match =
    /^PP-(\d{6})$/i.exec(
      codice.trim()
    );

  if (!match) {
    return null;
  }

  const number =
    Number(match[1]);

  if (
    !Number.isInteger(
      number
    ) ||
    number < 1
  ) {
    return null;
  }

  return number;
}

function formatPPCode(
  number: number
) {
  return `PP-${String(
    number
  ).padStart(6, "0")}`;
}

function createHandleFromPP(
  codicePP: string
) {
  return codicePP
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9-]/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .replace(
      /^-|-$/g,
      ""
    );
}

// ============================================================
// MONEY
// ============================================================

function parseMoney(
  value:
    | number
    | string
    | undefined
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
      ? value
          .trim()
          .replace(",", ".")
      : value;

  const number =
    Number(normalized);

  if (
    !Number.isFinite(
      number
    ) ||
    number < 0
  ) {
    throw new Error(
      "Importo non valido."
    );
  }

  return roundMoney(
    number
  );
}

function parseShopifyMoney(
  value: string
) {
  if (!value) {
    return 0;
  }

  try {
    const parsed =
      JSON.parse(value);

    const amount =
      Number(
        parsed?.amount
      );

    if (
      Number.isFinite(
        amount
      )
    ) {
      return roundMoney(
        amount
      );
    }
  } catch {
    const amount =
      Number(
        value.replace(
          ",",
          "."
        )
      );

    if (
      Number.isFinite(
        amount
      )
    ) {
      return roundMoney(
        amount
      );
    }
  }

  return 0;
}

function moneyValueForShopify(
  amount: number
) {
  return JSON.stringify({
    amount:
      amount.toFixed(2),
    currency_code:
      CURRENCY,
  });
}

function roundMoney(
  value: number
) {
  return (
    Math.round(
      (
        value +
        Number.EPSILON
      ) * 100
    ) / 100
  );
}

// ============================================================
// PERCENTUALI
// ============================================================

function parsePercentage(
  value:
    | number
    | string
    | undefined
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
      ? value
          .trim()
          .replace(",", ".")
      : value;

  const number =
    Number(normalized);

  if (
    !Number.isFinite(
      number
    ) ||
    number < 0 ||
    number > 100
  ) {
    throw new Error(
      "Percentuale non valida."
    );
  }

  return number;
}

function parseShopifyDecimal(
  value: string
) {
  if (!value) {
    return 0;
  }

  const number =
    Number(
      value.replace(
        ",",
        "."
      )
    );

  if (
    !Number.isFinite(
      number
    )
  ) {
    return 0;
  }

  return number;
}

// ============================================================
// INTEGER QUERY PARAM
// ============================================================

function parsePositiveInteger(
  value: string,
  name: string
) {
  const number =
    Number(value);

  if (
    !Number.isInteger(
      number
    ) ||
    number < 1
  ) {
    throw new Error(
      `Parametro ${name} non valido.`
    );
  }

  return number;
}