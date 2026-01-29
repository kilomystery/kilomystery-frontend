// app/api/label/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PDFDocument, rgb } from "pdf-lib";

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

    // ✅ Import dinamici (no require, no eslint)
    const QRCode = (await import("qrcode")).default;
    const fontkit = (await import("@pdf-lib/fontkit")).default;

    // ✅ QR: porta a /verify/[id] (pagina cliente)
const qrTarget = `https://www.kilomystery.com/${lang}/verify/${encodeURIComponent(id)}`;
    

    const qrPngBuffer: Buffer = await QRCode.toBuffer(qrTarget, {
      type: "png",
      errorCorrectionLevel: "M",
      margin: 1,
      width: 300,
    });

    // ✅ Fonts
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

    // 4x6 inch @ 72pt/in => 288 x 432
    const W = 288;
    const H = 432;
    const M = 18;

    const pdf = await PDFDocument.create();
    pdf.registerFontkit(fontkit);

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

    // Left content
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
      const out =
        t.length > approxChars ? t.slice(0, approxChars - 1) + "…" : t;

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

    label("Date");
    value(date);

    label("Warehouse");
    value(warehouse);

    // QR a destra
    const qrImage = await pdf.embedPng(qrPngBuffer);
    const qrSize = 110;
    const qrX = W - M - qrSize;
    const qrY = H - 110 - qrSize;

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

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
        // ✅ meglio così: si apre e puoi stampare/subito salvare
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
