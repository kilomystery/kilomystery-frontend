import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PDFDocument, rgb } from "pdf-lib";
import { Resend } from "resend";

export const runtime = "nodejs";

function yyyymmdd(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function pad4(n: number) {
  return String(n).padStart(4, "0");
}

function parseSkuForLot(skuRaw: string) {
  // atteso: PRM-5KG / STD-10KG / EXP-2KG
  const sku = (skuRaw || "").toUpperCase().replace(/\s+/g, "");
  const typeMatch = sku.match(/\b(PRM|STD|EXP)\b/);
  const kgMatch = sku.match(/(\d+(?:\.\d+)?)KG/);

  const type = typeMatch ? typeMatch[1] : "PRM";
  const kg = kgMatch ? Number(kgMatch[1]) : 0;

  return { type, kg };
}

function parseKgFromWeight(weightKg: string) {
  const m = (weightKg || "").replace(",", ".").match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : 0;
}

function calcCo2(kg: number) {
  const factor = Number(process.env.CO2_FACTOR_PER_KG || "0.25");
  return Math.round(kg * factor * 100) / 100;
}

async function generateLabelPdf(params: {
  id: string;
  product: string;
  weightKg: string; // "5 KG"
  date: string; // "14/02/2026"
  warehouse: string;
  lang: string;
  channel: string;
  externalOrderId?: string;
  discount?: string;
}) {
  const QRCode = (await import("qrcode")).default;
  const fontkit = (await import("@pdf-lib/fontkit")).default;

  const {
    id,
    product,
    weightKg,
    date,
    warehouse,
    lang,
    channel,
    externalOrderId,
    discount,
  } = params;

  const qrTarget = `https://www.kilomystery.com/${lang}/verify/${encodeURIComponent(id)}`;
  const qrPngBuffer: Buffer = await QRCode.toBuffer(qrTarget, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 300,
  });

  const fontRegularPath = path.join(process.cwd(), "public", "fonts", "Inter-Regular.ttf");
  const fontBoldPath = path.join(process.cwd(), "public", "fonts", "Inter-Bold.ttf");
  const fontRegularBytes = fs.readFileSync(fontRegularPath);
  const fontBoldBytes = fs.readFileSync(fontBoldPath);

  const W = 288;
  const H = 432;
  const M = 18;

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const fontRegular = await pdf.embedFont(fontRegularBytes);
  const fontBold = await pdf.embedFont(fontBoldBytes);

  const page = pdf.addPage([W, H]);

  // Background
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(1, 1, 1) });

  // Header
  page.drawText("KILO MYSTERY", {
    x: M,
    y: H - M - 18,
    size: 18,
    font: fontBold,
    color: rgb(0.043, 0.059, 0.078),
  });

  page.drawText("Shipping label", {
    x: M,
    y: H - M - 40,
    size: 10,
    font: fontRegular,
    color: rgb(0.42, 0.45, 0.51),
  });

  // Separator
  page.drawLine({
    start: { x: M, y: H - 60 },
    end: { x: W - M, y: H - 60 },
    thickness: 1,
    color: rgb(0.9, 0.91, 0.92),
  });

  let y = H - 74;

  const label = (t: string) => {
    page.drawText(t, {
      x: M,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0.067, 0.094, 0.153),
    });
    y -= 14;
  };

  const value = (t: string, maxWidth = 170) => {
    const approxChars = Math.max(10, Math.floor(maxWidth / 6.2));
    const out = t.length > approxChars ? t.slice(0, approxChars - 1) + "…" : t;

    page.drawText(out, {
      x: M,
      y,
      size: 12,
      font: fontRegular,
      color: rgb(0.067, 0.094, 0.153),
    });
    y -= 22;
  };

  label("Order ID");
  value(id);

  label("Product");
  value(product);

  label("Weight");
  value(weightKg);

  // CO2
  const kgNum = parseKgFromWeight(weightKg);
  const co2 = calcCo2(kgNum);
  label("CO₂ avoided");
  value(`${co2} kg`);

  label("Date");
  value(date);

  label("Warehouse");
  value(warehouse);

  label("Sales channel");
  value(channel);

  if (externalOrderId) {
    label("Order ref");
    value(externalOrderId);
  }

  // QR a destra
  const qrImage = await pdf.embedPng(qrPngBuffer);
  const qrSize = 110;
  const qrX = W - M - qrSize;
  const qrY = H - 110 - qrSize;

  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

  page.drawText("Scan to verify", {
    x: qrX + 14,
    y: qrY - 12,
    size: 8,
    font: fontRegular,
    color: rgb(0.42, 0.45, 0.51),
  });

  // Discount box (opzionale)
  if (discount) {
    page.drawRectangle({
      x: M,
      y: 64,
      width: W - M * 2,
      height: 54,
      color: rgb(0.98, 0.98, 1),
      borderColor: rgb(0.85, 0.86, 0.9),
      borderWidth: 1,
    });

    page.drawText("Sconto sul prossimo ordine", {
      x: M + 10,
      y: 102,
      size: 10,
      font: fontBold,
      color: rgb(0.067, 0.094, 0.153),
    });

    page.drawText(discount.toUpperCase(), {
      x: M + 10,
      y: 78,
      size: 18,
      font: fontBold,
      color: rgb(0.067, 0.094, 0.153),
    });
  }

  // Footer con sito
  page.drawLine({
    start: { x: M, y: 30 },
    end: { x: W - M, y: 30 },
    thickness: 1,
    color: rgb(0.9, 0.91, 0.92),
  });

  page.drawText("www.kilomystery.com", {
    x: M,
    y: 14,
    size: 9,
    font: fontRegular,
    color: rgb(0.6, 0.64, 0.69),
  });

  const pdfBytes = await pdf.save();
  return Buffer.from(pdfBytes);
}

export async function POST(req: Request) {
  const emailTo = process.env.EMAIL_TO;
  const resendKey = process.env.RESEND_API_KEY;

  if (!emailTo) return NextResponse.json({ error: "Missing EMAIL_TO" }, { status: 500 });
  if (!resendKey) return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });

  const payload = await req.json();

  const orderName = String(payload?.name || payload?.order_number || "Shopify Order");
  const createdAt = payload?.created_at ? new Date(payload.created_at) : new Date();
  const dateHuman = createdAt.toLocaleDateString("it-IT");
  const today = yyyymmdd(createdAt);

  const warehouse = "Brindisi (BR)";
  const lang = "it";

  const lineItems = Array.isArray(payload?.line_items) ? payload.line_items : [];
  if (lineItems.length === 0) {
    return NextResponse.json({ ok: true, note: "No line items" }, { status: 200 });
  }

  const attachments: Array<{ filename: string; content: string }> = [];
  let seq = 1;

  for (const it of lineItems) {
    const title = String(it?.title || "Item");
    const sku = String(it?.sku || "");
    const quantity = Math.max(1, Number(it?.quantity || 1));

    const { type, kg } = parseSkuForLot(sku);

    for (let i = 0; i < quantity; i++) {
      const lotId = `KM-${today}-${type}-${kg > 0 ? `${kg}KG` : "0KG"}-${pad4(seq)}`;
      seq++;

      const pdfBuffer = await generateLabelPdf({
        id: lotId,
        product: title,
        weightKg: `${kg || 0} KG`,
        date: dateHuman,
        warehouse,
        lang,
        channel: "Shopify",
        externalOrderId: orderName,
        // discount: "KM10", // se vuoi sconto automatico dimmelo
      });

      attachments.push({
        filename: `label-${lotId}.pdf`,
        content: pdfBuffer.toString("base64"),
      });
    }
  }

  const resend = new Resend(resendKey);

  await resend.emails.send({
    from: "KiloMystery <no-reply@kilomystery.com>",
    to: [emailTo],
    subject: `Etichette ordine ${orderName}`,
    html: `
      <div style="font-family:Arial,sans-serif">
        <h2>Etichette pronte da stampare</h2>
        <p><b>Ordine:</b> ${orderName}</p>
        <p>In allegato trovi ${attachments.length} PDF (4×6) pronti per la stampante etichette.</p>
      </div>
    `,
    attachments,
  });

  return NextResponse.json({ ok: true, sent: attachments.length }, { status: 200 });
}
