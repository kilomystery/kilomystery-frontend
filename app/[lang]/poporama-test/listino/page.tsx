"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { downloadPoporamaLabelsPdf, type Grade, type LabelData } from "@/app/components/PoporamaLabelPdf";
import { moneyOrNull, resolvePrice, simulateRevenue, type PriceRule } from "@/app/lib/poporama-pricing";
import { parseTestPercentage } from "@/app/lib/poporama-test-pricing";

type Article = {
  id: string; lottoId: string; codicePP: string; nomeProdotto: string; asin: string;
  retail: number; costoManifest: number; cogsDisponibile: boolean; grado: Grade; prezzoPoporama: number;
  prezzoManuale: number | null; prezzoValido: boolean; prezzoLegacy: boolean; updatedAt: string;
  statoVendita: string; categoria: string; numeroSeriale: string; condizioneEstetica: string;
  accessoriMancanti: string; difettiDichiarati: string; dataTest: string; createdAt: string;
};
type Lot = { id: string; handle: string; codiceLotto: string; costoMerce: number; costoTrasporto: number; altriCosti: number };
type Preview = { article: Article; price: number | null; protected: boolean; valid: boolean };
const money = (v: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(v);
const input = "rounded-xl border border-zinc-600 bg-zinc-950 p-3 text-white";
const button = "rounded-xl border border-yellow-400 px-4 py-3 font-bold text-yellow-400 disabled:opacity-40";

export default function ListinoPage() {
  const { lang } = useParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [lot, setLot] = useState("");
  const [untested, setUntested] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [base, setBase] = useState<PriceRule["base"]>("COGS");
  const [percentage, setPercentage] = useState("50");
  const [overwrite, setOverwrite] = useState(false);
  const [preview, setPreview] = useState<Preview[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cost, setCost] = useState("");
  const [vat, setVat] = useState("22");

  async function load() {
    const responses = await Promise.all([fetch("/api/poporama/articoli?details=1", { cache: "no-store" }), fetch("/api/poporama/lotti", { cache: "no-store" })]);
    const [a, l] = await Promise.all(responses.map(r => r.json()));
    if (!responses[0].ok || !a.ok || !responses[1].ok || !l.ok) throw new Error(a.error || l.error || "Caricamento non riuscito.");
    setArticles(a.articoli); setLots(l.lotti);
  }
  useEffect(() => { setBusy(true); load().catch(e => setError(e.message)).finally(() => setBusy(false)); }, []);
  useEffect(() => { setSelected([]); setPreview(null); }, [lot, untested]);
  useEffect(() => { const current = lots.find(l => l.id === lot); setCost(current ? String(current.costoMerce) : ""); }, [lot, lots]);
  useEffect(() => { setPreview(null); }, [base, percentage, overwrite, selected]);

  const visible = articles.filter(a => a.statoVendita !== "VENDUTO" && (!lot || a.lottoId === lot) && (!untested || a.grado === "N"));
  const chosen = visible.filter(a => selected.includes(a.id));
  const rows = preview ?? chosen.map(article => ({ article, price: article.prezzoValido ? article.prezzoPoporama : null, valid: article.prezzoValido, protected: article.prezzoManuale !== null }));
  const totalCents = rows.reduce((s, r) => s + (r.valid && r.price !== null ? Math.round(r.price * 100) : 0), 0);
  const vatRate = parseTestPercentage(vat);
  const netCents = vatRate === null ? null : Math.round(simulateRevenue(rows.map(r => r.valid ? r.price : null), vatRate, null).net * 100);
  const currentLot = lots.find(l => l.id === lot);
  const purchase = moneyOrNull(cost);
  const costsCents = purchase === null ? null : Math.round(purchase * 100) + Math.round((currentLot?.costoTrasporto ?? 0) * 100) + Math.round((currentLot?.altriCosti ?? 0) * 100);

  function makePreview() {
    setError(""); setMessage("");
    const pct = parseTestPercentage(percentage);
    if (pct === null || !chosen.length) { setError("Seleziona gli articoli e una percentuale da 0 a 100 con massimo due decimali."); return; }
    if (chosen.some(a => a.grado === "D")) { setError("Riclassifica gli articoli legacy D prima di applicare prezzi in massa."); return; }
    setPreview(chosen.map(article => {
      const protectedPrice = !overwrite && article.prezzoManuale !== null;
      const result = resolvePrice({ manual: protectedPrice ? article.prezzoManuale : null, rule: { base, percentage: pct }, grade: article.grado, retail: article.retail, cogs: article.cogsDisponibile ? article.costoManifest : null });
      return { article, ...result, protected: protectedPrice };
    }));
  }
  async function apply() {
    if (!preview || busy) return;
    setBusy(true); setError(""); setMessage("");
    let saved = 0;
    try {
      for (const row of preview) {
        if (row.protected) continue;
        const response = await fetch(`/api/poporama/articoli/${encodeURIComponent(row.article.codicePP)}/test`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pricingOnly: true, regolaPrezzo: { base, percentage: parseTestPercentage(percentage) }, sovrascriviManuale: overwrite, expectedUpdatedAt: row.article.updatedAt }),
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(`${row.article.codicePP}: ${result.error || "Salvataggio fallito"}`);
        if (!result.skipped) saved++;
        setMessage(`Salvati ${saved} articoli…`);
      }
      setMessage(`Completato: ${saved} prezzi/regole salvati. I prezzi protetti sono stati mantenuti.`);
    } catch (e) { setError(`${e instanceof Error ? e.message : "Errore"}. Salvati ${saved} articoli; gli altri non sono stati modificati. Aggiorna l’anteprima prima di riprovare.`); }
    finally { setPreview(null); try { await load(); } catch (e) { setError(String(e)); } setBusy(false); }
  }
  async function print() {
    setBusy(true); setError("");
    try {
      // Nuova lettura: la stampa usa esclusivamente prezzi persistiti.
      const response = await fetch("/api/poporama/articoli?details=1", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Lettura prezzi non riuscita");
      const fresh = (result.articoli as Article[]).filter(a => selected.includes(a.id) && a.statoVendita !== "VENDUTO");
      if (fresh.length !== chosen.length) throw new Error("La selezione è cambiata. Ricarica il listino prima di stampare.");
      const labels: LabelData[] = fresh.map(a => ({ code: a.codicePP, brand: "", model: a.nomeProdotto, productType: a.categoria || "Articolo POPORAMA",
        grade: a.grado || "N", referencePrice: a.retail.toFixed(2), poporamaPrice: a.prezzoPoporama.toFixed(2), priceValid: a.prezzoValido,
        serial: a.numeroSeriale, cosmeticCondition: a.condizioneEstetica, missingAccessories: a.accessoriMancanti, defects: a.difettiDichiarati,
        testDate: a.grado === "N" ? a.createdAt?.slice(0, 10) : a.dataTest?.slice(0, 10) }));
      await downloadPoporamaLabelsPdf(labels, "POPORAMA_LISTINO.pdf");
      setArticles(result.articoli);
    } catch (e) { setError(e instanceof Error ? e.message : "Errore PDF"); }
    finally { setBusy(false); }
  }
  async function saveCost() {
    if (!currentLot || purchase === null) { setError("Seleziona un carico e inserisci un costo valido."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/poporama/lotti", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ handle: currentLot.handle, costoMerce: purchase }) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Costo non salvato");
      await load(); setMessage("Costo di acquisto del carico salvato.");
    } catch (e) { setError(e instanceof Error ? e.message : "Errore costo"); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-zinc-950 p-6 text-white"><div className="mx-auto max-w-7xl space-y-6">
    <a href={`/${lang}/poporama-test`} className="text-yellow-400">← Dashboard</a>
    <h1 className="text-3xl font-black text-yellow-400">Listino / Stampa</h1>
    <p className="text-zinc-400">Seleziona lo stock disponibile, verifica l’anteprima e salva le regole prima della stampa. Ogni codice PP identifica un singolo pezzo, anche con ASIN uguale.</p>
    <fieldset disabled={busy} className="space-y-5 rounded-2xl border border-zinc-700 p-5 disabled:opacity-60">
      <div className="flex flex-wrap items-center gap-4">
        <label>Carico <select aria-label="Carico" className={input} value={lot} onChange={e => setLot(e.target.value)}><option value="">Tutti i carichi</option>{lots.map(l => <option key={l.id} value={l.id}>{l.codiceLotto}</option>)}</select></label>
        <label><input type="checkbox" checked={untested} onChange={e => setUntested(e.target.checked)} /> Solo non testati (N)</label>
        <button className={button} onClick={() => setSelected(visible.map(a => a.id))}>Seleziona tutti ({visible.length})</button>
        <button className={button} onClick={() => setSelected([])}>Deseleziona</button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label>Base <select className={input} value={base} onChange={e => setBase(e.target.value as PriceRule["base"])}><option>COGS</option><option>RETAIL</option></select></label>
        <label>Percentuale % <input aria-label="Percentuale massiva" className={input} inputMode="decimal" value={percentage} onChange={e => setPercentage(e.target.value)} /></label>
        <label><input type="checkbox" checked={overwrite} onChange={e => setOverwrite(e.target.checked)} /> Sovrascrivi anche i prezzi manuali e storici</label>
        <button className={button} onClick={makePreview} disabled={!chosen.length}>Anteprima prezzi</button>
        <button className={button} onClick={apply} disabled={!preview}>Conferma e salva regole</button>
      </div>
      <p className="text-sm text-zinc-400">I prezzi storici senza provenienza sono protetti come manuali. Gli articoli senza base valida restano da verificare e non ricevono un prezzo inventato.</p>
      <button className={button} onClick={print} disabled={!chosen.length || !!preview}>PDF unico delle etichette selezionate</button>
      {preview && <p className="text-yellow-300">Anteprima non salvata. Conferma per salvare o modifica i parametri per annullarla.</p>}
    </fieldset>
    {busy && <p role="status">Operazione in corso… {message}</p>}
    {error && <p role="alert" className="text-red-300">{error}</p>}
    {!busy && message && <p role="status" className="text-green-300">{message}</p>}
    <section className="space-y-4 rounded-2xl border border-zinc-700 p-5">
      <h2 className="text-xl font-bold">Simulazione incasso {preview ? "(anteprima)" : "(prezzi salvati)"}</h2>
      <div className="flex flex-wrap gap-4">
        <label>IVA stimata % <input disabled={busy} className={input} inputMode="decimal" value={vat} onChange={e => setVat(e.target.value)} /></label>
        <label>Costo acquisto carico € <input disabled={busy} className={input} inputMode="decimal" value={cost} onChange={e => setCost(e.target.value)} /></label>
        <button className={button} disabled={busy || !currentLot} onClick={saveCost}>Salva costo nel carico</button>
      </div>
      <p className="text-sm text-zinc-400">Costo effettivo di acquisto, separato dal COGS del manifest. Trasporto e altri costi del carico: {money((currentLot?.costoTrasporto ?? 0) + (currentLot?.altriCosti ?? 0))}. Il margine usa l’imponibile stimato meno questi costi e il costo acquisto. Con una selezione parziale sottrae comunque il costo intero del carico.</p>
      <dl className="grid gap-4 sm:grid-cols-3">
        {[["Quantità articoli", rows.length], ["Totale IVA inclusa", money(totalCents / 100)], ["Imponibile stimato", netCents === null ? "IVA non valida" : money(netCents / 100)],
          ["Margine lordo teorico", netCents === null || costsCents === null ? "Inserisci costo e IVA validi" : money((netCents - costsCents) / 100)], ["Senza prezzo valido", rows.filter(r => !r.valid).length]].map(([label, value]) => <div key={label}><dt className="text-zinc-400">{label}</dt><dd className="text-xl font-bold">{value}</dd></div>)}
      </dl>
    </section>
    <div className="max-h-[600px] overflow-auto"><table className="w-full text-left text-sm"><thead><tr><th>Selezione</th><th>Codice / prodotto</th><th>Grado</th><th>Uscita Amazon</th><th>COGS</th><th>Prezzo salvato</th>{preview && <th>Anteprima</th>}</tr></thead><tbody>
      {visible.map(a => { const row = preview?.find(r => r.article.id === a.id); return <tr key={a.id} className="border-t border-zinc-800">
        <td><input aria-label={`Seleziona ${a.codicePP}`} disabled={busy} type="checkbox" checked={selected.includes(a.id)} onChange={e => setSelected(ids => e.target.checked ? [...ids, a.id] : ids.filter(id => id !== a.id))} /></td>
        <td className="p-3"><a className="text-yellow-400" href={`/${lang}/poporama-test/articoli/${a.codicePP}/test`}>{a.codicePP}</a><p>{a.nomeProdotto}</p></td><td>{a.grado}</td><td>{money(a.retail)}</td><td>{a.cogsDisponibile ? money(a.costoManifest) : "Assente"}</td>
        <td>{a.prezzoValido ? money(a.prezzoPoporama) : "Da verificare"}{a.prezzoManuale !== null && <p className="text-xs text-zinc-400">{a.prezzoLegacy ? "Storico protetto" : "Manuale"}</p>}</td>
        {preview && <td>{row ? row.valid && row.price !== null ? `${money(row.price)}${row.protected ? " (protetto)" : ""}` : "Da verificare" : "—"}</td>}
      </tr>; })}
    </tbody></table></div>
  </div></main>;
}
