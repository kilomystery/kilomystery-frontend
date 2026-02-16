import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PDFDocument, rgb } from "pdf-lib";

export const runtime = "nodejs";

function reqParam(url: URL, key: string) {
  return (url.searchParams.get(key) ?? "").trim();
}

function parseKgFromWeight(weightKg: string) {
  const m = (weightKg || "").replace(",", ".").match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : 0;
}

function calcCo2(kg: number) {
  const factor = Number(process.env.CO2_FACTOR_PER_KG || "0.25");
  return Math.round(kg * factor * 100) / 100;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // parametri (compatibili con quelli che già usi)
    const id = reqParam(url, "id");
    const product = reqParam(url, "product");
    const weightKg = reqParam(url, "weightKg");
    const date = reqParam(url, "date");
    const warehouse = reqParam(url, "warehouse");
    const lang = reqParam(url, "lang") || "it";

    // extra opzionali
    const channel = reqParam(url, "channel") || ""; // es "Shopify"
    const externalOrderId = reqParam(url, "externalOrderId") || ""; // es "#1057"
    const discount = reqParam(url, "discount") || "";

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    if (!product) return NextResponse.json({ error: "Missing product" }, { status: 400 });
    if (!weightKg) return NextResponse.json({ error: "Missing weightKg" }, { status: 400 });
    if (!date) return NextResponse.json({ error: "Missing date" }, { status: 400 });
    if (!warehouse) return NextResponse.json({ error: "Missing warehouse" }, { status: 400 });

    const QRCode = (await import("qrcode")).default;
    const fontkit = (await import("@pdf-lib/fontkit")).default;

    const qrTarget = `https://www.kilomystery.com/${lang}/verify/${encodeURIComponent(id)}`;
    const qrPngBuffer: Buffer = await QRCode.toBuffer(qrTarget, {
      type: "png",
      errorCorrectionLevel: "M",
      margin: 1,
      width: 300,
    });

    // fonts
    const fontRegularPath = path.join(process.cwd(), "public", "fonts", "Inter-Regular.ttf");
    const fontBoldPath = path.join(process.cwd(), "public", "fonts", "Inter-Bold.ttf");
    const fontRegularBytes = fs.readFileSync(fontRegularPath);
    const fontBoldBytes = fs.readFileSync(fontBoldPath);

    // layout identico all’email
    const W = 288;
    const H = 432;
    const M = 18;

    const pdf = await PDFDocument.create();
    pdf.registerFontkit(fontkit);

    const fontRegular = await pdf.embedFont(fontRegularBytes);
    const fontBold = await pdf.embedFont(fontBoldBytes);

    const page = pdf.addPage([W, H]);

    // BG bianco
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

    const drawLabel = (t: string) => {
      page.drawText(t, {
        x: M,
        y,
        size: 11,
        font: fontBold,
        color: rgb(0.067, 0.094, 0.153),
      });
      y -= 14;
    };

    const drawValue = (t: string, maxWidth = 170) => {
      // truncate “semplice” per evitare overflow
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

    drawLabel("Order ID");
    drawValue(id);

    drawLabel("Product");
    drawValue(product);

    drawLabel("Weight");
    drawValue(weightKg);

    const kgNum = parseKgFromWeight(weightKg);
    const co2 = calcCo2(kgNum);
    drawLabel("CO₂ avoided");
    drawValue(`${co2} kg`);

    drawLabel("Date");
    drawValue(date);

    drawLabel("Warehouse");
    drawValue(warehouse);

    // opzionali: uguali alla mail
    if (channel) {
      drawLabel("Sales channel");
      drawValue(channel);
    }

    if (externalOrderId) {
      drawLabel("Order ref");
      drawValue(externalOrderId);
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

    // Footer
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

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        // utile se vuoi scaricare da browser col nome giusto
        "Content-Disposition": `inline; filename="label-${id}.pdf"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "PDF label generation failed", details: String(err?.message ?? err) }, { status: 500 });
  }
}
