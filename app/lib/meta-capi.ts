import crypto from "crypto";

type MetaUserData = {
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  ct?: string;
  st?: string;
  zp?: string;
  country?: string;
  external_id?: string;
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
};

type MetaContent = {
  id: string;
  quantity: number;
  item_price?: number;
};

type SendPurchaseParams = {
  eventId: string;
  eventTime?: number;
  eventSourceUrl?: string;
  value: number;
  currency: string;
  orderId?: string;
  contents?: MetaContent[];
  contentIds?: string[];
  userData?: MetaUserData;
  testEventCode?: string;
};

const META_PIXEL_ID = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
const META_CAPI_ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || "";
const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || "";

function normalize(value?: string) {
  return (value || "").trim().toLowerCase();
}

function digits(value?: string) {
  return (value || "").replace(/\D+/g, "");
}

function sha256(value?: string) {
  const v = value?.trim();
  if (!v) return undefined;
  return crypto.createHash("sha256").update(v).digest("hex");
}

function buildUserData(input?: MetaUserData) {
  if (!input) return {};

  const out: Record<string, any> = {};

  const em = sha256(normalize(input.em));
  const ph = sha256(digits(input.ph));
  const fn = sha256(normalize(input.fn));
  const ln = sha256(normalize(input.ln));
  const ct = sha256(normalize(input.ct));
  const st = sha256(normalize(input.st));
  const zp = sha256(normalize(input.zp));
  const country = sha256(normalize(input.country));
  const externalId = sha256(normalize(input.external_id));

  if (em) out.em = [em];
  if (ph) out.ph = [ph];
  if (fn) out.fn = [fn];
  if (ln) out.ln = [ln];
  if (ct) out.ct = [ct];
  if (st) out.st = [st];
  if (zp) out.zp = [zp];
  if (country) out.country = [country];
  if (externalId) out.external_id = [externalId];

  if (input.client_ip_address) out.client_ip_address = input.client_ip_address;
  if (input.client_user_agent) out.client_user_agent = input.client_user_agent;
  if (input.fbp) out.fbp = input.fbp;
  if (input.fbc) out.fbc = input.fbc;

  return out;
}

export async function sendMetaPurchase(params: SendPurchaseParams) {
  if (!META_PIXEL_ID) throw new Error("Missing META_PIXEL_ID");
  if (!META_CAPI_ACCESS_TOKEN) throw new Error("Missing META_CAPI_ACCESS_TOKEN");

  const eventTime = params.eventTime || Math.floor(Date.now() / 1000);

  const payload: Record<string, any> = {
    data: [
      {
        event_name: "Purchase",
        event_time: eventTime,
        event_id: params.eventId,
        action_source: "website",
        event_source_url: params.eventSourceUrl || process.env.SITE_URL || "",
        user_data: buildUserData(params.userData),
        custom_data: {
          currency: params.currency || "EUR",
          value: Number(params.value || 0),
          order_id: params.orderId,
          content_type: "product",
          content_ids: params.contentIds || params.contents?.map((c) => c.id) || [],
          contents: params.contents || [],
        },
      },
    ],
  };

  const testCode = params.testEventCode || META_TEST_EVENT_CODE;
  if (testCode) {
    payload.test_event_code = testCode;
  }

  const res = await fetch(
    `https://graph.facebook.com/v22.0/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(META_CAPI_ACCESS_TOKEN)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Meta CAPI error: ${JSON.stringify(data)}`);
  }

  return data;
}