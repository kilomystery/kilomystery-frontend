import { calcolaEconomia, normalizeGrade, normalizeSaleStatus, parseShopifyMoney, saleTimestamp, sumMoney } from "./poporama-economics";

export type DashboardNode = {
  id: string; handle: string; createdAt?: string;
  fields: { key: string; value: string | null }[];
};

const field = (node: DashboardNode, key: string) => node.fields.find((item) => item.key === key)?.value || "";

export function aggregateDashboard(lottoNodes: DashboardNode[], articleNodes: DashboardNode[]) {
  // Il GID identifica l'articolo, anche se ricompare in pagine diverse.
  const uniqueLotti = [...new Map(lottoNodes.map((node) => [node.id, node])).values()];
  const uniqueArticles = [...new Map(articleNodes.map((node) => [node.id, node])).values()];
  const lotti = uniqueLotti.map((node) => ({
    id: node.id, handle: node.handle, codiceLotto: field(node, "codice_lotto") || node.handle,
    dataAcquisto: field(node, "data_acquisto"), createdAt: node.createdAt || "",
    fornitore: field(node, "fornitore"), provenienza: field(node, "provenienza"),
    riferimentoAcquisto: field(node, "riferimento_acquisto"),
    costoTotale: parseShopifyMoney(field(node, "costo_totale")),
  })).sort((a, b) => saleTimestamp(b.dataAcquisto) - saleTimestamp(a.dataAcquisto) ||
    saleTimestamp(b.createdAt) - saleTimestamp(a.createdAt) || a.id.localeCompare(b.id));
  const byId = new Map(lotti.map((lotto) => [lotto.id, lotto]));
  const articles = uniqueArticles.map((node) => ({
    id: node.id, lottoId: field(node, "lotto"), codicePP: field(node, "codice_pp"),
    nomeProdotto: field(node, "nome_prodotto"), grado: normalizeGrade(field(node, "grado")),
    statoVendita: normalizeSaleStatus(field(node, "stato_vendita")),
    prezzoVendita: parseShopifyMoney(field(node, "prezzo_vendita")),
    prezzoPoporama: parseShopifyMoney(field(node, "prezzo_poporama")),
    retail: parseShopifyMoney(field(node, "retail")), dataVendita: field(node, "data_vendita"),
  }));
  const groups = new Map(lotti.map((lotto) => [lotto.id, [] as typeof articles]));
  const linked: typeof articles = [];
  let senzaReference = 0;
  let lottoNonTrovato = 0;
  for (const article of articles) {
    const group = groups.get(article.lottoId);
    if (!group) {
      if (article.lottoId) lottoNonTrovato++;
      else senzaReference++;
      continue;
    }
    group.push(article);
    linked.push(article);
  }
  const economia = calcolaEconomia(sumMoney(lotti.map((lotto) => lotto.costoTotale)), linked);
  const sold = linked.filter((article) => article.statoVendita === "VENDUTO");
  const andamento = lotti.map((lotto) => {
    const items = groups.get(lotto.id)!;
    const e = calcolaEconomia(lotto.costoTotale, items);
    const venduti = items.filter((item) => item.statoVendita === "VENDUTO").length;
    return { ...lotto, pezzi: items.length, venduti, disponibili: items.length - venduti,
      incassoReale: e.incassoReale, percentualeRecuperata: e.percentualeRecuperata,
      residuoDaRecuperare: e.residuoDaRecuperare, valoreStockResiduo: e.valorePoporamaDisponibile,
      stato: e.incassoReale >= lotto.costoTotale ? "RECUPERATO" : "DA RECUPERARE" };
  });
  const ultimeVendite = sold.sort((a, b) => saleTimestamp(b.dataVendita) - saleTimestamp(a.dataVendita) ||
    a.codicePP.localeCompare(b.codicePP) || a.id.localeCompare(b.id)).slice(0, 10).map((article) => ({
      id: article.id, codicePP: article.codicePP, nomeProdotto: article.nomeProdotto,
      grado: article.grado, prezzoPoporama: article.prezzoPoporama,
      prezzoVendita: article.prezzoVendita, dataVendita: article.dataVendita,
      codiceLotto: byId.get(article.lottoId)!.codiceLotto, lottoHandle: byId.get(article.lottoId)!.handle,
    }));
  return {
    generale: { numeroLotti: lotti.length, capitaleInvestito: economia.investimentoTotale,
      pezziTotali: linked.length, venduti: sold.length, disponibili: linked.length - sold.length,
      percentualeVenduta: economia.percentualeVenduta,
      articoliSenzaLotto: senzaReference + lottoNonTrovato, senzaReference, lottoNonTrovato },
    incassoReale: economia.incassoReale,
    iva: economia.iva,
    recupero: { percentuale: economia.percentualeRecuperata, residuo: economia.residuoDaRecuperare, sopraBreakEven: economia.sopraBreakEven },
    stock: { gradi: economia.gradiDisponibili, valorePoporama: economia.valorePoporamaDisponibile,
      valoreRetail: economia.valoreRetailDisponibile, hasLegacyD: linked.some((article) => article.grado === "D") },
    potenziale: { totale: economia.potenzialeTotale, risultato: economia.risultatoPotenziale, margine: economia.marginePotenziale },
    lotti: andamento, ultimeVendite,
  };
}

export type DashboardData = ReturnType<typeof aggregateDashboard>;
