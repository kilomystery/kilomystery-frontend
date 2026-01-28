// app/api/label/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const runtime = "nodejs";

function reqParam(url: URL, key: string) {
  return (url.searchParams.get(key) ?? "").trim();
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

    if (!id || !product || !weightKg || !date || !warehouse) {
      return NextResponse.json(
        {
          error:
            "Missing query params: id, product, weightKg, date, warehouse (and optional lang)",
        },
        { status: 400 }
      );
    }

    // === QR CODE (senza tipi TS, così non rompe build) ===
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const QRCode = require("qrcode") as any;

    const qrTarget = `https://www.kilomystery.com/${lang}/verify?id=${encodeURIComponent(
      id
    )}`;

    const qrPngBuffer: Buffer = await QRCode.toBuffer(qrTarget, {
      type: "png",
      errorCorrectionLevel: "M",
      margin: 1,
      width: 300,
    });

    // === Fonts ===
    const fontRegularPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "Inter-Regular.ttf"
    );
    const fontBoldPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "Inter-Bold.ttf"
    );

    const fontRegularBytes = fs.readFileSync(fontRegularPath);
    const fontBoldBytes = fs.readFileSync(fontBoldPath);

    // === PDF 4x6 (in points) ===
    // 4x6 inch @ 72pt/in => 288 x 432
    const W = 288;
    const H = 432;
    const M = 18;

    const pdf = await PDFDocument.create();
    pdf.registerFontkit(
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("@pdf-lib/fontkit")
    );

    const fontRegular = await pdf.embedFont(fontRegularBytes);
    const fontBold = await pdf.embedFont(fontBoldBytes);

    const page = pdf.addPage([W, H]);

    // Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: W,
      height: H,
      color: rgb(1, 1, 1),
    });

    // Header
    page.drawText("KILO MYSTERY", {
      x: M,
      y: H - M - 18,
      size: 18,
      font: fontBold,
      color: rgb(0.043, 0.059, 0.078), // #0b0f14
    });

    page.drawText("Shipping label", {
      x: M,
      y: H - M - 40,
      size: 10,
      font: fontRegular,
      color: rgb(0.42, 0.45, 0.51), // gray
    });

    // Separator line
    page.drawLine({
      start: { x: M, y: H - 60 },
      end: { x: W - M, y: H - 60 },
      thickness: 1,
      color: rgb(0.9, 0.91, 0.92),
    });

    // Left content
    let y = H - 74;

    const label = (t: string) => {
      page.drawText(t, {
        x: M,
        y,
        size: 11,
        font: fontBold,
        color: rgb(0.067, 0.094, 0.153), // #111827
      });
      y -= 14;
    };

    const value = (t: string, maxWidth = 160) => {
      // pdf-lib non fa wrap automatico: facciamo una versione semplice
      // Se è troppo lungo, tagliamo con "…"
      const maxChars = Math.floor(maxWidth / 6.2); // stima per size 12
      const out = t.length > maxChars ? t.slice(0, maxChars - 1) + "…" : t;

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
    value(id, 170);

    label("Product");
    value(product, 170);

    label("Weight");
    value(weightKg, 170);

    label("Date");
    value(date, 170);

    label("Warehouse");
    value(warehouse, 170);

    // QR on right
    const qrImage = await pdf.embedPng(qrPngBuffer);
    const qrSize = 110;
    const qrX = W - M - qrSize;
    const qrY = H - 110 - qrSize; // circa come prima

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    // "Scan to verify"
    page.drawText("Scan to verify", {
      x: qrX + 14,
      y: qrY - 12,
      size: 8,
      font: fontRegular,
      color: rgb(0.42, 0.45, 0.51),
    });

    // Footer
    page.drawText("www.kilomystery.com", {
      x: M,
      y: 12,
      size: 8,
      font: fontRegular,
      color: rgb(0.6, 0.64, 0.69),
    });

    const pdfBytes = await pdf.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="label-${id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to generate label", details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
