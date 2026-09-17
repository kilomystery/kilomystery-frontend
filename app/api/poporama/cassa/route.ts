import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const SHOPIFY_API_VERSION = "2026-07";
const COOKIE_NAME = "poporama_cassa_session";
const SESSION_SECONDS = 60 * 60 * 10;

type ShopifyTokenResponse = {
  access_token?: string;
  accessToken?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
};

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

function sessionSecret() {
  const pin = process.env.POPORAMA_CASSA_PIN;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!pin) {
    throw new Error(
      "POPORAMA_CASSA_PIN non configurato."
    );
  }

  if (!clientSecret) {
    throw new Error(
      "SHOPIFY_CLIENT_SECRET non configurato."
    );
  }

  return crypto
    .createHash("sha256")
    .update(`${clientSecret}:${pin}:poporama-cassa`)
    .digest();
}

function signSession(expiresAt: number) {
  const payload = String(expiresAt);

  const signature = crypto
    .createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

function isAuthenticated(request: NextRequest) {
  try {
    const value =
      request.cookies.get(COOKIE_NAME)?.value || "";

    const [expiresRaw, signature] = value.split(".");

    const expiresAt = Number(expiresRaw);

    if (
      !expiresAt ||
      !signature ||
      Date.now() > expiresAt
    ) {
      return false;
    }

    const expected = crypto
      .createHmac("sha256", sessionSecret())
      .update(expiresRaw)
      .digest("hex");

    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expected, "hex");

    return (
      a.length === b.length &&
      crypto.timingSafeEqual(a, b)
    );
  } catch {
    return false;
  }
}

function normalizeCode(value: unknown) {
  const raw = String(value || "")
    .trim()
    .toUpperCase();

  const match = raw.match(/PP-\d{6}/);

  return match ? match[0] : "";
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

function moneyValueForShopify(value: number) {
  return JSON.stringify({
    amount: (
      Math.round(value * 100) / 100
    ).toFixed(2),
    currency_code: "EUR",
  });
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
      ) || "DISPONIBILE",
    prezzoVendita:
      moneyValue(
        fieldValue(
          fields,
          "prezzo_vendita"
        )
      ),
    dataVendita:
      fieldValue(
        fields,
        "data_vendita"
      ),
  };
}

export async function GET(
  request: NextRequest
) {
  try {
    const authenticated =
      isAuthenticated(request);

    if (!authenticated) {
      return NextResponse.json(
        {
          ok: true,
          authenticated: false,
        },
        { status: 401 }
      );
    }

    const code = normalizeCode(
      request.nextUrl.searchParams.get("code")
    );

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
  try {
    const body = await request.json();
    const action = String(
      body?.action || ""
    ).toLowerCase();

    if (action === "login") {
      const configuredPin =
        process.env.POPORAMA_CASSA_PIN;

      if (!configuredPin) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "POPORAMA_CASSA_PIN non configurato sul server.",
          },
          { status: 500 }
        );
      }

      const suppliedPin =
        String(body?.pin || "");

      const a = Buffer.from(suppliedPin);
      const b = Buffer.from(configuredPin);

      const valid =
        a.length === b.length &&
        crypto.timingSafeEqual(a, b);

      if (!valid) {
        return NextResponse.json(
          {
            ok: false,
            error: "PIN non corretto.",
          },
          { status: 401 }
        );
      }

      const expiresAt =
        Date.now() +
        SESSION_SECONDS * 1000;

      const response =
        NextResponse.json({
          ok: true,
          authenticated: true,
        });

      response.cookies.set(
        COOKIE_NAME,
        signSession(expiresAt),
        {
          httpOnly: true,
          sameSite: "strict",
          secure:
            process.env.NODE_ENV ===
            "production",
          path: "/",
          maxAge: SESSION_SECONDS,
        }
      );

      return response;
    }

    if (!isAuthenticated(request)) {
      return NextResponse.json(
        {
          ok: false,
          authenticated: false,
          error:
            "Sessione cassa non autorizzata.",
        },
        { status: 401 }
      );
    }

    if (action !== "sell") {
      return NextResponse.json(
        {
          ok: false,
          error: "Azione non valida.",
        },
        { status: 400 }
      );
    }

    const code = normalizeCode(
      body?.code
    );

    if (!code) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Codice PP non valido.",
        },
        { status: 400 }
      );
    }

    const prezzoVendita =
      Number(
        String(
          body?.prezzoVendita ?? ""
        ).replace(",", ".")
      );

    if (
      !Number.isFinite(prezzoVendita) ||
      prezzoVendita < 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Prezzo vendita non valido.",
        },
        { status: 400 }
      );
    }

    const articolo =
      await loadArticle(code);

    if (!articolo) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Articolo POPORAMA non trovato.",
        },
        { status: 404 }
      );
    }

    if (
      articolo.statoVendita
        .trim()
        .toUpperCase() === "VENDUTO"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Questo articolo risulta già VENDUTO.",
          articolo,
        },
        { status: 409 }
      );
    }

    const dataVendita =
      new Date().toISOString();

    const mutation = `
      mutation PoporamaVendiArticolo(
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

    const updateData =
      await shopifyGraphql(
        mutation,
        {
          id: articolo.id,
          metaobject: {
            fields: [
              {
                key: "stato_vendita",
                value: "VENDUTO",
              },
              {
                key: "prezzo_vendita",
                value:
                  moneyValueForShopify(
                    prezzoVendita
                  ),
              },
              {
                key: "data_vendita",
                value: dataVendita,
              },
            ],
          },
        }
      );

    const result =
      updateData.data?.metaobjectUpdate;

    if (result?.userErrors?.length) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Shopify non ha registrato la vendita.",
          details:
            result.userErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        "Vendita registrata su Shopify.",
      vendita: {
        codicePP: code,
        prezzoVendita:
          Math.round(
            prezzoVendita * 100
          ) / 100,
        dataVendita,
        statoVendita: "VENDUTO",
      },
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
          error instanceof Error
            ? error.message
            : "Errore sconosciuto.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  const response =
    NextResponse.json({
      ok: true,
      authenticated: false,
    });

  response.cookies.set(
    COOKIE_NAME,
    "",
    {
      httpOnly: true,
      sameSite: "strict",
      secure:
        process.env.NODE_ENV ===
        "production",
      path: "/",
      maxAge: 0,
    }
  );

  return response;
}
