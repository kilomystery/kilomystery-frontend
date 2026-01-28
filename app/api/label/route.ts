import { NextResponse } from "next/server";
import QRCode from "qrcode";
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import { PassThrough } from "stream";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

type PdfDoc = InstanceType<typeof PDFDocument>;

function toBuffer(doc: PdfDoc): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const stream = new PassThrough();
    const chunks: Buffer[] = [];

    stream.on("data", (c) => chunks.push(c));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);

    doc.pipe(stream);
    doc.end();
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const product = searchParams.get("product");
    const weightKg = searchParams.get("weightKg");
    const date = searchParams.get("date");
    const warehouse = searchParams.get("warehouse");
    const lang = searchParams.get("lang") || "it";

    if (!id || !product || !weightKg || !date || !warehouse) {
      return NextResponse.json(
        {
          error:
            "Missing query params: id, product, weightKg, date, warehouse (optional: lang)",
        },
        { status: 400 }
      );
    }

    // ✅ Link QR: verifica lotto
    const verifyUrl = `https://www.kilomystery.com/verify/${encodeURIComponent(
      id
    )}`;

    const qr = await QRCode.toDataURL(verifyUrl);

    // ✅ Leggi i font dal filesystem (public/)
    const regularPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "Inter-Regular.ttf"
    );
    const boldPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "Inter-Bold.ttf"
    );

    const regularFont = fs.readFileSync(regularPath);
    const boldFont = fs.readFileSync(boldPath);

    // 4x6 pollici -> 288x432 pt
    const doc = new PDFDocument({
      size: [288, 432],
      margin: 20,
    }) as PdfDoc;

    // ✅ Registra font (da Buffer)
    doc.registerFont("regular", regularFont);
    doc.registerFont("bold", boldFont);

    // ✅ Imposta subito un font di default (così non prova Helvetica)
    doc.font("regular");

    // Header
    doc.font("bold").fontSize(22).text("KiloMystery", { align: "center" });
    doc
      .moveDown(0.3)
      .font("regular")
      .fontSize(10)
      .text("Mystery Box Official", { align: "center" });

    doc.moveDown(1);

    // Info
    doc.font("bold").fontSize(12).text(lang === "it" ? "Prodotto:" : "Product:");
    doc.font("regular").text(product);

    doc.moveDown(0.5);
    doc.font("bold").text(lang === "it" ? "Peso:" : "Weight:");
    doc.font("regular").text(weightKg);

    doc.moveDown(0.5);
    doc.font("bold").text(lang === "it" ? "Data:" : "Date:");
    doc.font("regular").text(date);

    doc.moveDown(0.5);
    doc.font("bold").text(lang === "it" ? "Magazzino:" : "Warehouse:");
    doc.font("regular").text(warehouse);

    doc.moveDown(1);
    doc.font("bold").text("ID Lotto:");
    doc.font("regular").text(id);

    doc.moveDown(1.2);

    // QR
    const qrImage = Buffer.from(qr.replace(/^data:image\/png;base64,/, ""), "base64");
    doc.image(qrImage, 74, doc.y, { width: 140, height: 140 });

    doc.moveDown(8.5);
    doc.fontSize(9).font("regular").text(
      lang === "it" ? "Scansiona per verifica" : "Scan to verify",
      { align: "center" }
    );

    doc.fontSize(8).text("www.kilomystery.com", { align: "center" });

    const buffer = await toBuffer(doc);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=label-${id}.pdf`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("Label API error:", err);
    return NextResponse.json(
      { error: "Failed to generate label", details: err?.message ?? "Unknown" },
      { status: 500 }
    );
  }
}
