// Unica configurazione IVA e formule economiche per lotto e dashboard generale.
export const POPORAMA_IVA_PERCENTUALE = 22;

export function normalizeGrade(
  value: string
) {
  const grade =
    String(value || "")
      .trim()
      .toUpperCase();

  if (
    grade === "NEW" ||
    grade === "A" ||
    grade === "B" ||
    grade === "C" ||
    grade === "D" ||
    grade === "N"
  ) {
    return grade;
  }

  return "N";
}

export function normalizeSaleStatus(
  value: string
) {
  const status =
    String(value || "")
      .trim()
      .toUpperCase();

  if (
    status === "VENDUTO"
  ) {
    return "VENDUTO";
  }

  return "DISPONIBILE";
}

export function parseShopifyMoney(
  value: string
) {
  if (!value) {
    return 0;
  }

  try {
    const parsed =
      JSON.parse(value);

    const amount =
      Number(
        typeof parsed === "number" || typeof parsed === "string"
          ? parsed
          : parsed?.amount
      );

    if (
      Number.isFinite(
        amount
      )
    ) {
      return roundMoney(
        amount
      );
    }
  } catch {
    const amount =
      Number(
        value.replace(
          ",",
          "."
        )
      );

    if (
      Number.isFinite(
        amount
      )
    ) {
      return roundMoney(
        amount
      );
    }
  }

  return 0;
}

export function roundMoney(
  value: number
) {
  return (
    Math.round(
      (
        value +
        Number.EPSILON
      ) * 100
    ) / 100
  );
}

export function saleTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export type PoporamaGrade = ReturnType<typeof normalizeGrade>;
export type EconomicArticle = {
  grado: string; statoVendita: string; prezzoVendita: number;
  prezzoPoporama: number; retail: number;
};

export function sumMoney(values: number[]) {
  return values.reduce((sum, value) => sum + Math.round(value * 100), 0) / 100;
}

export function calcolaEconomia(investimentoTotale: number, articoli: EconomicArticle[]) {
  const venduti = articoli.filter((articolo) => normalizeSaleStatus(articolo.statoVendita) === "VENDUTO");
  const disponibili = articoli.filter((articolo) => normalizeSaleStatus(articolo.statoVendita) !== "VENDUTO");
  const gradiDisponibili = { NEW: 0, A: 0, B: 0, C: 0, D: 0, N: 0 };
  for (const articolo of disponibili) gradiDisponibili[normalizeGrade(articolo.grado)]++;
  const incassoReale = sumMoney(venduti.map((articolo) => articolo.prezzoVendita));
  const valorePoporamaDisponibile = sumMoney(disponibili.map((articolo) => articolo.prezzoPoporama));
  const valoreRetailDisponibile = sumMoney(disponibili.map((articolo) => articolo.retail));
  const potenzialeTotale = roundMoney(incassoReale + valorePoporamaDisponibile);
  const risultatoPotenziale = roundMoney(potenzialeTotale - investimentoTotale);
  const imponibile = roundMoney(incassoReale / (1 + POPORAMA_IVA_PERCENTUALE / 100));
  return {
    investimentoTotale, incassoReale,
    percentualeVenduta: articoli.length > 0 ? roundMoney(venduti.length / articoli.length * 100) : 0,
    percentualeRecuperata: investimentoTotale > 0 ? roundMoney(incassoReale / investimentoTotale * 100) : null,
    residuoDaRecuperare: roundMoney(Math.max(investimentoTotale - incassoReale, 0)),
    sopraBreakEven: roundMoney(Math.max(incassoReale - investimentoTotale, 0)),
    valorePoporamaDisponibile, valoreRetailDisponibile,
    potenzialeTotale, risultatoPotenziale,
    marginePotenziale: investimentoTotale > 0 ? roundMoney(risultatoPotenziale / investimentoTotale * 100) : null,
    gradiDisponibili,
    // Il recupero investimento resta basato sull'incasso lordo.
    iva: {
      aliquota: POPORAMA_IVA_PERCENTUALE, incassoLordo: incassoReale,
      imponibile, importo: roundMoney(incassoReale - imponibile), incassoNetto: imponibile,
    },
  };
}
