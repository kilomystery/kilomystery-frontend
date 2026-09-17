"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  BrowserQRCodeReader,
  IScannerControls,
} from "@zxing/browser";

type SumUpReader = {
  id: string;
  name: string;
  status: string;
  model: string;
  identifier: string;
};

type SumUpInfo = {
  merchantCode: string;
  affiliateConfigured: boolean;
  readers: SumUpReader[];
};

type ArticoloCassa = {
  id: string;
  handle: string;
  codicePP: string;
  nomeProdotto: string;
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
  return new Intl.NumberFormat(
    "it-IT",
    {
      style: "currency",
      currency: "EUR",
    }
  ).format(
    Number.isFinite(value) ? value : 0
  );
}

function extractPP(value: string) {
  const match = String(value || "")
    .toUpperCase()
    .match(/PP-\d{6}/);

  return match ? match[0] : "";
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

  const [sumupInfo, setSumupInfo] =
    useState<SumUpInfo | null>(null);

  const [sumupLoading, setSumupLoading] =
    useState(false);

  const [sumupError, setSumupError] =
    useState("");

  const [pairingCode, setPairingCode] =
    useState("");

  const [pairingLoading, setPairingLoading] =
    useState(false);

  const [checking, setChecking] =
    useState(true);

  const [
    authenticated,
    setAuthenticated,
  ] = useState(false);

  const [pin, setPin] =
    useState("");

  const [loginLoading, setLoginLoading] =
    useState(false);

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
    useState<ArticoloCassa | null>(
      null
    );

  const [
    prezzoVendita,
    setPrezzoVendita,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    checkSession();

    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (
      authenticated &&
      !loading &&
      !selling
    ) {
      window.setTimeout(() => {
        scanRef.current?.focus();
      }, 100);
    }
  }, [
    authenticated,
    loading,
    selling,
    articolo,
  ]);

  function stopCamera() {
    try {
      scannerControlsRef.current?.stop();
    } catch {
      // Scanner già chiuso.
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
    setError("");
    setSuccess("");
    setCameraError("");

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError(
        "La fotocamera non è disponibile in questo browser. Su telefono/tablet apri la Cassa tramite HTTPS."
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

            scannerBusyRef.current =
              true;

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
          "Permesso fotocamera negato. Consenti l'accesso alla fotocamera nelle impostazioni del browser e riprova."
        );
      } else {
        setCameraError(message);
      }
    }
  }

  async function checkSession() {
    try {
      setChecking(true);

      const response = await fetch(
        "/api/poporama/cassa",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      const isAuth = Boolean(
        response.ok &&
          data.authenticated
      );

      setAuthenticated(isAuth);

      if (isAuth) {
        window.setTimeout(() => {
          loadSumUp();
        }, 100);
      }
    } catch {
      setAuthenticated(false);
    } finally {
      setChecking(false);
    }
  }

  async function login(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!pin.trim()) {
      setError("Inserisci il PIN cassa.");
      return;
    }

    try {
      setLoginLoading(true);

      const response = await fetch(
        "/api/poporama/cassa",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "login",
            pin,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.error ||
            "Accesso non riuscito."
        );
      }

      setPin("");
      setAuthenticated(true);
      window.setTimeout(() => {
        loadSumUp();
      }, 100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Accesso non riuscito."
      );
    } finally {
      setLoginLoading(false);
    }
  }

  async function loadSumUp() {
    try {
      setSumupLoading(true);
      setSumupError("");

      const response = await fetch(
        "/api/poporama/sumup",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        setAuthenticated(false);
        throw new Error("Sessione cassa scaduta.");
      }

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ||
            "Impossibile leggere SumUp."
        );
      }

      setSumupInfo({
        merchantCode:
          data.merchantCode || "",
        affiliateConfigured:
          Boolean(
            data.affiliateConfigured
          ),
        readers:
          Array.isArray(data.readers)
            ? data.readers
            : [],
      });
    } catch (err) {
      setSumupError(
        err instanceof Error
          ? err.message
          : "Errore SumUp."
      );
    } finally {
      setSumupLoading(false);
    }
  }

  async function pairSumUp() {
    const code = pairingCode
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");

    if (!/^[A-Z0-9]{8,9}$/.test(code)) {
      setSumupError(
        "Inserisci il codice di pairing di 8 o 9 caratteri mostrato sul Solo."
      );
      return;
    }

    try {
      setPairingLoading(true);
      setSumupError("");

      const response = await fetch(
        "/api/poporama/sumup",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "pair",
            pairingCode: code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ||
            "Associazione SumUp non riuscita."
        );
      }

      setPairingCode("");

      await loadSumUp();
    } catch (err) {
      setSumupError(
        err instanceof Error
          ? err.message
          : "Errore pairing SumUp."
      );
    } finally {
      setPairingLoading(false);
    }
  }

  async function logout() {
    stopCamera();

    await fetch(
      "/api/poporama/cassa",
      {
        method: "DELETE",
      }
    );

    setAuthenticated(false);
    setArticolo(null);
    setScan("");
    setSuccess("");
    setError("");
  }

  async function cercaArticolo(
    rawValue?: string
  ) {
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

      if (response.status === 401) {
        setAuthenticated(false);
        throw new Error(
          "Sessione cassa scaduta."
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
      setPrezzoVendita(
        Number(
          item.prezzoPoporama || 0
        ).toFixed(2)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore ricerca articolo."
      );
    } finally {
      setLoading(false);
    }
  }

  function submitScan(
    event: FormEvent
  ) {
    event.preventDefault();
    cercaArticolo();
  }

  async function confermaVendita() {
    if (!articolo || selling) {
      return;
    }

    if (
      articolo.statoVendita
        .toUpperCase() === "VENDUTO"
    ) {
      setError(
        "Questo articolo risulta già venduto."
      );
      return;
    }

    const price = Number(
      prezzoVendita.replace(",", ".")
    );

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError(
        "Inserisci un prezzo vendita valido."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Confermi la vendita di ${articolo.codicePP} a ${euro(
          price
        )}?\n\nIn questa fase TEST la vendita verrà registrata direttamente su Shopify.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSelling(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/poporama/cassa",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "sell",
            code:
              articolo.codicePP,
            prezzoVendita: price,
          }),
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        setAuthenticated(false);
        throw new Error(
          "Sessione cassa scaduta."
        );
      }

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.error ||
            "Vendita non registrata."
        );
      }

      setArticolo((current) =>
        current
          ? {
              ...current,
              statoVendita:
                "VENDUTO",
              prezzoVendita:
                data.vendita
                  ?.prezzoVendita ??
                price,
              dataVendita:
                data.vendita
                  ?.dataVendita ||
                new Date().toISOString(),
            }
          : current
      );

      setSuccess(
        `${articolo.codicePP} venduto a ${euro(
          price
        )}. Vendita registrata su Shopify.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore registrazione vendita."
      );
    } finally {
      setSelling(false);
    }
  }

  function nuovaScansione() {
    stopCamera();
    setArticolo(null);
    setScan("");
    setPrezzoVendita("");
    setError("");
    setSuccess("");

    window.setTimeout(() => {
      scanRef.current?.focus();
    }, 50);
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-black px-4 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <p className="font-black">
              Apertura Cassa POPORAMA...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-black px-4 py-10 text-white">
        <div className="mx-auto max-w-md">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7 sm:p-9">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-400">
              Area operatori
            </p>

            <h1 className="mt-3 text-3xl font-black">
              Cassa POPORAMA
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Questa pagina non permette vendite senza autenticazione.
              Inserisci il PIN operatore configurato sul server.
            </p>

            <form
              onSubmit={login}
              className="mt-7"
            >
              <label className="text-xs font-black uppercase tracking-wider text-zinc-500">
                PIN cassa
              </label>

              <input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={pin}
                onChange={(event) =>
                  setPin(
                    event.target.value
                  )
                }
                autoFocus
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-black px-4 py-4 text-xl font-black tracking-[0.3em] text-white outline-none focus:border-yellow-400"
              />

              <button
                type="submit"
                disabled={loginLoading}
                className="mt-4 w-full rounded-xl bg-yellow-400 px-5 py-4 font-black text-black transition hover:bg-yellow-300 disabled:opacity-50"
              >
                {loginLoading
                  ? "ACCESSO..."
                  : "ENTRA IN CASSA"}
              </button>
            </form>

            {error ? (
              <div className="mt-4 rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm font-bold text-red-300">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </main>
    );
  }

  const sold =
    articolo?.statoVendita
      ?.toUpperCase() === "VENDUTO";

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-400">
              Operatore autenticato
            </p>

            <h1 className="mt-2 text-3xl font-black">
              Cassa POPORAMA
            </h1>
          </div>

          <div className="flex gap-2">
            <a
              href={`/${lang}/poporama-test/lotti`}
              className="rounded-xl border border-zinc-700 px-4 py-3 text-sm font-black hover:border-zinc-500"
            >
              LOTTI
            </a>

            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-zinc-700 px-4 py-3 text-sm font-black hover:border-red-700 hover:text-red-300"
            >
              ESCI
            </button>
          </div>
        </header>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                SumUp Cloud API
              </p>

              <h2 className="mt-2 text-xl font-black">
                SumUp Solo
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                Associa il Solo una sola volta. Il codice di pairing viene generato sul terminale e scade dopo pochi minuti.
              </p>
            </div>

            <button
              type="button"
              onClick={loadSumUp}
              disabled={sumupLoading}
              className="rounded-xl border border-zinc-700 px-4 py-3 text-sm font-black hover:border-yellow-400 disabled:opacity-50"
            >
              {sumupLoading
                ? "CONTROLLO..."
                : "AGGIORNA STATO"}
            </button>
          </div>

          {sumupError ? (
            <div className="mt-4 rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm font-bold text-red-300">
              {sumupError}
            </div>
          ) : null}

          {sumupInfo ? (
            <div className="mt-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-black p-4">
                  <p className="text-xs font-black uppercase text-zinc-600">
                    Account SumUp
                  </p>
                  <p className="mt-1 font-black text-emerald-300">
                    API COLLEGATA
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-black p-4">
                  <p className="text-xs font-black uppercase text-zinc-600">
                    Affiliate Key
                  </p>
                  <p className={`mt-1 font-black ${
                    sumupInfo.affiliateConfigured
                      ? "text-emerald-300"
                      : "text-red-300"
                  }`}>
                    {sumupInfo.affiliateConfigured
                      ? "CONFIGURATA"
                      : "MANCANTE"}
                  </p>
                </div>
              </div>

              {sumupInfo.readers.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {sumupInfo.readers.map(
                    (reader) => (
                      <div
                        key={reader.id}
                        className="rounded-xl border border-emerald-700/50 bg-emerald-950/20 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-black">
                              {reader.name ||
                                "SumUp Solo"}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {reader.model ||
                                "reader"}
                              {reader.identifier
                                ? ` · ${reader.identifier}`
                                : ""}
                            </p>
                          </div>

                          <span className="rounded-lg border border-emerald-700 px-3 py-1 text-xs font-black uppercase text-emerald-300">
                            {reader.status}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-black p-5">
                  <p className="font-black">
                    Nessun Solo associato
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    Sul Solo: esci dall'account, apri Connections → API → Connect e genera il codice. Poi inseriscilo qui entro 5 minuti.
                  </p>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={pairingCode}
                      onChange={(event) =>
                        setPairingCode(
                          event.target.value
                            .toUpperCase()
                        )
                      }
                      maxLength={9}
                      placeholder="CODICE PAIRING"
                      autoComplete="off"
                      className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4 font-black uppercase tracking-[0.15em] text-white outline-none focus:border-yellow-400"
                    />

                    <button
                      type="button"
                      onClick={pairSumUp}
                      disabled={pairingLoading}
                      className="rounded-xl bg-yellow-400 px-6 py-4 font-black text-black hover:bg-yellow-300 disabled:opacity-50"
                    >
                      {pairingLoading
                        ? "COLLEGO..."
                        : "COLLEGA SUMUP SOLO"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
            Scansione
          </p>

          <h2 className="mt-2 text-xl font-black">
            Scansiona QR o inserisci PP
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Funziona sia con il codice PP sia con l'URL completo contenuto nel QR.
          </p>

          <form
            onSubmit={submitScan}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <input
              ref={scanRef}
              type="text"
              value={scan}
              onChange={(event) =>
                setScan(
                  event.target.value
                )
              }
              placeholder="PP-000002"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-black px-4 py-4 text-lg font-black uppercase text-white outline-none focus:border-yellow-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-yellow-400 px-6 py-4 font-black text-black transition hover:bg-yellow-300 disabled:opacity-50"
            >
              {loading
                ? "CERCO..."
                : "APRI ARTICOLO"}
            </button>
          </form>

          <div className="mt-3">
            <button
              type="button"
              onClick={
                cameraOpen
                  ? stopCamera
                  : openCamera
              }
              disabled={cameraLoading}
              className="w-full rounded-xl border border-yellow-400 px-6 py-4 font-black text-yellow-400 transition hover:bg-yellow-400 hover:text-black disabled:opacity-50"
            >
              {cameraLoading
                ? "APERTURA FOTOCAMERA..."
                : cameraOpen
                ? "CHIUDI FOTOCAMERA"
                : "📷 SCANSIONA QR CON FOTOCAMERA"}
            </button>
          </div>

          {cameraError ? (
            <div className="mt-3 rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm font-bold text-red-300">
              {cameraError}
            </div>
          ) : null}

          {cameraOpen ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-yellow-400/40 bg-black">
              <div className="relative aspect-[4/3] w-full bg-black sm:aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-52 w-52 rounded-3xl border-4 border-yellow-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] sm:h-64 sm:w-64" />
                </div>

                <div className="pointer-events-none absolute bottom-4 left-0 right-0 text-center">
                  <span className="rounded-full bg-black/80 px-4 py-2 text-xs font-black text-white">
                    INQUADRA IL QR POPORAMA
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-800 bg-red-950/30 px-5 py-4 font-bold text-red-300">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-5 rounded-2xl border border-emerald-700 bg-emerald-950/30 px-5 py-4 font-bold text-emerald-300">
            {success}
          </div>
        ) : null}

        {articolo ? (
          <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-yellow-400 px-3 py-1 text-sm font-black text-black">
                    {articolo.codicePP}
                  </span>

                  <span
                    className={`rounded-lg border px-3 py-1 text-sm font-black ${
                      sold
                        ? "border-red-700 bg-red-950/30 text-red-300"
                        : "border-emerald-700 bg-emerald-950/30 text-emerald-300"
                    }`}
                  >
                    {articolo.statoVendita}
                  </span>

                  <span className="rounded-lg border border-zinc-700 px-3 py-1 text-sm font-black">
                    GRADO {articolo.grado}
                  </span>
                </div>

                <h2 className="mt-4 max-w-3xl text-2xl font-black">
                  {articolo.nomeProdotto ||
                    "Articolo POPORAMA"}
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  EAN: {articolo.ean || "—"} · ASIN: {articolo.asin || "—"}
                </p>
              </div>

              <a
                href={`/${lang}/poporama-test/articoli/${encodeURIComponent(
                  articolo.codicePP
                )}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm font-black hover:border-zinc-500"
              >
                VEDI SCHEDA
              </a>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <ValueCard
                label="Retail"
                value={euro(
                  articolo.retail
                )}
              />

              <ValueCard
                label="Percentuale"
                value={`${articolo.percentualePrezzo || 0}%`}
              />

              <ValueCard
                label="Prezzo POPORAMA"
                value={euro(
                  articolo.prezzoPoporama
                )}
                important
              />
            </div>

            {sold ? (
              <div className="mt-6 rounded-2xl border border-red-800 bg-red-950/20 p-5">
                <p className="text-sm font-black text-red-300">
                  ARTICOLO GIÀ VENDUTO
                </p>

                <p className="mt-2 text-sm text-zinc-300">
                  Prezzo vendita:{" "}
                  <strong>
                    {euro(
                      articolo.prezzoVendita
                    )}
                  </strong>
                  {articolo.dataVendita
                    ? ` · ${new Date(
                        articolo.dataVendita
                      ).toLocaleString(
                        "it-IT"
                      )}`
                    : ""}
                </p>
              </div>
            ) : (
              <div className="mt-7 rounded-2xl border border-yellow-500/20 bg-black p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                  Vendita rapida
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-500">
                      Prezzo effettivo vendita
                    </label>

                    <div className="mt-2 flex items-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 focus-within:border-yellow-400">
                      <span className="font-black text-zinc-500">
                        €
                      </span>

                      <input
                        type="text"
                        inputMode="decimal"
                        value={prezzoVendita}
                        onChange={(event) =>
                          setPrezzoVendita(
                            event.target.value
                          )
                        }
                        className="min-w-0 flex-1 bg-transparent px-3 py-4 text-2xl font-black text-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      confermaVendita
                    }
                    disabled={selling}
                    className="rounded-xl bg-emerald-400 px-7 py-4 text-lg font-black text-black transition hover:bg-emerald-300 disabled:opacity-50"
                  >
                    {selling
                      ? "REGISTRO..."
                      : "CONFERMA VENDITA"}
                  </button>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-zinc-600">
                  Fase test: questo pulsante registra direttamente VENDUTO su Shopify.
                  Quando collegheremo SumUp, la registrazione avverrà solo dopo conferma del pagamento.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={nuovaScansione}
              className="mt-5 w-full rounded-xl border border-zinc-700 px-5 py-4 font-black hover:border-yellow-400"
            >
              NUOVA SCANSIONE
            </button>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function ValueCard({
  label,
  value,
  important = false,
}: {
  label: string;
  value: string;
  important?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <p className="text-xs font-black uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-black ${
          important
            ? "text-yellow-400"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
