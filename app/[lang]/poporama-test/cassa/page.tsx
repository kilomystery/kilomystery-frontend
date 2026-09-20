"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { allocateCents, centsToDecimal, parseCents, sumCents } from "@/app/lib/poporama-cassa-pricing";
import { logoutPoporama } from "@/app/lib/poporama-logout";
import { useParams } from "next/navigation";
import {
  BrowserQRCodeReader,
  IScannerControls,
} from "@zxing/browser";

type ArticoloCassa = {
  id: string;
  handle: string;
  codicePP: string;
  nomeProdotto: string;
  lotto: string;
  ean: string;
  asin: string;
  grado: string;
  retail: number;
  percentualePrezzo: number;
  prezzoPoporama: number;
  statoVendita: string;
  prezzoVendita: number;
  dataVendita: string;
};

function euro(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(value) ? value : 0);
}

function extractPP(value: string) {
  const match = String(value || "")
    .trim()
    .toUpperCase()
    .match(/(?:^|[^A-Z0-9_-])(PP-\d{6})(?=$|[^A-Z0-9_-])/);

  return match ? match[1] : "";
}

function gradeLabel(grade: string) {
  const normalized = grade.trim().toUpperCase();
  if (normalized === "NEW") return "NUOVO";
  if (normalized === "N" || !normalized) return "NON TESTATO";
  if (normalized === "D") return "D (LEGACY)";
  return normalized;
}

type CartLine = { articolo: ArticoloCassa; prezzoInput: string };
type SaleResult = { code: string; stato: "venduto" | "non_avviato" | "non_registrato" | "incerto";
  prezzoVendita: number; dataVendita?: string; errore?: string };

function cartTotals(lines: CartLine[], manual: boolean, input: string) {
  try {
    const weights = lines.map((line) => {
      const cents = parseCents(line.articolo.prezzoPoporama);
      if (cents === null) throw new Error(`${line.articolo.codicePP}: prezzo POPORAMA non valido.`);
      return cents;
    });
    const poporama = sumCents(weights);
    if (!lines.length) return { quotes: [], total: 0, poporama, error: "" };
    let quotes: number[];
    if (manual) {
      const total = parseCents(input);
      if (total === null) throw new Error("Totale manuale non valido: minimo 0, massimo 2 decimali.");
      quotes = allocateCents(total, lines.map((line, i) => ({ code: line.articolo.codicePP, weight: weights[i] })));
    } else {
      quotes = lines.map((line) => {
        const cents = parseCents(line.prezzoInput);
        if (cents === null) throw new Error(`${line.articolo.codicePP}: prezzo vendita non valido. Usa minimo 0 e massimo 2 decimali.`);
        return cents;
      });
    }
    return { quotes, total: sumCents(quotes), poporama, error: "" };
  } catch (error) {
    return { quotes: [], total: 0, poporama: 0, error: error instanceof Error ? error.message : "Importi non validi." };
  }
}

export default function PoporamaCassaPage() {
  const params = useParams();

  const lang =
    typeof params?.lang === "string"
      ? params.lang
      : "it";

  const scanRef =
    useRef<HTMLInputElement>(null);

  const videoRef =
    useRef<HTMLVideoElement>(null);

  const scannerControlsRef =
    useRef<IScannerControls | null>(null);

  const scannerBusyRef =
    useRef(false);

  const requestBusyRef = useRef(false);
  const saleDialogRef = useRef<HTMLDialogElement>(null);
  const [pendingSale, setPendingSale] = useState<{
    lines: CartLine[]; quotes: number[]; total: number; poporama: number; manual: boolean;
  } | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const cartRef = useRef<CartLine[]>([]);
  const saleBlockedRef = useRef(false);
  const [manualTotal, setManualTotal] = useState(false);
  const [totalInput, setTotalInput] = useState("");
  const [saleReport, setSaleReport] = useState<SaleResult[]>([]);

  const [scan, setScan] =
    useState("");

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [cameraLoading, setCameraLoading] =
    useState(false);

  const [cameraError, setCameraError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [selling, setSelling] =
    useState(false);

  const [articolo, setArticolo] =
    useState<ArticoloCassa | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      !loading &&
      !selling &&
      !pendingSale
    ) {
      window.setTimeout(() => {
        scanRef.current?.focus();
      }, 100);
    }
  }, [
    loading,
    selling,
    articolo,
    pendingSale,
  ]);

  useEffect(() => {
    if (pendingSale) saleDialogRef.current?.showModal();
  }, [pendingSale]);

  function stopCamera() {
    try {
      scannerControlsRef.current?.stop();
    } catch {
      // Scanner gia chiuso.
    }

    scannerControlsRef.current = null;
    scannerBusyRef.current = false;

    const video = videoRef.current;

    if (video?.srcObject) {
      const stream =
        video.srcObject as MediaStream;

      stream
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      video.srcObject = null;
    }

    setCameraOpen(false);
    setCameraLoading(false);
  }

  async function openCamera() {
    if (requestBusyRef.current || pendingSale || saleDialogRef.current?.open || saleBlockedRef.current) return;
    setError("");
    setSuccess("");
    setCameraError("");

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError(
        "La fotocamera non e disponibile in questo browser. Su telefono o tablet apri la Cassa tramite HTTPS."
      );
      return;
    }

    try {
      setCameraOpen(true);
      setCameraLoading(true);

      await new Promise<void>(
        (resolve) =>
          window.setTimeout(
            resolve,
            100
          )
      );

      const video =
        videoRef.current;

      if (!video) {
        throw new Error(
          "Impossibile inizializzare la fotocamera."
        );
      }

      const reader =
        new BrowserQRCodeReader();

      const controls =
        await reader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: {
                ideal: "environment",
              },
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
            },
          },
          video,
          (result) => {
            if (
              !result ||
              scannerBusyRef.current
            ) {
              return;
            }

            const raw =
              result.getText();

            const code =
              extractPP(raw);

            if (!code) {
              setCameraError(
                "QR letto, ma non contiene un codice PP POPORAMA."
              );
              return;
            }

            scannerBusyRef.current = true;

            setScan(code);
            stopCamera();

            window.setTimeout(
              () =>
                cercaArticolo(code),
              100
            );
          }
        );

      scannerControlsRef.current =
        controls;

      setCameraLoading(false);
    } catch (err) {
      stopCamera();

      const message =
        err instanceof Error
          ? err.message
          : "Impossibile aprire la fotocamera.";

      if (
        message
          .toLowerCase()
          .includes("permission") ||
        message
          .toLowerCase()
          .includes("notallowed")
      ) {
        setCameraError(
          "Permesso fotocamera negato. Consenti l accesso alla fotocamera nelle impostazioni del browser e riprova."
        );
      } else {
        setCameraError(message);
      }
    }
  }

  async function logout() {
    if (requestBusyRef.current || pendingSale || saleDialogRef.current?.open) return;
    stopCamera();
    try {
      await logoutPoporama(lang);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Uscita non riuscita. Riprova.");
    }
  }

  async function cercaArticolo(
    rawValue?: string
  ) {
    if (requestBusyRef.current || pendingSale || saleDialogRef.current?.open || saleBlockedRef.current) return;
    const code =
      extractPP(
        rawValue ?? scan
      );

    setError("");
    setSuccess("");

    if (!code) {
      setError(
        "Scansiona un QR POPORAMA oppure inserisci un codice come PP-000002."
      );
      return;
    }

    if (cartRef.current.some((line) => extractPP(line.articolo.codicePP) === code)) {
      setError("ARTICOLO GIÀ PRESENTE NEL CARRELLO");
      return;
    }
    requestBusyRef.current = true;
    stopCamera();
    try {
      setLoading(true);
      setArticolo(null);

      const response = await fetch(
        `/api/poporama/cassa?code=${encodeURIComponent(
          code
        )}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (
        response.status === 401
      ) {
        throw new Error(
          "Sessione POPORAMA scaduta."
        );
      }

      if (
        !response.ok ||
        !data.ok ||
        !data.articolo
      ) {
        throw new Error(
          data.error ||
            "Articolo non trovato."
        );
      }

      const item =
        data.articolo as ArticoloCassa;

      setArticolo(item);
      setScan(item.codicePP);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore ricerca articolo."
      );
    } finally {
      requestBusyRef.current = false;
      setLoading(false);
    }
  }

  function submitScan(
    event: FormEvent
  ) {
    event.preventDefault();
    cercaArticolo();
  }

  function apriScheda() {
    if (!articolo) {
      return;
    }

    window.open(
      `/${lang}/poporama-test/articoli/${encodeURIComponent(articolo.codicePP)}`,
      "_blank", "noopener,noreferrer"
    );
  }

  function aggiungiAlCarrello() {
    if (!articolo || requestBusyRef.current || pendingSale || saleBlockedRef.current) return;
    const code = extractPP(articolo.codicePP);
    if (cartRef.current.some((line) => extractPP(line.articolo.codicePP) === code)) {
      setError("ARTICOLO GIÀ PRESENTE NEL CARRELLO");
      return;
    }
    if (articolo.statoVendita !== "DISPONIBILE") {
      setError(`${code}: articolo non disponibile.`);
      return;
    }
    const next = [...cartRef.current, { articolo, prezzoInput: articolo.prezzoPoporama.toFixed(2) }];
    cartRef.current = next;
    setCart(next);
    setArticolo(null);
    setScan("");
    setError("");
    setSaleReport([]);
    scanRef.current?.focus();
  }

  function modificaCarrello(code: string, price?: string) {
    if (requestBusyRef.current || pendingSale || saleBlockedRef.current) return;
    const next = price === undefined
      ? cartRef.current.filter((line) => line.articolo.codicePP !== code)
      : cartRef.current.map((line) => line.articolo.codicePP === code ? { ...line, prezzoInput: price } : line);
    cartRef.current = next;
    setCart(next);
    setSaleReport([]);
    setError("");
  }

  function preparaVendita() {
    if (requestBusyRef.current || pendingSale || saleBlockedRef.current) return;
    const totals = cartTotals(cart, manualTotal, totalInput);
    if (totals.error || !cart.length) {
      setError(totals.error || "Aggiungi almeno un articolo al carrello.");
      return;
    }
    stopCamera();
    setError("");
    setPendingSale({ lines: cart, ...totals, manual: manualTotal });
  }

  async function confermaVendita() {
    if (!pendingSale || requestBusyRef.current) return;
    requestBusyRef.current = true;
    let receivedReport = false;
    try {
      setSelling(true);
      setError("");
      setSuccess("");
      setSaleReport([]);
      const response = await fetch("/api/poporama/cassa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sellCart",
          items: pendingSale.lines.map((line, i) => ({
            code: line.articolo.codicePP,
            prezzoVendita: centsToDecimal(pendingSale.quotes[i]),
            ...(pendingSale.manual ? { prezzoPoporamaAtteso: line.articolo.prezzoPoporama } : {}),
          })),
          ...(pendingSale.manual ? { totaleManuale: centsToDecimal(pendingSale.total) } : {}),
        }),
      });
      const data = await response.json();
      if (response.status === 401) {
        receivedReport = true; // Il server non ha avviato la vendita.
        throw new Error("Sessione POPORAMA scaduta. Accedi nuovamente. La vendita non è stata avviata.");
      }
      if (Array.isArray(data.report)) {
        receivedReport = true;
        setSaleReport(data.report);
        saleBlockedRef.current = data.report.some((entry: SaleResult) => entry.stato === "venduto" || entry.stato === "incerto");
      }
      if (!response.ok || !data.ok) {
        // Una risposta applicativa senza report (validazione o lock) non ha scritto.
        if (data.ok === false) receivedReport = true;
        throw new Error(data.error || "Vendita non completata. Verifica il riepilogo.");
      }
      saleBlockedRef.current = true;
      setSuccess(`VENDITA REGISTRATA · ${data.vendita.numeroArticoli} ARTICOLI · TOTALE ${euro(data.vendita.totale)}`);
      setArticolo(null);
      setScan("");
    } catch (err) {
      if (!receivedReport) {
        // Connessione interrotta: non si sa quali update il server abbia eseguito.
        saleBlockedRef.current = true;
        setSaleReport(pendingSale.lines.map((line, i) => ({
          code: line.articolo.codicePP, stato: "incerto", prezzoVendita: pendingSale.quotes[i] / 100,
          errore: "Risposta non ricevuta. Verifica lo stato dell'articolo prima di un'altra vendita.",
        })));
      }
      setError(receivedReport && err instanceof Error ? err.message : "Esito vendita incerto: verifica tutti i PP prima di procedere. Non ripetere automaticamente la vendita.");
    } finally {
      requestBusyRef.current = false;
      setSelling(false);
      setPendingSale(null);
    }
  }

  function nuovaVendita() {
    if (requestBusyRef.current || pendingSale) return;
    saleBlockedRef.current = false;
    cartRef.current = [];
    setCart([]);
    setSaleReport([]);
    setManualTotal(false);
    setTotalInput("");
    nuovaScansione();
  }

  function nuovaScansione() {
    if (requestBusyRef.current || pendingSale || saleDialogRef.current?.open || saleBlockedRef.current) return;
    stopCamera();
    setArticolo(null);
    setScan("");
    setError("");
    setSuccess("");
    setCameraError("");

    window.setTimeout(() => {
      scanRef.current?.focus();
    }, 100);
  }

  const isSold =
    articolo?.statoVendita
      ?.trim().toUpperCase() === "VENDUTO";
  const isAvailable = articolo?.statoVendita?.trim().toUpperCase() === "DISPONIBILE";
  const busy = loading || selling || Boolean(pendingSale);
  const frozen = busy || saleBlockedRef.current;
  const totals = cartTotals(cart, manualTotal, totalInput);

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
              POPORAMA TEST CENTER
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Cassa / Carrello
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Scansiona gli articoli, componi il carrello e conferma il totale da incassare.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            disabled={busy}
            className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-black hover:border-zinc-500"
          >
            ESCI
          </button>
        </header>

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
            Ricerca articolo
          </p>

          <h2 className="mt-2 text-xl font-black">
            Scansiona QR o inserisci PP
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Puoi usare il QR dell etichetta oppure inserire manualmente un codice come PP-000002.
          </p>

          <form
            onSubmit={submitScan}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <input
              ref={scanRef}
              disabled={frozen}
              type="text"
              value={scan}
              onChange={(event) =>
                setScan(
                  event.target.value
                    .toUpperCase()
                )
              }
              placeholder="PP-000002"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-black px-4 py-4 font-black uppercase tracking-[0.08em] text-white outline-none focus:border-yellow-400"
            />

            <button
              type="submit"
              disabled={frozen}
              className="rounded-xl bg-yellow-400 px-6 py-4 font-black text-black hover:bg-yellow-300 disabled:opacity-50"
            >
              {loading
                ? "CERCO..."
                : "CERCA ARTICOLO"}
            </button>

            <button
              type="button"
              onClick={
                cameraOpen
                  ? stopCamera
                  : openCamera
              }
              disabled={cameraLoading || frozen}
              className="rounded-xl border border-yellow-400 px-6 py-4 font-black text-yellow-400 hover:bg-yellow-400 hover:text-black disabled:opacity-50"
            >
              {cameraLoading
                ? "APERTURA..."
                : cameraOpen
                  ? "CHIUDI QR"
                  : "SCANSIONA QR"}
            </button>
          </form>

          {cameraOpen ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-700 bg-black">
              <video
                ref={videoRef}
                className="aspect-video w-full object-cover"
                muted
                playsInline
              />
            </div>
          ) : null}

          {cameraError ? (
            <div className="mt-4 rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm font-bold text-red-300">
              {cameraError}
            </div>
          ) : null}
        </section>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-900 bg-red-950/30 p-5 font-bold text-red-300">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-6 rounded-2xl border border-emerald-800 bg-emerald-950/30 p-5 font-bold text-emerald-300">
            <p role="status">{success}</p>
            <button type="button" onClick={nuovaVendita} disabled={busy}
              className="mt-4 rounded-xl border border-emerald-500 px-5 py-3 font-black disabled:opacity-50">
              NUOVA VENDITA
            </button>
          </div>
        ) : null}

        {articolo ? (
          <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black text-yellow-400">
                  {articolo.codicePP}
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  {articolo.nomeProdotto ||
                    "Articolo POPORAMA"}
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  {articolo.ean
                    ? `EAN ${articolo.ean}`
                    : "EAN non presente"}
                  {articolo.asin
                    ? ` · ASIN ${articolo.asin}`
                    : ""}
                </p>
              </div>

              <span
                className={
                  isSold
                    ? "rounded-xl border border-red-800 bg-red-950/30 px-4 py-2 text-sm font-black text-red-300"
                    : "rounded-xl border border-emerald-800 bg-emerald-950/30 px-4 py-2 text-sm font-black text-emerald-300"
                }
              >
                {articolo.statoVendita ||
                  "STATO NON DISPONIBILE"}
              </span>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info
                label="GRADO"
                value={
                  gradeLabel(articolo.grado)
                }
              />

              <Info label="LOTTO" value={articolo.lotto || "Non indicato"} />

              <Info
                label="RETAIL"
                value={euro(
                  Number(
                    articolo.retail || 0
                  )
                )}
              />

              <Info
                label="PREZZO POPORAMA"
                value={euro(
                  Number(
                    articolo.prezzoPoporama ||
                      0
                  )
                )}
              />

              <Info
                label="PERCENTUALE"
                value={`${Number(
                  articolo.percentualePrezzo ||
                    0
                )}%`}
              />
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={apriScheda}
                disabled={frozen}
                className="rounded-xl border border-zinc-600 px-5 py-4 font-black hover:border-yellow-400 hover:text-yellow-400"
              >
                VEDI SCHEDA ARTICOLO
              </button>

              <button
                type="button"
                onClick={nuovaScansione}
                disabled={frozen}
                className="rounded-xl border border-zinc-700 px-5 py-4 font-black hover:border-zinc-500"
              >
                NUOVO ARTICOLO
              </button>
            </div>

            {isSold ? (
              <div className="mt-7 rounded-2xl border border-red-900 bg-red-950/20 p-5">
                <p className="font-black text-red-300">
                  ARTICOLO GIÀ VENDUTO
                </p>

                <p className="mt-2 text-sm text-zinc-400">
                  Prezzo vendita:{" "}
                  {euro(
                    Number(
                      articolo.prezzoVendita ||
                        0
                    )
                  )}
                </p>

                {articolo.dataVendita ? (
                  <p className="mt-1 text-sm text-zinc-500">
                    Data vendita:{" "}
                    {new Date(
                      articolo.dataVendita
                    ).toLocaleString(
                      "it-IT"
                    )}
                  </p>
                ) : null}
              </div>
            ) : isAvailable ? (
              <button type="button" onClick={aggiungiAlCarrello} disabled={frozen}
                className="mt-7 w-full rounded-xl bg-yellow-400 px-6 py-4 font-black text-black disabled:opacity-50">
                AGGIUNGI AL CARRELLO
              </button>
            ) : (
              <p className="mt-7 font-bold text-red-300">Articolo non disponibile per la vendita.</p>
            )}
          </section>
        ) : null}

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <h2 className="text-xl font-black text-yellow-400">CARRELLO ({cart.length} articoli)</h2>
          {!cart.length ? <p className="mt-4 text-zinc-400">Cerca un articolo e premi AGGIUNGI AL CARRELLO.</p> : null}
          <div className="mt-5 space-y-4">
            {cart.map((line, i) => (
              <article key={line.articolo.codicePP} className="rounded-2xl border border-zinc-700 bg-black p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div className="min-w-0">
                    <p className="font-black text-yellow-400">{line.articolo.codicePP}</p>
                    <p className="mt-1 break-words font-bold">{line.articolo.nomeProdotto || "Articolo POPORAMA"}</p>
                    <p className="mt-2 text-sm text-zinc-400">{gradeLabel(line.articolo.grado)} · Lotto: {line.articolo.lotto || "Non indicato"}</p>
                    <p className="mt-2">Prezzo POPORAMA: {euro(line.articolo.prezzoPoporama)}</p>
                    <a href={`/${lang}/poporama-test/articoli/${encodeURIComponent(line.articolo.codicePP)}`}
                      target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-yellow-400 underline">VEDI SCHEDA ARTICOLO</a>
                  </div>
                  <div className="sm:w-56">
                    <label htmlFor={`prezzo-${line.articolo.codicePP}`} className="text-xs font-black text-zinc-400">PREZZO VENDITA €</label>
                    <input id={`prezzo-${line.articolo.codicePP}`} type="text" inputMode="decimal"
                      value={manualTotal ? (totals.quotes[i] === undefined ? "" : centsToDecimal(totals.quotes[i])) : line.prezzoInput}
                      disabled={frozen || manualTotal}
                      onChange={(event) => modificaCarrello(line.articolo.codicePP, event.target.value)}
                      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-xl font-black disabled:opacity-70" />
                    {manualTotal ? <p className="mt-2 text-xs text-yellow-400">Quota del totale manuale</p> : null}
                    <button type="button" onClick={() => modificaCarrello(line.articolo.codicePP)} disabled={frozen}
                      className="mt-3 w-full rounded-xl border border-red-800 px-4 py-3 font-black text-red-300 disabled:opacity-50">RIMUOVI</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {cart.length ? (
            <div className="mt-6 border-t border-zinc-700 pt-6">
              <label className="flex items-center gap-3 font-black">
                <input type="checkbox" checked={manualTotal} disabled={frozen}
                  onChange={(event) => {
                    setManualTotal(event.target.checked);
                    if (event.target.checked && !totalInput && !totals.error) setTotalInput(centsToDecimal(totals.total));
                    setError("");
                  }} className="h-6 w-6 accent-yellow-400" />
                TOTALE MANUALE / PREZZO UNICO
              </label>
              {manualTotal ? (
                <div className="mt-4">
                  <label htmlFor="totale-manuale" className="block text-xs font-black text-yellow-400">TOTALE DA INCASSARE €</label>
                  <input id="totale-manuale" type="text" inputMode="decimal" value={totalInput} disabled={frozen}
                    onChange={(event) => setTotalInput(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-yellow-400 bg-black px-4 py-4 text-2xl font-black sm:max-w-xs" />
                  <p className="mt-3 text-sm text-zinc-400">Ripartito in proporzione ai prezzi POPORAMA. Se sono tutti zero, ripartizione uniforme.</p>
                </div>
              ) : null}
              {totals.error ? <p role="alert" className="mt-4 text-red-300">{totals.error}</p> : (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Info label="TOTALE POPORAMA" value={euro(totals.poporama / 100)} />
                  <Info label="TOTALE VENDITA" value={euro(totals.total / 100)} />
                </div>
              )}
              <button type="button" onClick={preparaVendita} disabled={frozen || Boolean(totals.error)}
                className="mt-6 w-full rounded-xl bg-emerald-500 px-6 py-4 font-black text-black disabled:opacity-50">
                {selling ? "REGISTRO..." : "CONFERMA VENDITA"}
              </button>
            </div>
          ) : null}
        </section>

        {saleReport.length && !success ? (
          <section role="status" className="mt-6 rounded-2xl border border-amber-700 bg-amber-950/20 p-5">
            <h2 className="font-black text-amber-300">ESITO PER ARTICOLO</h2>
            <ul className="mt-4 space-y-4">
              {saleReport.map((entry) => (
                <li key={entry.code}>
                  <strong>{entry.code}</strong> · {({ venduto: "VENDITA REGISTRATA", incerto: "ESITO INCERTO — VERIFICA NECESSARIA", non_avviato: "AGGIORNAMENTO NON AVVIATO", non_registrato: "VENDITA RIFIUTATA" })[entry.stato]}
                  {entry.stato === "venduto" ? <p>{euro(entry.prezzoVendita)} · {entry.dataVendita ? new Date(entry.dataVendita).toLocaleString("it-IT") : ""}</p> : null}
                  {entry.errore ? <p className="mt-1 text-sm text-zinc-400">{entry.errore}</p> : null}
                  <a href={`/${lang}/poporama-test/articoli/${encodeURIComponent(entry.code)}`} target="_blank" rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm text-yellow-400 underline">VERIFICA ARTICOLO</a>
                </li>
              ))}
            </ul>
            {saleBlockedRef.current ? (
              <>
                <p className="mt-5 text-amber-300">Non ripetere questo carrello. Verifica gli esiti incerti prima di iniziare una nuova vendita. Gli articoli registrati restano venduti.</p>
                <button type="button" onClick={nuovaVendita} disabled={busy}
                  className="mt-4 rounded-xl border border-amber-500 px-5 py-4 font-black disabled:opacity-50">NUOVA VENDITA</button>
              </>
            ) : null}
          </section>
        ) : null}

        {pendingSale ? (
          <dialog ref={saleDialogRef} aria-labelledby="conferma-vendita-title"
            onCancel={(event) => {
              event.preventDefault();
              if (!requestBusyRef.current) setPendingSale(null);
            }}
            className="w-[calc(100%_-_2rem)] max-w-lg rounded-3xl border border-zinc-700 bg-zinc-900 p-6 text-white backdrop:bg-black/80 sm:p-8">
            <h2 id="conferma-vendita-title" className="text-xl font-black text-yellow-400">CONFERMA VENDITA</h2>
            <p className="mt-5 font-black">{pendingSale.lines.length} ARTICOLI</p>
            <ul className="mt-3 max-h-60 space-y-3 overflow-y-auto">
              {pendingSale.lines.map((line, i) => (
                <li key={line.articolo.codicePP} className="break-words">
                  <strong>{line.articolo.codicePP}</strong> · {line.articolo.nomeProdotto}
                  <div>Quota effettiva: {euro(pendingSale.quotes[i] / 100)}</div>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-zinc-400">Totale POPORAMA: {euro(pendingSale.poporama / 100)}</p>
            <p className="mt-2 text-xl font-black">TOTALE EFFETTIVO: {euro(pendingSale.total / 100)}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={confermaVendita} disabled={selling}
                className="flex-1 rounded-xl bg-emerald-500 px-5 py-4 font-black text-black disabled:opacity-50">
                {selling ? "REGISTRO..." : "CONFERMA"}
              </button>
              <button type="button" autoFocus onClick={() => setPendingSale(null)} disabled={selling}
                className="flex-1 rounded-xl border border-zinc-600 px-5 py-4 font-black disabled:opacity-50">
                ANNULLA
              </button>
            </div>
          </dialog>
        ) : null}
      </div>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-600">
        {label}
      </p>

      <p className="mt-2 break-words font-black text-white">
        {value}
      </p>
    </div>
  );
}