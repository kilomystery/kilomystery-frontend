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
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(value) ? value : 0);
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
    useState<ArticoloCassa | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      setAuthenticated(
        Boolean(
          response.ok &&
          data.authenticated
        )
      );
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
      setError(
        "Inserisci il PIN cassa."
      );
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

      if (
        response.status === 401
      ) {
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

  function apriScheda() {
    if (!articolo) {
      return;
    }

    window.location.assign(
      `/${lang}/poporama-test/articoli/${encodeURIComponent(
        articolo.codicePP
      )}`
    );
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
        "Questo articolo risulta gia venduto."
      );
      return;
    }

    const price = Number(
      prezzoVendita
        .trim()
        .replace(",", ".")
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
        )}?\n\nL articolo verra segnato come VENDUTO nell archivio POPORAMA.`
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

      if (
        response.status === 401
      ) {
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

      const updated =
        data.articolo
          ? (
              data.articolo as ArticoloCassa
            )
          : {
              ...articolo,
              statoVendita:
                "VENDUTO",
              prezzoVendita:
                price,
              dataVendita:
                new Date().toISOString(),
            };

      setArticolo(updated);

      setSuccess(
        `${articolo.codicePP} segnato come VENDUTO a ${euro(
          price
        )}.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Vendita non registrata."
      );
    } finally {
      setSelling(false);
    }
  }

  function nuovaScansione() {
    setArticolo(null);
    setScan("");
    setPrezzoVendita("");
    setError("");
    setSuccess("");
    setCameraError("");

    window.setTimeout(() => {
      scanRef.current?.focus();
    }, 100);
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-black px-4 py-12 text-white">
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
      <main className="min-h-screen bg-black px-4 py-12 text-white">
        <div className="mx-auto max-w-md">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7 sm:p-9">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
              POPORAMA
            </p>

            <h1 className="mt-3 text-3xl font-black">
              Cassa
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Inserisci il PIN per accedere alla cassa interna POPORAMA.
            </p>

            <form
              onSubmit={login}
              className="mt-7"
            >
              <label className="block text-xs font-black uppercase tracking-[0.15em] text-zinc-500">
                PIN CASSA
              </label>

              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(event) =>
                  setPin(
                    event.target.value
                  )
                }
                autoFocus
                autoComplete="off"
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-black px-4 py-4 text-xl font-black tracking-[0.25em] text-white outline-none focus:border-yellow-400"
              />

              {error ? (
                <div className="mt-4 rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm font-bold text-red-300">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loginLoading}
                className="mt-5 w-full rounded-xl bg-yellow-400 px-5 py-4 font-black text-black hover:bg-yellow-300 disabled:opacity-50"
              >
                {loginLoading
                  ? "ACCESSO..."
                  : "ENTRA IN CASSA"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  const isSold =
    articolo?.statoVendita
      ?.toUpperCase() === "VENDUTO";

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
              POPORAMA TEST CENTER
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Cassa
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              QR, codice PP, apertura scheda e registrazione vendita.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
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
              disabled={loading}
              className="rounded-xl bg-yellow-400 px-6 py-4 font-black text-black hover:bg-yellow-300 disabled:opacity-50"
            >
              {loading
                ? "CERCO..."
                : "APRI PRODOTTO"}
            </button>

            <button
              type="button"
              onClick={
                cameraOpen
                  ? stopCamera
                  : openCamera
              }
              disabled={cameraLoading}
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
            {success}
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
                  "DISPONIBILE"}
              </span>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info
                label="GRADO"
                value={
                  articolo.grado || "N"
                }
              />

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
                className="rounded-xl border border-zinc-600 px-5 py-4 font-black hover:border-yellow-400 hover:text-yellow-400"
              >
                VEDI SCHEDA ARTICOLO
              </button>

              <button
                type="button"
                onClick={nuovaScansione}
                className="rounded-xl border border-zinc-700 px-5 py-4 font-black hover:border-zinc-500"
              >
                NUOVA SCANSIONE
              </button>
            </div>

            {isSold ? (
              <div className="mt-7 rounded-2xl border border-red-900 bg-red-950/20 p-5">
                <p className="font-black text-red-300">
                  ARTICOLO GIA VENDUTO
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
            ) : (
              <div className="mt-7 rounded-2xl border border-yellow-500/20 bg-black p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-400">
                  Registra vendita
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Il prezzo proposto e il prezzo POPORAMA. Puoi modificarlo prima di confermare.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-black uppercase tracking-[0.15em] text-zinc-500">
                      PREZZO VENDITA EUR
                    </label>

                    <input
                      type="text"
                      inputMode="decimal"
                      value={prezzoVendita}
                      onChange={(event) =>
                        setPrezzoVendita(
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-xl font-black text-white outline-none focus:border-yellow-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={
                      confermaVendita
                    }
                    disabled={selling}
                    className="rounded-xl bg-emerald-500 px-6 py-4 font-black text-black hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {selling
                      ? "REGISTRO..."
                      : "SEGNA VENDUTO"}
                  </button>
                </div>
              </div>
            )}
          </section>
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