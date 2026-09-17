import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic = "force-dynamic";

const SHOPIFY_API_VERSION = "2026-07";

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

type RouteContext = {
  params: {
    handle: string;
  };
};

// ============================================================
// GET
//
// /api/poporama/lotti/[handle]/articoli
//
// Restituisce esclusivamente gli articoli appartenenti
// allo specifico lotto POPORAMA.
//
// Esempio:
//
// /api/poporama/lotti/test-poporama-01/articoli
//
// Questa API è separata dalla API generale degli articoli
// per non modificare il flusso già funzionante di:
//
// - import manifest
// - numerazione PP
// - controllo intervalli
// - generazione etichette
// ============================================================

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const handle =
      decodeURIComponent(
        context.params.handle || ""
      ).trim();

    if (!handle) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Handle del lotto mancante.",
        },
        {
          status: 400,
        }
      );
    }

    const accessToken =
      await getShopifyAccessToken();

    // --------------------------------------------------------
    // 1. TROVA IL LOTTO SHOPIFY
    // --------------------------------------------------------

    const lotto =
      await findLottoByHandle(
        accessToken,
        handle
      );

    if (!lotto) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Lotto POPORAMA non trovato.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------------
    // 2. RECUPERA TUTTI GLI ARTICOLI POPORAMA
    // --------------------------------------------------------

    const tuttiArticoli =
      await getAllArticoli(
        accessToken
      );

    // --------------------------------------------------------
    // 3. FILTRA SOLO GLI ARTICOLI DEL LOTTO
    //
    // Il campo Shopify "lotto" contiene il GID del
    // metaobject POPORAMA Lotto.
    // --------------------------------------------------------

    const articoliDelLotto =
      tuttiArticoli
        .filter((articolo) => {
          const lottoId =
            getFieldValue(
              articolo,
              "lotto"
            );

          return (
            lottoId === lotto.id
          );
        })
        .map((articolo) =>
          normalizeArticolo(
            articolo
          )
        )
        .sort((a, b) => {
          const numeroA =
            extractPPNumber(
              a.codicePP
            );

          const numeroB =
            extractPPNumber(
              b.codicePP
            );

          if (
            numeroA !== null &&
            numeroB !== null
          ) {
            return (
              numeroA -
              numeroB
            );
          }

          return a.codicePP.localeCompare(
            b.codicePP
          );
        });

    // --------------------------------------------------------
    // 4. STATISTICHE OPERATIVE
    // --------------------------------------------------------

    const totale =
      articoliDelLotto.length;

    const gradoN =
      articoliDelLotto.filter(
        (articolo) =>
          normalizeGrade(
            articolo.grado
          ) === "N"
      ).length;

    const gradoA =
      articoliDelLotto.filter(
        (articolo) =>
          normalizeGrade(
            articolo.grado
          ) === "A"
      ).length;

    const gradoB =
      articoliDelLotto.filter(
        (articolo) =>
          normalizeGrade(
            articolo.grado
          ) === "B"
      ).length;

    const gradoC =
      articoliDelLotto.filter(
        (articolo) =>
          normalizeGrade(
            articolo.grado
          ) === "C"
      ).length;

    const gradoD =
      articoliDelLotto.filter(
        (articolo) =>
          normalizeGrade(
            articolo.grado
          ) === "D"
      ).length;

    const testati =
      gradoA +
      gradoB +
      gradoC +
      gradoD;

    const nonTestati =
      gradoN;

    const venduti =
      articoliDelLotto.filter(
        (articolo) =>
          normalizeSaleStatus(
            articolo.statoVendita
          ) === "VENDUTO"
      ).length;

    const disponibili =
      articoliDelLotto.filter(
        (articolo) =>
          normalizeSaleStatus(
            articolo.statoVendita
          ) !== "VENDUTO"
      ).length;

    // --------------------------------------------------------
    // 5. RISPOSTA
    // --------------------------------------------------------

    return NextResponse.json({
      ok: true,

      lotto: {
        id: lotto.id,
        handle: lotto.handle,
        codiceLotto:
          getFieldValue(
            lotto,
            "codice_lotto"
          ),
      },

      totale,

      statistiche: {
        totale,
        testati,
        nonTestati,
        disponibili,
        venduti,

        gradi: {
          A: gradoA,
          B: gradoB,
          C: gradoC,
          D: gradoD,
          N: gradoN,
        },
      },

      articoli:
        articoliDelLotto,
    });
  } catch (error) {
    console.error(
      "Errore GET articoli lotto POPORAMA:",
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
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// AUTENTICAZIONE SHOPIFY
// ============================================================

async function getShopifyAccessToken() {
  const shop =
    process.env.SHOPIFY_SHOP;

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

        client_id:
          clientId,

        client_secret:
          clientSecret,
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
// GRAPHQL SHOPIFY
// ============================================================

async function shopifyGraphQL(
  accessToken: string,
  query: string,
  variables: Record<
    string,
    unknown
  > = {}
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
// TROVA LOTTO DA HANDLE
// ============================================================

async function findLottoByHandle(
  accessToken: string,
  handle: string
): Promise<ShopifyMetaobject | null> {
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

    const edges:
      ShopifyMetaobjectEdge[] =
        connection?.edges || [];

    for (
      const edge of edges
    ) {
      if (
        edge.node.handle ===
        handle
      ) {
        return edge.node;
      }
    }

    hasNextPage =
      Boolean(
        connection?.pageInfo
          ?.hasNextPage
      );

    after =
      connection?.pageInfo
        ?.endCursor || null;

    if (
      hasNextPage &&
      !after
    ) {
      throw new Error(
        "Paginazione Shopify lotti non valida."
      );
    }
  }

  return null;
}

// ============================================================
// RECUPERA TUTTI GLI ARTICOLI
//
// Manteniamo la paginazione a 250.
// Quindi funzionerà anche quando POPORAMA avrà
// migliaia di articoli distribuiti su più lotti.
// ============================================================

async function getAllArticoli(
  accessToken: string
) {
  const articoli:
    ShopifyMetaobject[] = [];

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
        connection?.edges || [];

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
        ?.endCursor || null;

    if (
      hasNextPage &&
      !after
    ) {
      throw new Error(
        "Paginazione Shopify articoli non valida."
      );
    }
  }

  return articoli;
}

// ============================================================
// NORMALIZZAZIONE ARTICOLO
//
// Manteniamo gli stessi nomi utilizzati dalla API
// articoli generale, così la UI potrà riutilizzare
// la stessa struttura anche per le etichette.
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

    lottoId:
      getFieldValue(
        articolo,
        "lotto"
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
      normalizeGrade(
        getFieldValue(
          articolo,
          "grado"
        )
      ),

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
      normalizeSaleStatus(
        getFieldValue(
          articolo,
          "stato_vendita"
        )
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
      articolo.createdAt || "",

    updatedAt:
      articolo.updatedAt || "",
  };
}

// ============================================================
// FIELD HELPER
// ============================================================

function getFieldValue(
  metaobject: ShopifyMetaobject,
  key: string
) {
  const field =
    metaobject.fields?.find(
      (item) =>
        item.key === key
    );

  return field?.value || "";
}

// ============================================================
// GRADO
// ============================================================

function normalizeGrade(
  value: string
) {
  const grade =
    String(value || "")
      .trim()
      .toUpperCase();

  if (
    grade === "A" ||
    grade === "B" ||
    grade === "C" ||
    grade === "D" ||
    grade === "N"
  ) {
    return grade;
  }

  return "N";
}

// ============================================================
// STATO VENDITA
// ============================================================

function normalizeSaleStatus(
  value: string
) {
  const status =
    String(value || "")
      .trim()
      .toUpperCase();

  if (
    status === "VENDUTO"
  ) {
    return "VENDUTO";
  }

  return "DISPONIBILE";
}

// ============================================================
// NUMERO PP
// ============================================================

function extractPPNumber(
  codice: string
) {
  const match =
    /^PP-(\d{6})$/i.exec(
      String(
        codice || ""
      ).trim()
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

// ============================================================
// MONEY SHOPIFY
// ============================================================

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

// ============================================================
// DECIMAL SHOPIFY
// ============================================================

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
// ROUND MONEY
// ============================================================

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