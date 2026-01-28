import { NextResponse } from "next/server";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

export const runtime = "nodejs";

// Helper per convertire PDF in Buffer
function toBuffer(doc: PDFDocument): Promise<Buffer> {
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

    // Link QR → verifica lotto
    const verifyUrl = `https://www.kilomystery.com/verify/${id}`;

    // Genera QR
    const qr = await QRCode.toDataURL(verifyUrl);

    // Percorso font
    const regularFont =
      process.cwd() + "/public/fonts/Inter-Regular.ttf";
    const boldFont =
      process.cwd() + "/public/fonts/Inter-Bold.ttf";

    // PDF 4x6 pollici → 288x432 pt
    const doc = new PDFDocument({
      size: [288, 432],
      margin: 20,
    });

    // Registra font
    doc.registerFont("regular", regularFont);
    doc.registerFont("bold", boldFont);

    // Header
    doc
      .font("bold")
      .fontSize(22)
      .text("KiloMystery", { align: "center" });

    doc
      .moveDown(0.3)
      .font("regular")
      .fontSize(10)
      .text("Mystery Box Official", { align: "center" });

    doc.moveDown(1);

    // Info prodotto
    doc.font("bold").fontSize(12).text("Prodotto:");
    doc.font("regular").text(product);

    doc.moveDown(0.5);

    doc.font("bold").text("Peso:");
    doc.font("regular").text(weightKg);

    doc.moveDown(0.5);

    doc.font("bold").text("Data:");
    doc.font("regular").text(date);

    doc.moveDown(0.5);

    doc.font("bold").text("Magazzino:");
    doc.font("regular").text(warehouse);

    doc.moveDown(1);

    // Lotto
    doc.font("bold").text("ID Lotto:");
    doc.font("regular").text(id);

    doc.moveDown(1.2);

    // QR Code
    const qrImage = Buffer.from(
      qr.replace(/^data:image\/png;base64,/, ""),
      "base64"
    );

    doc.image(qrImage, {
      fit: [140, 140],
      align: "center",
    });

    doc.moveDown(0.5);

    doc
      .fontSize(9)
      .font("regular")
      .text("Scansiona per verifica", {
        align: "center",
      });

    // Footer
    doc
      .fontSize(8)
      .text("www.kilomystery.com", {
        align: "center",
      });

    const buffer = await toBuffer(doc);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=label-${id}.pdf`,
      },
    });
  } catch (err: any) {
    console.error("Label API error:", err);

    return NextResponse.json(
      {
        error: "Failed to generate label",
        details: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
