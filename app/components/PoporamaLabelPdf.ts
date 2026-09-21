import {
  PDFDocument,
  PDFPage,
  PDFFont,
  StandardFonts,
  rgb,
} from "pdf-lib";
import QRCode from "qrcode";

export type Grade =
  | "NEW"
  | "A"
  | "B"
  | "C"
  | "D"
  | "N";

export type LabelData = {
  code: string;
  brand: string;
  model: string;
  productType: string;

  serial?: string;
  originCondition?: string;
  cosmeticCondition?: string;
  missingAccessories?: string;
  defects?: string;

  referencePrice?: string;
  poporamaPrice?: string;

  grade: Grade;
  testDate: string;
};

const MM_TO_PT = 72 / 25.4;

const A6_WIDTH =
  105 * MM_TO_PT;

const A6_HEIGHT =
  148 * MM_TO_PT;

// ============================================================
// ETICHETTA SINGOLA
// ============================================================

export async function downloadPoporamaLabelPdf(
  data: LabelData
) {
  const pdfDoc =
    await PDFDocument.create();

  const regularFont =
    await pdfDoc.embedFont(
      StandardFonts.Helvetica
    );

  const boldFont =
    await pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );

  await addPoporamaLabelPage(
    pdfDoc,
    data,
    regularFont,
    boldFont
  );

  const pdfBytes =
    await pdfDoc.save();

  downloadPdfBytes(
    pdfBytes,
    createFileName(data)
  );
}

// ============================================================
// ETICHETTE MULTIPLE
//
// Crea UN SOLO PDF:
// 1 articolo = 1 pagina A6
// ============================================================

export async function downloadPoporamaLabelsPdf(
  labels: LabelData[],
  fileName = "POPORAMA_ETICHETTE.pdf"
) {
  if (!labels.length) {
    throw new Error(
      "Nessuna etichetta da generare."
    );
  }

  const pdfDoc =
    await PDFDocument.create();

  const regularFont =
    await pdfDoc.embedFont(
      StandardFonts.Helvetica
    );

  const boldFont =
    await pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );

  for (
    let index = 0;
    index < labels.length;
    index += 1
  ) {
    await addPoporamaLabelPage(
      pdfDoc,
      labels[index],
      regularFont,
      boldFont
    );

    /*
     * Ogni QR viene generato
     * separatamente perché contiene
     * il PP specifico dell'articolo.
     *
     * Per 599 articoli può richiedere
     * alcuni secondi.
     */
    if (
      index > 0 &&
      index % 50 === 0
    ) {
      await yieldToBrowser();
    }
  }

  const pdfBytes =
    await pdfDoc.save();

  downloadPdfBytes(
    pdfBytes,
    fileName
  );
}

// ============================================================
// CREA UNA PAGINA A6
// ============================================================

async function addPoporamaLabelPage(
  pdfDoc: PDFDocument,
  data: LabelData,
  regularFont: PDFFont,
  boldFont: PDFFont
) {
  const page =
    pdfDoc.addPage([
      A6_WIDTH,
      A6_HEIGHT,
    ]);

  const black =
    rgb(0, 0, 0);

  const white =
    rgb(1, 1, 1);

  const gray =
    rgb(
      0.35,
      0.35,
      0.35
    );

  const margin = 17;

  let y =
    A6_HEIGHT - 22;

  // ==========================================================
  // POPORAMA
  // ==========================================================

  drawCenteredText(
    page,
    "POPORAMA",
    y,
    21,
    boldFont,
    black
  );

  y -= 15;

  drawCenteredText(
    page,
    "I MIGLIORI MARCHI A PREZZI POPOLARI",
    y,
    7,
    boldFont,
    black
  );

  y -= 10;

  page.drawLine({
    start: {
      x: margin,
      y,
    },

    end: {
      x:
        A6_WIDTH -
        margin,
      y,
    },

    thickness: 2,
    color: black,
  });

  y -= 17;

  // ==========================================================
  // TIPO PRODOTTO
  // ==========================================================

  const productType =
    cleanPdfText(
      data.productType ||
        "ARTICOLO"
    );

  drawCenteredTextFit(
    page,
    productType.toUpperCase(),
    y,
    7,
    5,
    boldFont,
    gray,
    A6_WIDTH -
      margin * 2
  );

  y -= 15;

  // ==========================================================
  // NOME PRODOTTO
  // ==========================================================

  const productName =
    cleanPdfText(
      `${data.brand || ""} ${
        data.model || ""
      }`
    )
      .trim()
      .toUpperCase() ||
    "PRODOTTO";

  drawCenteredTextFit(
    page,
    productName,
    y,
    16,
    7,
    boldFont,
    black,
    A6_WIDTH -
      margin * 2
  );

  y -= 25;

  // ==========================================================
  // BOX GRADO
  // ==========================================================

  const gradeBoxHeight =
    105;

  page.drawRectangle({
    x: margin,

    y:
      y -
      gradeBoxHeight,

    width:
      A6_WIDTH -
      margin * 2,

    height:
      gradeBoxHeight,

    borderColor: black,
    borderWidth: 3,
  });

  drawCenteredText(
    page,
    "GRADO",
    y - 15,
    9,
    boldFont,
    black
  );

  drawCenteredTextFit(
    page,
    data.grade === "NEW" ? "NUOVO" : data.grade,
    y - 76,
    61,
    24,
    boldFont,
    black,
    A6_WIDTH - margin * 2 - 12
  );

  drawCenteredTextFit(
    page,
    getGradeDescription(
      data.grade
    ),
    y - 96,
    8,
    5.5,
    boldFont,
    black,
    A6_WIDTH -
      margin * 2 -
      12
  );

  y -=
    gradeBoxHeight +
    10;

  // ==========================================================
  // DIFETTO C / D
  // ==========================================================

  if (
    data.defects &&
    (
      data.grade === "C" ||
      data.grade === "D"
    )
  ) {
    const defectText =
      truncate(
        cleanPdfText(
          data.defects
        ),
        95
      );

    page.drawRectangle({
      x: margin,

      y: y - 34,

      width:
        A6_WIDTH -
        margin * 2,

      height: 34,

      borderColor:
        black,

      borderWidth:
        1.5,
    });

    page.drawText(
      "DIFETTO DICHIARATO",
      {
        x:
          margin +
          6,

        y:
          y -
          11,

        size: 6.5,
        font: boldFont,
        color: black,
      }
    );

    drawWrappedText(
      page,
      defectText,
      margin + 6,
      y - 21,

      A6_WIDTH -
        margin * 2 -
        12,

      7,
      8,
      boldFont,
      black,
      2
    );

    y -= 41;
  }

  // ==========================================================
  // CONDIZIONI
  // ==========================================================

  y = drawInfoRow(
    page,
    "Condizione",

    cleanPdfText(
      data.originCondition ||
        "-"
    ),

    margin,
    y,
    boldFont,
    regularFont
  );

  y = drawInfoRow(
    page,
    "Estetica",

    cleanPdfText(
      data.cosmeticCondition ||
        "Non indicata"
    ),

    margin,
    y,
    boldFont,
    regularFont
  );

  y = drawInfoRow(
    page,
    "Accessori",

    cleanPdfText(
      data.missingAccessories
        ? `Mancanti: ${data.missingAccessories}`
        : "Nessuna mancanza dichiarata"
    ),

    margin,
    y,
    boldFont,
    regularFont
  );

  // ==========================================================
  // PREZZO DI RIFERIMENTO
  // ==========================================================

  y -= 4;

  page.drawLine({
    start: {
      x: margin,
      y,
    },

    end: {
      x:
        A6_WIDTH -
        margin,
      y,
    },

    thickness:
      0.8,

    color: black,
  });

  y -= 16;

  if (
    hasPrice(
      data.referencePrice
    )
  ) {
    page.drawText(
      "PREZZO DI RIFERIMENTO",
      {
        x: margin,
        y,

        size: 6.5,
        font: boldFont,
        color: black,
      }
    );

    const referenceText =
      formatPrice(
        data.referencePrice!
      );

    const referenceSize =
      12;

    const referenceWidth =
      boldFont.widthOfTextAtSize(
        referenceText,
        referenceSize
      );

    const referenceX =
      A6_WIDTH -
      margin -
      referenceWidth;

    page.drawText(
      referenceText,
      {
        x:
          referenceX,

        y:
          y -
          2,

        size:
          referenceSize,

        font:
          boldFont,

        color:
          black,
      }
    );

    // SBARRATURA RETAIL

    page.drawLine({
      start: {
        x:
          referenceX -
          2,

        y:
          y +
          4,
      },

      end: {
        x:
          referenceX +
          referenceWidth +
          2,

        y:
          y +
          4,
      },

      thickness:
        1.7,

      color:
        black,
    });

    y -= 18;
  }

  // ==========================================================
  // PREZZO POPORAMA
  //
  // IMPORTANTE:
  // viene mostrato ANCHE per il grado N.
  // ==========================================================

  if (
    hasPrice(
      data.poporamaPrice
    )
  ) {
    const priceBoxHeight =
      48;

    page.drawRectangle({
      x: margin,

      y:
        y -
        priceBoxHeight,

      width:
        A6_WIDTH -
        margin * 2,

      height:
        priceBoxHeight,

      color: black,
    });

    drawCenteredText(
      page,
      "PREZZO POPORAMA",
      y - 12,
      7,
      boldFont,
      white
    );

    drawCenteredText(
      page,

      formatPrice(
        data.poporamaPrice!
      ),

      y - 38,
      22,
      boldFont,
      white
    );

    y -=
      priceBoxHeight +
      8;
  }

  // ==========================================================
  // CODICE PP
  // ==========================================================

  page.drawLine({
    start: {
      x: margin,
      y,
    },

    end: {
      x:
        A6_WIDTH -
        margin,
      y,
    },

    thickness:
      0.8,

    color:
      black,
  });

  y -= 13;

  page.drawText(
    cleanPdfText(
      data.code
    ),
    {
      x: margin,
      y,

      size: 10,
      font: boldFont,
      color: black,
    }
  );

  // ==========================================================
  // DATA
  // ==========================================================

  y -= 11;

  const dateLabel =
    data.grade === "NEW"
      ? "Classificato"
      : data.grade === "N"
        ? "Registrato"
        : "Test";

  page.drawText(
    `${dateLabel}: ${
      cleanPdfText(
        data.testDate ||
          "-"
      )
    }`,
    {
      x: margin,
      y,

      size: 6.5,
      font: regularFont,
      color: black,
    }
  );

  // ==========================================================
  // SERIALE
  // ==========================================================

  if (data.serial) {
    y -= 9;

    page.drawText(
      `Seriale: ${truncate(
        cleanPdfText(
          data.serial
        ),
        28
      )}`,
      {
        x: margin,
        y,

        size: 6.5,
        font: regularFont,
        color: black,
      }
    );
  }

  // ==========================================================
  // QR CODE
  // ==========================================================

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL
      ?.trim()
      .replace(/\/+$/, "");

  if (!siteUrl) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL non configurato."
    );
  }

  const qrValue =
    `${siteUrl}/it/poporama-test/articoli/${encodeURIComponent(
      data.code
    )}`;

  const qrDataUrl =
    await QRCode.toDataURL(
      qrValue,
      {
        margin: 0,
        width: 220,

        errorCorrectionLevel:
          "M",
      }
    );

  const qrBase64 =
    qrDataUrl.split(
      ","
    )[1];

  const qrBytes =
    base64ToUint8Array(
      qrBase64
    );

  const qrImage =
    await pdfDoc.embedPng(
      qrBytes
    );

  const qrSize = 47;

  page.drawImage(
    qrImage,
    {
      x:
        A6_WIDTH -
        margin -
        qrSize,

      y: 17,

      width:
        qrSize,

      height:
        qrSize,
    }
  );

  // ==========================================================
  // FOOTER
  // ==========================================================

  page.drawText(
    data.grade === "NEW"
      ? "Prodotto classificato come NUOVO da POPORAMA"
      : data.grade === "N"
        ? "Articolo registrato POPORAMA - non ancora testato"
        : "Prodotto controllato e classificato da POPORAMA",
    {
      x: margin,
      y: 9,

      size: 5,
      font: regularFont,
      color: gray,
    }
  );
}

// ============================================================
// DOWNLOAD
// ============================================================

function downloadPdfBytes(
  pdfBytes: Uint8Array,
  fileName: string
) {
  const blob =
    new Blob(
      [
        new Uint8Array(
          pdfBytes
        ),
      ],
      {
        type:
          "application/pdf",
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href = url;

  link.download =
    fileName;

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  setTimeout(() => {
    URL.revokeObjectURL(
      url
    );
  }, 1500);
}

// ============================================================
// TESTO CENTRATO
// ============================================================

function drawCenteredText(
  page: PDFPage,
  text: string,
  y: number,
  size: number,
  font: PDFFont,
  color: ReturnType<
    typeof rgb
  >
) {
  const safeText =
    cleanPdfText(text);

  const width =
    font.widthOfTextAtSize(
      safeText,
      size
    );

  page.drawText(
    safeText,
    {
      x:
        (
          A6_WIDTH -
          width
        ) / 2,

      y,
      size,
      font,
      color,
    }
  );
}

// ============================================================
// TESTO CENTRATO CON RIDUZIONE FONT
// ============================================================

function drawCenteredTextFit(
  page: PDFPage,
  text: string,
  y: number,
  startSize: number,
  minSize: number,
  font: PDFFont,
  color: ReturnType<
    typeof rgb
  >,
  maxWidth: number
) {
  const safeText =
    cleanPdfText(text);

  let size =
    startSize;

  while (
    font.widthOfTextAtSize(
      safeText,
      size
    ) >
      maxWidth &&
    size >
      minSize
  ) {
    size -= 0.5;
  }

  let finalText =
    safeText;

  if (
    font.widthOfTextAtSize(
      finalText,
      size
    ) >
    maxWidth
  ) {
    finalText =
      fitText(
        finalText,
        font,
        size,
        maxWidth
      );
  }

  drawCenteredText(
    page,
    finalText,
    y,
    size,
    font,
    color
  );
}

// ============================================================
// RIGA INFORMAZIONE
// ============================================================

function drawInfoRow(
  page: PDFPage,
  label: string,
  value: string,
  x: number,
  y: number,
  boldFont: PDFFont,
  regularFont: PDFFont
) {
  const labelText =
    `${label}:`;

  page.drawText(
    labelText,
    {
      x,
      y,

      size: 6.5,
      font: boldFont,

      color:
        rgb(
          0,
          0,
          0
        ),
    }
  );

  const labelWidth =
    boldFont.widthOfTextAtSize(
      labelText,
      6.5
    );

  const availableWidth =
    A6_WIDTH -
    x -
    17 -
    labelWidth -
    5;

  const valueText =
    fitText(
      cleanPdfText(
        value
      ),
      regularFont,
      6.5,
      availableWidth
    );

  page.drawText(
    valueText,
    {
      x:
        x +
        labelWidth +
        4,

      y,

      size: 6.5,

      font:
        regularFont,

      color:
        rgb(
          0,
          0,
          0
        ),
    }
  );

  return y - 11;
}

// ============================================================
// TESTO MULTIRIGA
// ============================================================

function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  lineHeight: number,
  font: PDFFont,
  color: ReturnType<
    typeof rgb
  >,
  maxLines: number
) {
  const safeText =
    cleanPdfText(text);

  const words =
    safeText.split(
      /\s+/
    );

  const lines:
    string[] = [];

  let currentLine =
    "";

  for (
    const word of words
  ) {
    const testLine =
      currentLine
        ? `${currentLine} ${word}`
        : word;

    const width =
      font.widthOfTextAtSize(
        testLine,
        fontSize
      );

    if (
      width <=
      maxWidth
    ) {
      currentLine =
        testLine;
    } else {
      if (
        currentLine
      ) {
        lines.push(
          currentLine
        );
      }

      currentLine =
        word;

      if (
        lines.length >=
        maxLines
      ) {
        break;
      }
    }
  }

  if (
    currentLine &&
    lines.length <
      maxLines
  ) {
    lines.push(
      currentLine
    );
  }

  lines
    .slice(
      0,
      maxLines
    )
    .forEach(
      (
        line,
        index
      ) => {
        page.drawText(
          line,
          {
            x,

            y:
              y -
              index *
                lineHeight,

            size:
              fontSize,

            font,
            color,
          }
        );
      }
    );
}

// ============================================================
// RIDUZIONE TESTO
// ============================================================

function fitText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
) {
  const safeText =
    cleanPdfText(text);

  if (
    font.widthOfTextAtSize(
      safeText,
      fontSize
    ) <= maxWidth
  ) {
    return safeText;
  }

  let shortened =
    safeText;

  while (
    shortened.length >
      3 &&
    font.widthOfTextAtSize(
      `${shortened}...`,
      fontSize
    ) >
      maxWidth
  ) {
    shortened =
      shortened.slice(
        0,
        -1
      );
  }

  return `${shortened}...`;
}

// ============================================================
// TRONCA STRINGA
// ============================================================

function truncate(
  text: string,
  maxLength: number
) {
  if (
    text.length <=
    maxLength
  ) {
    return text;
  }

  return `${text.slice(
    0,
    maxLength - 3
  )}...`;
}

// ============================================================
// PREZZO
// ============================================================

function hasPrice(
  value?: string
) {
  if (
    value === undefined ||
    value === null ||
    value.trim() === ""
  ) {
    return false;
  }

  const number =
    Number(
      value
        .trim()
        .replace(
          ",",
          "."
        )
    );

  return (
    Number.isFinite(
      number
    ) &&
    number >= 0
  );
}

function formatPrice(
  value: string
) {
  const number =
    Number(
      value
        .trim()
        .replace(
          ",",
          "."
        )
    );

  if (
    !Number.isFinite(
      number
    )
  ) {
    return "€ 0,00";
  }

  return new Intl.NumberFormat(
    "it-IT",
    {
      style:
        "currency",

      currency:
        "EUR",
    }
  ).format(
    number
  );
}

// ============================================================
// DESCRIZIONE GRADO
// ============================================================

function getGradeDescription(
  grade: Grade
) {
  switch (grade) {
    case "NEW":
      return "PRODOTTO NUOVO";

    case "A":
      return "TESTATO - PIENAMENTE FUNZIONANTE";

    case "B":
      return "TESTATO - FUNZIONANTE CON INCOMPLETEZZA";

    case "C":
      return "TESTATO - NON FUNZIONANTE";

    case "D":
      return "LEGACY - NON FUNZIONANTE / RICAMBI";

    case "N":
      return "NON TESTATO";

    default:
      return "";
  }
}

// ============================================================
// NOME FILE SINGOLO
// ============================================================

function createFileName(
  data: LabelData
) {
  const clean = (
    value: string
  ) =>
    value
      .trim()
      .toUpperCase()
      .replace(
        /[^A-Z0-9]+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      );

  return [
    "POPORAMA",
    clean(
      data.code
    ),
    clean(
      data.brand
    ),
    clean(
      data.model
    ),
    `GRADO-${data.grade === "NEW" ? "NUOVO" : data.grade}`,
  ]
    .filter(Boolean)
    .join("_")
    .concat(".pdf");
}

// ============================================================
// BASE64 -> UINT8ARRAY
//
// Non dipende direttamente da atob.
// Funziona nel browser moderno.
// ============================================================

function base64ToUint8Array(
  base64: string
) {
  const binary =
    window.atob(
      base64
    );

  const bytes =
    new Uint8Array(
      binary.length
    );

  for (
    let index = 0;
    index <
    binary.length;
    index += 1
  ) {
    bytes[index] =
      binary.charCodeAt(
        index
      );
  }

  return bytes;
}

// ============================================================
// PULIZIA TESTO PER HELVETICA PDF
//
// I manifest possono contenere caratteri Unicode
// non supportati da StandardFonts.Helvetica.
// Evitiamo che una singola descrizione faccia fallire
// l'intero PDF da centinaia di pagine.
// ============================================================

function cleanPdfText(
  value: string
) {
  return String(
    value || ""
  )
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[\u2018\u2019]/g,
      "'"
    )
    .replace(
      /[\u201C\u201D]/g,
      '"'
    )
    .replace(
      /[\u2013\u2014]/g,
      "-"
    )
    .replace(
      /\u2026/g,
      "..."
    )
    .replace(
      /[^\x20-\x7E\u00A0-\u00FF]/g,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

// ============================================================
// LASCIA RESPIRARE IL BROWSER
// ============================================================

function yieldToBrowser() {
  return new Promise<void>(
    (resolve) => {
      setTimeout(
        resolve,
        0
      );
    }
  );
}