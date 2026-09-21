"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { logoutPoporama } from "@/app/lib/poporama-logout";
import { useParams } from "next/navigation";
import type { DashboardData } from "@/app/lib/poporama-dashboard";
import type { PoporamaGrade } from "@/app/lib/poporama-economics";

export default function PoporamaDashboardPage() {
  const params = useParams();
  const lang = typeof params.lang === "string" ? params.lang : "it";
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [search, setSearch] = useState("");
  const controllerRef = useRef<AbortController | null>(null);

  const loadDashboard = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const response = await fetch("/api/poporama/dashboard", { cache: "no-store", signal: controller.signal });
      const result = await response.json() as DashboardData & { ok: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Impossibile caricare la dashboard.");
      if (!controller.signal.aborted) setData(result);
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Errore caricamento dashboard.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    return () => controllerRef.current?.abort();
  }, [loadDashboard]);

  const filteredLotti = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data?.lotti ?? []).filter((lotto) => !term ||
      [lotto.codiceLotto, lotto.fornitore, lotto.provenienza, lotto.riferimentoAcquisto]
        .some((value) => value.toLowerCase().includes(term)));
  }, [data, search]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8 sm:py-12">
        <header className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">POPORAMA</p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">Dashboard generale</h1>
            <p className="mt-3 max-w-2xl text-zinc-400">Tutti i lotti, le vendite reali e lo stock disponibile. I pezzi sono gli articoli censiti, non quelli dichiarati nei manifest.</p>
          </div>
          <nav aria-label="Azioni POPORAMA" className="flex flex-wrap gap-3">
            <a href={`/${lang}/poporama-test/lotti`} className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400">LOTTI</a>
            <a href={`/${lang}/poporama-test/cassa`} className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400">APRI CASSA</a>
            <a href={`/${lang}/poporama-test/lotti/nuovo`} className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black">+ NUOVO LOTTO</a>
            <button type="button" onClick={() => loadDashboard()} disabled={loading}
              className="rounded-xl border border-zinc-600 px-5 py-3 font-black hover:border-yellow-400 disabled:opacity-50">AGGIORNA DASHBOARD</button>
            <button type="button" disabled={loggingOut} onClick={async () => {
              setLoggingOut(true);
              try { await logoutPoporama(lang); }
              catch (err) { setError(err instanceof Error ? err.message : "Uscita non riuscita."); setLoggingOut(false); }
            }} className="rounded-xl border border-zinc-600 px-5 py-3 font-black disabled:opacity-50">
              {loggingOut ? "USCITA..." : "ESCI"}
            </button>
          </nav>
        </header>

        {loading ? <div role="status" className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center font-black text-yellow-400">CARICAMENTO DASHBOARD...</div> : null}
        {error ? <div role="alert" className="mt-8 rounded-2xl border border-red-800 bg-red-950/30 p-6 text-red-200">
          <p className="font-black">Impossibile aggiornare la dashboard</p><p className="mt-2">{error}</p>
          <button type="button" onClick={() => loadDashboard()} className="mt-4 rounded-xl border border-red-600 px-5 py-3 font-black">RIPROVA</button>
        </div> : null}

        {data ? <>
          <Section title="PANORAMICA GENERALE">
            <Cards>
              <StatCard label="NUMERO LOTTI" value={String(data.generale.numeroLotti)} />
              <StatCard label="CAPITALE INVESTITO" value={money(data.generale.capitaleInvestito)} />
              <StatCard label="PEZZI TOTALI" value={String(data.generale.pezziTotali)} />
              <StatCard label="PEZZI VENDUTI" value={String(data.generale.venduti)} />
              <StatCard label="PEZZI DISPONIBILI" value={String(data.generale.disponibili)} />
              <StatCard label="% ARTICOLI VENDUTI" value={percentage(data.generale.percentualeVenduta)} />
            </Cards>
            {data.generale.articoliSenzaLotto > 0 ? <p className="mt-4 rounded-xl border border-amber-700/50 p-4 text-sm text-amber-300">
              ARTICOLI SENZA LOTTO: <strong>{data.generale.articoliSenzaLotto}</strong>. Esclusi dai riepiloghi economici e dai pezzi dei lotti.
              {" "}{data.generale.senzaReference} senza collegamento; {data.generale.lottoNonTrovato} con lotto non trovato.
            </p> : null}
          </Section>

          <Section title="VENDITE E INCASSI" description={`Incassi reali IVA inclusa. Aliquota IVA ${data.iva.aliquota}%.`}>
            <Cards>
              <StatCard label="INCASSO REALE TOTALE" value={money(data.incassoReale)} accent />
              <StatCard label="INCASSO LORDO IVA INCLUSA" value={money(data.iva.incassoLordo)} />
              <StatCard label="IMPONIBILE" value={money(data.iva.imponibile)} />
              <StatCard label="IVA" value={money(data.iva.importo)} />
              <StatCard label="INCASSO NETTO IVA" value={money(data.iva.incassoNetto)} />
            </Cards>
          </Section>

          <Section title="RECUPERO INVESTIMENTO" description="Il recupero capitale è basato sull’incasso reale lordo. Non rappresenta un utile netto.">
            <Cards>
              <StatCard label="% CAPITALE RECUPERATO" value={percentage(data.recupero.percentuale)} accent />
              <StatCard label="RESIDUO DA RECUPERARE" value={money(data.recupero.residuo)} />
              <StatCard label="SOPRA BREAK-EVEN" value={money(data.recupero.sopraBreakEven)} />
            </Cards>
            {data.recupero.percentuale === null ? <p className="mt-3 text-sm text-zinc-400">Percentuale non calcolabile con capitale investito pari a zero.</p> : null}
          </Section>

          <Section title="STOCK DISPONIBILE" description="Conteggi e valori degli articoli non venduti collegati ai lotti.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {(["NEW", "A", "B", "C", "N", ...(data.stock.hasLegacyD ? ["D"] : [])] as PoporamaGrade[]).map((grade) =>
                <StatCard key={grade} label={gradeLabel(grade)} value={String(data.stock.gradi[grade])} />)}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <StatCard label="VALORE POPORAMA STOCK DISPONIBILE" value={money(data.stock.valorePoporama)} />
              <StatCard label="VALORE RETAIL STOCK DISPONIBILE" value={money(data.stock.valoreRetail)} />
            </div>
          </Section>

          <Section title="POTENZIALE COMPLESSIVO" description="Valori teorici: non sono incassi o utili già realizzati. Comprendono lo stock valorizzato al prezzo POPORAMA.">
            <Cards>
              <StatCard label="POTENZIALE TOTALE" value={money(data.potenziale.totale)} />
              <StatCard label="RISULTATO POTENZIALE" value={money(data.potenziale.risultato)} />
              <StatCard label="MARGINE POTENZIALE %" value={percentage(data.potenziale.margine)} />
            </Cards>
            {data.potenziale.margine === null ? <p className="mt-3 text-sm text-zinc-400">Margine percentuale non calcolabile con capitale investito pari a zero.</p> : null}
          </Section>

          <Section title="ANDAMENTO LOTTI" description="Lotti più recenti prima. La ricerca filtra soltanto l’elenco; i riepiloghi restano complessivi.">
            <label className="block text-sm font-bold text-zinc-400">Cerca lotto, fornitore, provenienza o riferimento
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cerca lotto..."
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-yellow-400 sm:max-w-lg" />
            </label>
            {!data.lotti.length ? <div className="mt-6 rounded-2xl border border-dashed border-zinc-700 p-6">
              <p>Nessun lotto ancora. Crea il primo carico per iniziare.</p>
              <a href={`/${lang}/poporama-test/lotti/nuovo`} className="mt-4 inline-block rounded-xl bg-yellow-400 px-5 py-3 font-black text-black">CREA PRIMO LOTTO</a>
            </div> : !filteredLotti.length ? <p className="mt-5 text-zinc-400">Nessun lotto trovato. Prova con un altro termine di ricerca.</p> : null}
            <div className="mt-6 grid gap-4">
              {filteredLotti.map((lotto) => <article key={lotto.id} className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="min-w-0"><h3 className="break-words text-xl font-black">{lotto.codiceLotto}</h3>
                    <p className={`mt-2 text-xs font-black ${lotto.stato === "RECUPERATO" ? "text-emerald-400" : "text-yellow-400"}`}>{lotto.stato}</p>
                  </div>
                  <a href={`/${lang}/poporama-test/lotti/${lotto.handle}`} className="shrink-0 rounded-xl border border-zinc-600 px-5 py-3 text-center font-black hover:border-yellow-400 hover:text-yellow-400">APRI LOTTO</a>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 xl:grid-cols-6">
                  <Datum label="DATA ACQUISTO" value={dateLabel(lotto.dataAcquisto)} />
                  <Datum label="FORNITORE" value={lotto.fornitore || "—"} />
                  <Datum label="PEZZI CENSITI" value={String(lotto.pezzi)} />
                  <Datum label="VENDUTI" value={String(lotto.venduti)} />
                  <Datum label="DISPONIBILI" value={String(lotto.disponibili)} />
                  <Datum label="COSTO TOTALE" value={money(lotto.costoTotale)} />
                  <Datum label="INCASSO REALE" value={money(lotto.incassoReale)} />
                  <Datum label="% RECUPERATO" value={percentage(lotto.percentualeRecuperata)} />
                  <Datum label="DA RECUPERARE" value={money(lotto.residuoDaRecuperare)} />
                  <Datum label="VALORE STOCK RESIDUO" value={money(lotto.valoreStockResiduo)} />
                  <Datum label="PROVENIENZA" value={lotto.provenienza || "—"} />
                  <Datum label="RIFERIMENTO" value={lotto.riferimentoAcquisto || "—"} />
                </dl>
              </article>)}
            </div>
          </Section>

          <Section title="ULTIME VENDITE" description="Le ultime 10 vendite per data disponibile. L’orario non è registrato; a parità di data l’ordine è per codice PP.">
            {!data.ultimeVendite.length ? <p className="text-zinc-400">Nessuna vendita registrata.</p> : <div className="grid gap-4 md:grid-cols-2">
              {data.ultimeVendite.map((vendita) => <article key={vendita.id} className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
                <a href={`/${lang}/poporama-test/articoli/${encodeURIComponent(vendita.codicePP)}`} className="font-black text-yellow-400 underline">{vendita.codicePP}</a>
                <h3 className="mt-2 break-words font-bold">{vendita.nomeProdotto || "Articolo POPORAMA"}</h3>
                <dl className="mt-4 grid grid-cols-2 gap-4">
                  <Datum label="LOTTO" value={vendita.codiceLotto} />
                  <Datum label="GRADO" value={gradeLabel(vendita.grado)} />
                  <Datum label="PREZZO POPORAMA" value={money(vendita.prezzoPoporama)} />
                  <Datum label="PREZZO VENDITA" value={money(vendita.prezzoVendita)} />
                  <Datum label="DATA" value={dateLabel(vendita.dataVendita)} />
                </dl>
              </article>)}
            </div>}
          </Section>
        </> : null}

        <section className="mt-8">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Flusso POPORAMA</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard number="1" title="Crea il carico" description="Registriamo fornitore, costi, numero pezzi e provenienza." />
            <InfoCard number="2" title="Carica la merce" description="Importa il manifest oppure censisci manualmente i prodotti." />
            <InfoCard number="3" title="Testa e vendi" description="Ogni articolo viene classificato, etichettato e collegato al proprio lotto." />
          </div>
        </section>
      </div>
    </main>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section aria-label={title} className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-8">
    <h2 className="text-xl font-black text-yellow-400">{title}</h2>
    {description ? <p className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</p> : null}
    <div className="mt-5">{children}</div>
  </section>;
}
function Cards({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}
function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
    <p className="text-xs font-black uppercase tracking-wide text-zinc-400">{label}</p>
    <p className={`mt-3 break-words text-2xl font-black sm:text-3xl ${accent ? "text-yellow-400" : "text-white"}`}>{value}</p>
  </div>;
}
function Datum({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-xs font-bold text-zinc-500">{label}</dt><dd className="mt-1 break-words font-bold">{value}</dd></div>;
}
function InfoCard({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-lg font-black text-black">{number}</div>
    <h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</p>
  </div>;
}
function money(value: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value);
}
function percentage(value: number | null) {
  return value === null ? "—" : `${new Intl.NumberFormat("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}%`;
}
function gradeLabel(grade: string) {
  return grade === "NEW" ? "NUOVO" : grade === "N" ? "NON TESTATO" : grade === "D" ? "D (LEGACY)" : grade === "C" ? "C — NON FUNZIONANTE" : grade;
}
function dateLabel(value: string) {
  const day = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(Date.parse(day))) return "Data non disponibile";
  return day.split("-").reverse().join("/");
}
