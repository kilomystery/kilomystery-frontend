import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PDFDocument, rgb } from "pdf-lib";

export const runtime = "nodejs";

function reqParam(url: URL, key: string) {
  return (url.searchParams.get(key) ?? "").trim();
}

function parseKg(weightKg: string) {
  const m = weightKg.replace(",", ".").match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : 0;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const id = reqParam(url, "id");
    const product = reqParam(url, "product");
    const weightKg = reqParam(url, "weightKg");
    const date = reqParam(url, "date");
    const warehouse = reqParam(url, "warehouse");
    const lang = reqParam(url, "lang") || "it";
    const channel = reqParam(url, "channel");
    const externalOrderId = reqParam(url, "externalOrderId");
    const discount = reqParam(url, "discount");

    const kg = parseKg(weightKg);
    const CO2_FACTOR = 0.25;
    const co2 = Math.round(kg * CO2_FACTOR * 100) / 100;

    const QRCode = (await import("qrcode")).default;
    const fontkit = (await import("@pdf-lib/fontkit")).default;

    const qrTarget = `https://www.kilomystery.com/${lang}/verify/${encodeURIComponent(id)}`;
    const qrPngBuffer: Buffer = await QRCode.toBuffer(qrTarget);

    const pdf = await PDFDocument.create();
    pdf.registerFontkit(fontkit);

    const fontRegularBytes = fs.readFileSync(
      path.join(process.cwd(), "public/fonts/Inter-Regular.ttf")
    );
    const fontBoldBytes = fs.readFileSync(
      path.join(process.cwd(), "public/fonts/Inter-Bold.ttf")
    );

    const fontRegular = await pdf.embedFont(fontRegularBytes);
    const fontBold = await pdf.embedFont(fontBoldBytes);

    const page = pdf.addPage([288, 432]);
    const M = 18;
    let y = 380;

    function label(t: string) {
      page.drawText(t, { x: M, y, size: 11, font: fontBold });
      y -= 16;
    }

    function value(t: string) {
      page.drawText(t, { x: M, y, size: 12, font: fontRegular });
      y -= 22;
    }

    label("Order ID");
    value(id);

    label("Product");
    value(product);

    label("Weight");
    value(weightKg);

    label("CO₂ avoided");
    value(`${co2} kg`);

    label("Date");
    value(date);

    label("Warehouse");
    value(warehouse);

    if (channel) {
      label("Channel");
      value(channel);
    }

    if (externalOrderId) {
      label("Order ref");
      value(externalOrderId);
    }

    if (discount) {
      y -= 10;
      page.drawText("Sconto prossimo ordine:", {
        x: M,
        y,
        size: 10,
        font: fontBold,
      });
      y -= 18;
      page.drawText(discount.toUpperCase(), {
        x: M,
        y,
        size: 18,
        font: fontBold,
      });
    }

    const qrImage = await pdf.embedPng(qrPngBuffer);
    page.drawImage(qrImage, { x: 150, y: 200, width: 110, height: 110 });

    const pdfBytes = await pdf.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: { "Content-Type": "application/pdf" },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
