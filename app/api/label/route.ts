import { NextResponse } from "next/server";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";

export const runtime = "nodejs";

type Body = {
  id: string;            // es: KM-20260128-PRM-5KG-0001
  product: string;       // es: Premium Box
  weightKg: string;      // es: 5 KG
  date: string;          // es: 28/01/2026
  warehouse: string;     // es: Brindisi (BR)
  lang?: string;         // es: it | en | es | fr | de
};

function safeLang(l?: string) {
  return ["it", "en", "es", "fr", "de"].includes(String(l)) ? String(l) : "it";
}

function buildPdfBuffer(draw: (doc: PDFKit.PDFDocument) => Promise<void>) {
  return new Promise<Buffer>(async (resolve, reject) => {
    const doc = new PDFDocument({
      size: [288, 432], // 4x6 inch @72dpi
      margin: 14,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      await draw(doc);
      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

async function makePdf(input: Body) {
  const lang = safeLang(input.lang);
  const verifyUrl = `https://www.kilomystery.com/${lang}/verify/${encodeURIComponent(input.id)}`;

  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 0,
    width: 220,
    errorCorrectionLevel: "M",
  });

  const pdf = await buildPdfBuffer(async (doc) => {
    // HEADER
    doc.font("Helvetica-Bold").fontSize(24).text("KILOMYSTERY", { align: "center" });
    doc.moveDown(0.2);
    doc.font("Helvetica").fontSize(11).text("Mystery Box • Official Store", { align: "center" });
    doc.moveDown(1.2);

    const leftX = doc.page.margins.left;
    const startY = doc.y;

    const line = (label: string, value: string) => {
      doc.font("Helvetica-Bold").fontSize(11).text(label, leftX, doc.y, { continued: true });
      doc.font("Helvetica").fontSize(11).text(` ${value}`);
      doc.moveDown(0.35);
    };

    line("PRODOTTO:", input.product);
    line("PESO:", input.weightKg);
    line("ORDINE:", input.id);
    line("DATA:", input.date);
    line("MAGAZZINO:", input.warehouse);

    doc.moveDown(0.8);
    doc.font("Helvetica").fontSize(11).text("www.kilomystery.com", { align: "center" });
    doc.moveDown(0.2);
    doc.font("Helvetica").fontSize(10).fillColor("#666666").text("Scansiona per verifica lotto", {
      align: "center",
    });
    doc.fillColor("#000000");

    // QR
    const qrSize = 140;
    const qrX = (doc.page.width - qrSize) / 2;
    const qrY = startY + 205;

    const base64 = qrDataUrl.split(",")[1];
    const qrBuf = Buffer.from(base64, "base64");

    doc.image(qrBuf, qrX, qrY, { width: qrSize, height: qrSize });

    // URL piccolo sotto
    doc.font("Helvetica")
      .fontSize(7)
      .fillColor("#666666")
      .text(verifyUrl, doc.page.margins.left, qrY + qrSize + 6, {
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        align: "center",
      });

    doc.fillColor("#000000");
  });

  return { pdf, filename: `label-${input.id}.pdf` };
}

/**
 * ✅ GET: apri dal browser e scarichi/stampi
 * Esempio:
 * /api/label?id=KM-20260128-PRM-5KG-0001&product=Premium%20Box&weightKg=5%20KG&date=28%2F01%2F2026&warehouse=Brindisi%20(BR)&lang=it
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const id = url.searchParams.get("id") || "";
    const product = url.searchParams.get("product") || "";
    const weightKg = url.searchParams.get("weightKg") || "";
    const date = url.searchParams.get("date") || "";
    const warehouse = url.searchParams.get("warehouse") || "";
    const lang = url.searchParams.get("lang") || "it";

    if (!id || !product || !weightKg || !date || !warehouse) {
      return NextResponse.json(
        { error: "Missing query params: id, product, weightKg, date, warehouse (and optional lang)" },
        { status: 400 }
      );
    }

    const { pdf, filename } = await makePdf({ id, product, weightKg, date, warehouse, lang });

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        // inline = apre in browser (comodo), attachment = scarica direttamente
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error("Label GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const id = (body.id || "").trim();
    const product = (body.product || "").trim();
    const weightKg = (body.weightKg || "").trim();
    const date = (body.date || "").trim();
    const warehouse = (body.warehouse || "").trim();
    const lang = (body.lang || "it").trim();

    if (!id || !product || !weightKg || !date || !warehouse) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { pdf, filename } = await makePdf({ id, product, weightKg, date, warehouse, lang });

return new NextResponse(pdf, {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Content-Length": String(pdf.length),
    "Cache-Control": "no-store",
  },
});

  } catch (e) {
    console.error("Label POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
