import { NextResponse } from "next/server";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";

export const runtime = "nodejs";

type Lang = "it" | "en" | "es" | "fr" | "de";

function must(q: URLSearchParams, key: string) {
  const v = (q.get(key) ?? "").trim();
  return v;
}

function toPdfBuffer(build: (doc: PDFDocument) => Promise<void> | void) {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [288, 432], // 4x6 inches @ 72dpi (standard PDF points)
        margin: 18,
      });

      const chunks: Buffer[] = [];

      doc.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      await build(doc);

      // IMPORTANTISSIMO: chiude davvero il PDF
      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams;

  const id = must(q, "id");
  const product = must(q, "product");
  const weightKg = must(q, "weightKg");
  const date = must(q, "date");
  const warehouse = must(q, "warehouse");
  const lang = (must(q, "lang") || "it") as Lang;

  if (!id || !product || !weightKg || !date || !warehouse) {
    return NextResponse.json(
      {
        error:
          "Missing query params: id, product, weightKg, date, warehouse (and optional lang)",
      },
      { status: 400 }
    );
  }

  // QR: porta alla pagina verify del lotto
  const verifyUrl = `https://www.kilomystery.com/${lang}/verify/${encodeURIComponent(id)}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: "M",
      margin: 0,
      scale: 6,
    });

    const pdf = await toPdfBuffer(async (doc) => {
      // Header
      doc.fontSize(18).font("Helvetica-Bold").text("KiloMystery", { align: "left" });
      doc.moveDown(0.2);
      doc.fontSize(10).font("Helvetica").fillColor("#333333").text("Warehouse:", { continued: true });
      doc.font("Helvetica-Bold").text(` ${warehouse}`);
      doc.moveDown(0.6);

      // Product block
      doc.fillColor("#000000");
      doc.fontSize(13).font("Helvetica-Bold").text(product);
      doc.moveDown(0.2);
      doc.fontSize(11).font("Helvetica").text(`Peso: ${weightKg}`);
      doc.text(`Data: ${date}`);
      doc.moveDown(0.4);

      // Lotto ID big
      doc.moveDown(0.2);
      doc.fontSize(11).font("Helvetica").fillColor("#333333").text("ID Lotto");
      doc.fontSize(16).font("Helvetica-Bold").fillColor("#000000").text(id);

      // QR
      const base64 = qrDataUrl.split(",")[1];
      const qrPng = Buffer.from(base64, "base64");

      const qrSize = 140;
      const x = 288 - 18 - qrSize; // right aligned
      const y = 432 - 18 - qrSize - 24; // bottom area + label
      doc.image(qrPng, x, y, { width: qrSize, height: qrSize });

      // QR caption
      doc.fontSize(9).font("Helvetica").fillColor("#333333");
      doc.text("Scansiona per verificare", x, y + qrSize + 6, {
        width: qrSize,
        align: "center",
      });

      // Footer line
      doc.moveTo(18, 432 - 18).lineTo(288 - 18, 432 - 18).strokeColor("#DDDDDD").stroke();
    });

    const filename = `label_${id}.pdf`;

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdf.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("label api error:", err);
    return NextResponse.json(
      { error: "Failed to generate label", details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
