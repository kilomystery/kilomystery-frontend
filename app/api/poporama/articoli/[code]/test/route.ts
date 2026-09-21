import { requirePoporamaSession } from "@/app/lib/poporama-auth";
import { calculateTestPrice, parseTestPercentage } from "@/app/lib/poporama-test-pricing";
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
    code: string;
  };
};

type Grade = "NEW" | "A" | "B" | "C" | "N";

const LOTTO_PERCENTAGE_FIELDS: Record<Grade, string> = {
  NEW: "percentuale_nuovo",
  A: "percentuale_grado_a",
  B: "percentuale_grado_b",
  C: "percentuale_grado_c",
  N: "percentuale_grado_n",
};

class PricingError extends Error {}

type TestPayload = {
  grado?: string;
  percentualePrezzo?: number | string;

  condizioneEstetica?: string;
  accessoriMancanti?: string;
  difettiDichiarati?: string;
  noteTest?: string;

  risultatiTest?: unknown;

  testatoDa?: string;
  dataTest?: string;

  numeroSeriale?: string;
};

/*
 * ============================================================
 * GET
 *
 * /api/poporama/articoli/PP-000002/test
 *
 * Recupera il singolo articolo POPORAMA.
 * ============================================================
 */

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const unauthorized = await requirePoporamaSession();
  if (unauthorized) return unauthorized;
  try {
    const codicePP =
      normalizePPCode(
        context.params.code
      );

    if (!codicePP) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Codice PP non valido.",
        },
        {
          status: 400,
        }
      );
    }

    const accessToken =
      await getShopifyAccessToken();

    const articolo =
      await findArticoloByPP(
        accessToken,
        codicePP
      );

    if (!articolo) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Articolo POPORAMA non trovato.",
        },
        {
          status: 404,
        }
      );
    }

    let listino: Record<Grade, number | null> | null = null;
    let erroreListino = "";
    try {
      listino = await getLottoListino(accessToken, articolo);
      getRetailForPricing(articolo);
    } catch (error) {
      if (!(error instanceof PricingError)) throw error;
      erroreListino = error.message;
    }

    return NextResponse.json({
      ok: true,
      listino,
      erroreListino,
      articolo:
        normalizeArticolo(
          articolo
        ),
    });
  } catch (error) {
    console.error(
      "Errore GET test articolo POPORAMA:",
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

/*
 * ============================================================
 * PATCH
 *
 * Aggiorna il test dello STESSO articolo.
 *
 * NON crea un nuovo PP.
 * NON cambia il codice PP.
 * NON cambia il QR.
 * ============================================================
 */

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const unauthorized = await requirePoporamaSession();
  if (unauthorized) return unauthorized;
  try {
    const codicePP =
      normalizePPCode(
        context.params.code
      );

    if (!codicePP) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Codice PP non valido.",
        },
        {
          status: 400,
        }
      );
    }

    let body: TestPayload;

    try {
      body =
        (await request.json()) as TestPayload;
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Body JSON non valido.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * --------------------------------------------------------
     * GRADO
     *
     * Classificazioni operative NEW/A/B/C/N. D resta solo leggibile.
     * --------------------------------------------------------
     */

    const grado =
      normalizeTestGrade(
        body.grado
      );

    if (!grado) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Seleziona un grado valido: NUOVO, A, B, C oppure N. D è solo legacy.",
        },
        {
          status: 400,
        }
      );
    }

    const accessToken =
      await getShopifyAccessToken();

    /*
     * --------------------------------------------------------
     * CERCA ARTICOLO ESISTENTE
     * --------------------------------------------------------
     */

    const articolo =
      await findArticoloByPP(
        accessToken,
        codicePP
      );

    if (!articolo) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Articolo POPORAMA non trovato.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * --------------------------------------------------------
     * ARTICOLO VENDUTO
     *
     * Per sicurezza non permettiamo di modificare il test
     * di un articolo già venduto.
     * --------------------------------------------------------
     */

    const statoVendita =
      normalizeSaleStatus(
        getFieldValue(
          articolo,
          "stato_vendita"
        )
      );

    if (
      statoVendita ===
      "VENDUTO"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "L'articolo risulta già venduto. Il test non può essere modificato.",
        },
        {
          status: 409,
        }
      );
    }

    // Percentuale omessa: default lotto. Valore esplicito errato: 400 (mai
    // salvare un prezzo diverso da quello che l'operatore ha scelto).
    const manualPercentage = body.percentualePrezzo === undefined
      ? undefined : parseTestPercentage(body.percentualePrezzo);
    if (manualPercentage === null) {
      throw new PricingError("Percentuale prezzo: inserisci un numero da 0 a 100 con massimo 2 decimali (virgola o punto).");
    }
    const listino = await getLottoListino(accessToken, articolo);
    const percentualePrezzo = manualPercentage ?? listino[grado];
    if (percentualePrezzo === null) {
      throw new PricingError(`Percentuale del lotto non valida per ${grado === "NEW" ? "NUOVO" : grado}. Configura il listino del lotto.`);
    }
    const retail = getRetailForPricing(articolo);
    // Il retail è riletto da Shopify; ignoriamo qualsiasi prezzo inviato dal client.
    const prezzoPoporama = calculateTestPrice(retail, percentualePrezzo);
    if (!Number.isFinite(prezzoPoporama)) {
      throw new PricingError("Retail non valido per il calcolo del prezzo POPORAMA.");
    }
    const isTechnicalTest = grado === "A" || grado === "B" || grado === "C";

    /*
     * --------------------------------------------------------
     * DATA TEST
     *
     * Se la pagina non passa una data utilizziamo oggi.
     * Formato Shopify Date: YYYY-MM-DD
     * --------------------------------------------------------
     */

    const dataTest = isTechnicalTest
      ? normalizeDate(body.dataTest) || getTodayDate()
      : "";

    /*
     * --------------------------------------------------------
     * RISULTATI TEST
     *
     * Il campo Shopify è JSON.
     * --------------------------------------------------------
     */

    const risultatiTest =
      normalizeJsonField(
        body.risultatiTest
      );

    /*
     * --------------------------------------------------------
     * CAMPI DA AGGIORNARE
     * --------------------------------------------------------
     */

    const fields = [
      {
        key: "grado",
        value: grado,
      },

      {
        key:
          "percentuale_prezzo",
        value:
          formatDecimal(
            percentualePrezzo
          ),
      },

      {
        key:
          "prezzo_poporama",
        value:
          formatMoney(
            prezzoPoporama
          ),
      },

      {
        key:
          "condizione_estetica",
        value:
          cleanText(
            body.condizioneEstetica
          ),
      },

      {
        key:
          "accessori_mancanti",
        value:
          cleanText(
            body.accessoriMancanti
          ),
      },

      {
        key:
          "difetti_dichiarati",
        value:
          cleanText(
            body.difettiDichiarati
          ),
      },

      {
        key:
          "note_test",
        value:
          cleanText(
            body.noteTest
          ),
      },

      {
        key:
          "risultati_test",
        value:
          risultatiTest,
      },

      {
        key:
          "testato_da",
        value:
          isTechnicalTest ? cleanText(body.testatoDa) : "",
      },

      {
  key: "data_test",
  value: dataTest
    ? dataTest.includes("T")
      ? dataTest
      : `${dataTest}T12:00:00`
    : "",
},
      {
        key:
          "numero_seriale",
        value:
          cleanText(
            body.numeroSeriale
          ),
      },
    ];

    /*
     * --------------------------------------------------------
     * UPDATE METAOBJECT SHOPIFY
     * --------------------------------------------------------
     */

    const updated =
      await updateArticolo(
        accessToken,
        articolo.id,
        fields
      );

    return NextResponse.json({
      ok: true,

      listino,
      message:
        `${codicePP} aggiornato correttamente.`,

      articolo:
        normalizeArticolo(
          updated
        ),
    });
  } catch (error) {
    if (error instanceof PricingError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    console.error(
      "Errore PATCH test articolo POPORAMA:",
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

/*
 * ============================================================
 * SHOPIFY ACCESS TOKEN
 * ============================================================
 */

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

  const response =
    await fetch(
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

/*
 * ============================================================
 * SHOPIFY GRAPHQL
 * ============================================================
 */

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

  const response =
    await fetch(
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

/*
 * ============================================================
 * CERCA ARTICOLO PER CODICE PP
 * ============================================================
 */

async function findArticoloByPP(
  accessToken: string,
  codicePP: string
): Promise<ShopifyMetaobject | null> {
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
      const currentCode =
        normalizePPCode(
          getFieldValue(
            edge.node,
            "codice_pp"
          )
        );

      if (
        currentCode ===
        codicePP
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
        "Paginazione Shopify articoli non valida."
      );
    }
  }

  return null;
}

/*
 * ============================================================
 * UPDATE METAOBJECT
 * ============================================================
 */

async function updateArticolo(
  accessToken: string,
  id: string,
  fields: Array<{
    key: string;
    value: string;
  }>
): Promise<ShopifyMetaobject> {
  const mutation = `
    mutation UpdatePoporamaArticolo(
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

  const data =
    await shopifyGraphQL(
      accessToken,
      mutation,
      {
        id,

        metaobject: {
          fields,
        },
      }
    );

  const result =
    data.data
      ?.metaobjectUpdate;

  const userErrors =
    result?.userErrors || [];

  if (userErrors.length) {
    throw new Error(
      userErrors
        .map(
          (item: {
            message?: string;
          }) =>
            item.message ||
            "Errore aggiornamento Metaobject."
        )
        .join(" | ")
    );
  }

  if (!result?.metaobject) {
    throw new Error(
      "Shopify non ha restituito l'articolo aggiornato."
    );
  }

  return result.metaobject;
}

/*
 * ============================================================
 * NORMALIZZA ARTICOLO
 * ============================================================
 */

function normalizeArticolo(
  articolo: ShopifyMetaobject
) {
  let retail = 0;
  try {
    retail = getRetailForPricing(articolo);
  } catch {
    // La GET mantiene leggibile l'articolo e segnala il problema in erroreListino.
  }
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

    retail,

    costoManifest:
      parseShopifyMoney(
        getFieldValue(
          articolo,
          "costo_manifest"
        )
      ),

    grado:
      normalizeExistingGrade(
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
      parseJsonForResponse(
        getFieldValue(
          articolo,
          "risultati_test"
        )
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

/*
 * ============================================================
 * FIELD
 * ============================================================
 */

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

/*
 * ============================================================
 * PP
 * ============================================================
 */

function normalizePPCode(
  value: unknown
) {
  const code =
    String(value || "")
      .trim()
      .toUpperCase();

  if (
    !/^PP-\d{6,}$/.test(
      code
    )
  ) {
    return "";
  }

  return code;
}

/*
 * ============================================================
 * GRADO DEL TEST
 * ============================================================
 */

function normalizeTestGrade(
  value: unknown
): Grade | null {
  const grade =
    String(value || "")
      .trim()
      .toUpperCase();

  if (
    grade === "A" ||
    grade === "B" ||
    grade === "C" ||
    grade === "NEW" ||
    grade === "N"
  ) {
    return grade;
  }

  return null;
}

/*
 * ============================================================
 * GRADO ESISTENTE
 * ============================================================
 */

function normalizeExistingGrade(
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
    grade === "NEW" ||
    grade === "N"
  ) {
    return grade;
  }

  return "N";
}

/*
 * ============================================================
 * STATO VENDITA
 * ============================================================
 */

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

/*
 * ============================================================
 * NUMERI
 * ============================================================
 */

async function getLottoListino(accessToken: string, articolo: ShopifyMetaobject) {
  const lottoId = getFieldValue(articolo, "lotto").trim();
  if (!lottoId) throw new PricingError("L'articolo non ha un lotto associato.");

  const data = await shopifyGraphQL(accessToken, `
    query GetListinoLotto($id: ID!) {
      metaobject(id: $id) {
        id
        type
        fields { key value }
      }
    }
  `, { id: lottoId });
  const lotto = data.data?.metaobject as ShopifyMetaobject | null;
  if (!lotto || lotto.type !== "poporama_lotto") {
    throw new PricingError("Il lotto associato all'articolo non esiste o non è un lotto POPORAMA.");
  }

  const listino = {} as Record<Grade, number | null>;
  for (const grado of Object.keys(LOTTO_PERCENTAGE_FIELDS) as Grade[]) {
    const raw = getFieldValue(lotto, LOTTO_PERCENTAGE_FIELDS[grado]).trim().replace(",", ".");
    const value = Number(raw);
    listino[grado] = /^\d+(?:\.\d{1,2})?$/.test(raw) &&
      Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;
  }
  return listino;
}

function getRetailForPricing(articolo: ShopifyMetaobject) {
  const raw = getFieldValue(articolo, "retail").trim();
  let amount: unknown = raw;
  try {
    const parsed = JSON.parse(raw);
    amount = parsed !== null && typeof parsed === "object" ? parsed.amount : parsed;
  } catch {
    // Compatibilità con importi numerici non JSON, anche con virgola.
  }
  const normalized = typeof amount === "string" ? amount.trim().replace(",", ".") : amount;
  const number = Number(normalized);
  if (
    (typeof normalized !== "string" && typeof normalized !== "number") ||
    normalized === "" || !Number.isFinite(number) || number < 0
  ) {
    throw new PricingError("Retail dell'articolo non valido: impossibile calcolare il prezzo POPORAMA.");
  }
  return number;
}

/*
 * ============================================================
 * MONEY
 * ============================================================
 */

function formatMoney(
  value: number
) {
  return JSON.stringify({
    amount:
      roundMoney(value).toFixed(
        2
      ),

    currency_code:
      "EUR",
  });
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

/*
 * ============================================================
 * DECIMAL
 * ============================================================
 */

function formatDecimal(
  value: number
) {
  return String(
    Math.round(
      (
        value +
        Number.EPSILON
      ) * 100
    ) / 100
  );
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

/*
 * ============================================================
 * TESTO
 * ============================================================
 */

function cleanText(
  value: unknown
) {
  return String(
    value ?? ""
  ).trim();
}

/*
 * ============================================================
 * JSON
 * ============================================================
 */

function normalizeJsonField(
  value: unknown
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "{}";
  }

  if (
    typeof value === "string"
  ) {
    const trimmed =
      value.trim();

    if (!trimmed) {
      return "{}";
    }

    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch {
      return JSON.stringify({
        valore: trimmed,
      });
    }
  }

  return JSON.stringify(
    value
  );
}

function parseJsonForResponse(
  value: string
) {
  if (!value) {
    return {};
  }

  try {
    return JSON.parse(value);
  } catch {
    return {
      valore: value,
    };
  }
}

/*
 * ============================================================
 * DATA
 * ============================================================
 */

function normalizeDate(
  value: unknown
) {
  const date =
    String(value || "")
      .trim();

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      date
    )
  ) {
    return "";
  }

  return date;
}

function getTodayDate() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/*
 * ============================================================
 * ROUND
 * ============================================================
 */

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
