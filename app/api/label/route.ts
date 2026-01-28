import { NextResponse } from "next/server";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

type Lang = "it" | "en" | "es" | "fr" | "de";
type PdfDoc = InstanceType<typeof PDFDocument>;

function must(q: URLSearchParams, key: string) {
  return (q.get(key) ?? "").trim();
}

function toPdfBuffer(build: (doc: PdfDoc) => Promise<void> | void) {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [288, 432], // 4x6
        margin: 18,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (c: any) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err: any) => reject(err));

      await build(doc as PdfDoc);

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

function getFontPaths() {
  // In produzione su Vercel, __dirname punta a .next/server/... quindi risaliamo fino a root
  // e andiamo in /public/fonts
  const root = process.cwd();
  const regular = path.join(root, "public", "fonts", "Inter-Regular.ttf");
  const bold = path.join(root, "public", "fonts", "Inter-Bold.ttf");
  return { regular, bold };
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

  const verifyUrl = `https://www.kilomystery.com/${lang}/verify/${encodeURIComponent(id)}`;

  try {
    const { regular, bold } = getFontPaths();

    // check rapido: se mancano i file, errore chiaro
    if (!fs.existsSync(regular) || !fs.existsSync(bold)) {
      return NextResponse.json(
        {
          error: "Fonts missing",
          details:
            "Add public/fonts/Inter-Regular.ttf and public/fonts/Inter-Bold.ttf",
        },
        { status: 500 }
      );
    }

    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: "M",
      margin: 0,
      scale: 6,
    });

    const pdf = await toPdfBuffer(async (doc) => {
      // ✅ registra font embedded
      doc.registerFont("Inter", regular);
      doc.registerFont("InterBold", bold);

      // Header
      doc.font("InterBold").fontSize(18).fillColor("#000000");
      doc.text("KiloMystery", { align: "left" });

      doc.moveDown(0.2);
      doc.font("Inter").fontSize(10).fillColor("#333333");
      doc.text("Warehouse:", { continued: true });
      doc.font("InterBold").text(` ${warehouse}`);

      doc.moveDown(0.8);

      // Product
      doc.font("InterBold").fontSize(13).fillColor("#000000");
      doc.text(product);

      doc.moveDown(0.2);
      doc.font("Inter").fontSize(11);
      doc.text(`Peso: ${weightKg}`);
      doc.text(`Data: ${date}`);

      doc.moveDown(0.6);

      // Lotto
      doc.font("Inter").fontSize(11).fillColor("#333333").text("ID Lotto");
      doc.font("InterBold").fontSize(16).fillColor("#000000").text(id);

      // QR
      const base64 = qrDataUrl.split(",")[1];
      const qrPng = Buffer.from(base64, "base64");

      const qrSize = 140;
      const x = 288 - 18 - qrSize;
      const y = 432 - 18 - qrSize - 24;

      doc.image(qrPng, x, y, { width: qrSize, height: qrSize });

      doc.font("Inter").fontSize(9).fillColor("#333333");
      doc.text("Scansiona per verificare", x, y + qrSize + 6, {
        width: qrSize,
        align: "center",
      });

      // Footer line
      doc.moveTo(18, 432 - 18)
        .lineTo(288 - 18, 432 - 18)
        .strokeColor("#DDDDDD")
        .stroke();
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
