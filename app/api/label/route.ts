// app/api/label/route.ts
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import PDFDocument from "pdfkit"; // usa pdfkit "normale"
import { PassThrough } from "stream";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

// Helper: converte PDFKit stream -> Buffer
function toBuffer(doc: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const stream = new PassThrough();
    const chunks: Buffer[] = [];

    stream.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);

    doc.pipe(stream);
    doc.end();
  });
}

function getRequiredParam(url: URL, key: string) {
  const v = url.searchParams.get(key);
  return (v ?? "").trim();
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // query params richiesti
    const id = getRequiredParam(url, "id");
    const product = getRequiredParam(url, "product");
    const weightKg = getRequiredParam(url, "weightKg");
    const date = getRequiredParam(url, "date");
    const warehouse = getRequiredParam(url, "warehouse");
    const lang = getRequiredParam(url, "lang") || "it";

    if (!id || !product || !weightKg || !date || !warehouse) {
      return NextResponse.json(
        { error: "Missing query params: id, product, weightKg, date, warehouse (and optional lang)" },
        { status: 400 }
      );
    }

    // ✅ Font da /public/fonts (ATTENZIONE: nel tuo repo sono Inter-Regular.ttf e Inter-Bold.ttf)
    const fontRegularPath = path.join(process.cwd(), "public", "fonts", "Inter-Regular.ttf");
    const fontBoldPath = path.join(process.cwd(), "public", "fonts", "Inter-Bold.ttf");

    const fontRegular = fs.readFileSync(fontRegularPath);
    const fontBold = fs.readFileSync(fontBoldPath);

    // Cosa deve fare il QR?
    // 1) Semplice: va al sito
    // const qrTarget = "https://www.kilomystery.com";

    // 2) Meglio (consigliato): va alla pagina verify con lo stesso ID
    // (se ancora non esiste, la crei dopo: /it/verify?id=XXX)
    const qrTarget = `https://www.kilomystery.com/${lang}/verify?id=${encodeURIComponent(id)}`;

    const qrDataUrl = await QRCode.toDataURL(qrTarget, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 300,
    });

    // PDF 4x6 pollici = 288 x 432 pt (72pt per pollice)
    const doc: any = new (PDFDocument as any)({
      size: [288, 432],
      margin: 18,
    });

    // registra font (nome interno Inter)
    doc.registerFont("Inter", fontRegular);
    doc.registerFont("Inter-Bold", fontBold);

    // Sfondo
    doc.rect(0, 0, 288, 432).fill("#ffffff");

    // Header brand
    doc
      .fillColor("#0b0f14")
      .font("Inter-Bold")
      .fontSize(18)
      .text("KILO MYSTERY", 18, 18, { align: "left" });

    doc
      .fillColor("#6b7280")
      .font("Inter")
      .fontSize(10)
      .text("Shipping label", 18, 42);

    // Linea separatore
    doc
      .moveTo(18, 60)
      .lineTo(270, 60)
      .lineWidth(1)
      .stroke("#e5e7eb");

    // Box dati principali
    const leftX = 18;
    let y = 74;

    doc.fillColor("#111827").font("Inter-Bold").fontSize(11).text("Order ID", leftX, y);
    y += 14;
    doc.fillColor("#111827").font("Inter").fontSize(12).text(id, leftX, y);
    y += 22;

    doc.fillColor("#111827").font("Inter-Bold").fontSize(11).text("Product", leftX, y);
    y += 14;
    doc.fillColor("#111827").font("Inter").fontSize(12).text(product, leftX, y);
    y += 22;

    doc.fillColor("#111827").font("Inter-Bold").fontSize(11).text("Weight", leftX, y);
    y += 14;
    doc.fillColor("#111827").font("Inter").fontSize(12).text(weightKg, leftX, y);
    y += 22;

    doc.fillColor("#111827").font("Inter-Bold").fontSize(11).text("Date", leftX, y);
    y += 14;
    doc.fillColor("#111827").font("Inter").fontSize(12).text(date, leftX, y);
    y += 22;

    doc.fillColor("#111827").font("Inter-Bold").fontSize(11).text("Warehouse", leftX, y);
    y += 14;
    doc.fillColor("#111827").font("Inter").fontSize(12).text(warehouse, leftX, y, { width: 160 });

    // QR a destra
    const qrSize = 110;
    const qrX = 288 - 18 - qrSize;
    const qrY = 110;

    const base64 = qrDataUrl.split(",")[1];
    const qrBuffer = Buffer.from(base64, "base64");

    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

    doc
      .fillColor("#6b7280")
      .font("Inter")
      .fontSize(8)
      .text("Scan to verify", qrX, qrY + qrSize + 6, { width: qrSize, align: "center" });

    // Footer (mini)
    doc
      .fillColor("#9ca3af")
      .font("Inter")
      .fontSize(8)
      .text("www.kilomystery.com", 18, 432 - 24, { align: "left" });

    const pdfBuffer = await toBuffer(doc);

    return new NextResponse(pdfBuffer, {
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
