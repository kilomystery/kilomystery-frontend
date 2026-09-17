"use client";

import { useState } from "react";

const inputClass =
  "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400";

export default function NuovoLottoPage() {
  const [lotCode, setLotCode] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [supplier, setSupplier] = useState("");
  const [source, setSource] = useState("B-Stock Amazon EU");
  const [declaredItems, setDeclaredItems] = useState("");
  const [purchaseReference, setPurchaseReference] = useState("");

  const [purchasePrice, setPurchasePrice] = useState("");
  const [transportCost, setTransportCost] = useState("");
  const [otherCosts, setOtherCosts] = useState("");

  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalCost =
    toNumber(purchasePrice) +
    toNumber(transportCost) +
    toNumber(otherCosts);

  async function createLot() {
    setError("");
    setSuccess("");

    if (!lotCode.trim()) {
      setError("Inserisci il nome / codice lotto.");
      return;
    }

    if (!purchaseDate) {
      setError("Inserisci la data di acquisto.");
      return;
    }

    if (!supplier.trim()) {
      setError("Inserisci il fornitore.");
      return;
    }

    if (!declaredItems.trim()) {
      setError("Inserisci il numero di pezzi dichiarato.");
      return;
    }

    const itemCount = Number(declaredItems);

    if (!Number.isInteger(itemCount) || itemCount < 0) {
      setError("Numero pezzi dichiarato non valido.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/poporama/lotti", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codiceLotto: lotCode.trim(),
          dataAcquisto: purchaseDate,
          fornitore: supplier.trim(),
          provenienza: source,
          numeroPezziDichiarato: itemCount,
          riferimentoAcquisto: purchaseReference.trim(),
          costoMerce: purchasePrice || "0",
          costoTrasporto: transportCost || "0",
          altriCosti: otherCosts || "0",
          note: notes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        console.error("Errore creazione lotto:", data);

        let message =
          data.error || "Impossibile creare il lotto.";

        if (Array.isArray(data.details)) {
          const details = data.details
            .map((detail: { message?: string }) => detail.message)
            .filter(Boolean)
            .join(" ");

          if (details) {
            message += ` ${details}`;
          }
        }

        setError(message);
        return;
      }

      setSuccess(
        `Lotto ${lotCode.trim()} creato correttamente su Shopify.`
      );
    } catch (err) {
      console.error("Errore salvataggio lotto:", err);

      setError(
        "Errore di connessione durante il salvataggio del lotto."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
        {/* INDIETRO */}
        <a
          href="../"
          className="text-sm font-bold text-zinc-400 transition hover:text-white"
        >
          ← Lotti & Carichi
        </a>

        {/* HEADER */}
        <header className="mt-6">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
            POPORAMA
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Nuovo lotto
          </h1>

          <p className="mt-2 text-zinc-400">
            Registra un nuovo carico in ingresso.
          </p>
        </header>

        {/* IDENTIFICAZIONE */}
        <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <h2 className="text-xl font-black">
            Identificazione
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Nome / Codice lotto">
              <input
                type="text"
                value={lotCode}
                onChange={(e) => setLotCode(e.target.value)}
                className={inputClass}
                placeholder="Es. AMZ-2026-001"
              />
            </Field>

            <Field label="Data acquisto">
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Fornitore">
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className={inputClass}
                placeholder="Nome fornitore"
              />
            </Field>

            <Field label="Provenienza">
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className={inputClass}
              >
                <option value="B-Stock Amazon EU">
                  B-Stock Amazon EU
                </option>

                <option value="Stocklear">
                  Stocklear
                </option>

                <option value="Liquidazione giudiziaria">
                  Liquidazione giudiziaria
                </option>

                <option value="Fallimento / cessazione">
                  Fallimento / cessazione
                </option>

                <option value="Fornitore diretto">
                  Fornitore diretto
                </option>

                <option value="Altro">
                  Altro
                </option>
              </select>
            </Field>

            <Field label="Numero pezzi dichiarato">
              <input
                type="number"
                min="0"
                step="1"
                value={declaredItems}
                onChange={(e) => setDeclaredItems(e.target.value)}
                className={inputClass}
                placeholder="Es. 523"
              />
            </Field>

            <Field label="Riferimento acquisto / asta">
              <input
                type="text"
                value={purchaseReference}
                onChange={(e) =>
                  setPurchaseReference(e.target.value)
                }
                className={inputClass}
                placeholder="Es. Auction 98271"
              />
            </Field>
          </div>
        </section>

        {/* COSTI */}
        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <h2 className="text-xl font-black">
            Costi del carico
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Questi dati serviranno per calcolare quanto capitale è
            stato recuperato con le vendite.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <Field label="Costo merce €">
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={purchasePrice}
                onChange={(e) =>
                  setPurchasePrice(e.target.value)
                }
                className={inputClass}
                placeholder="5500.00"
              />
            </Field>

            <Field label="Trasporto €">
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={transportCost}
                onChange={(e) =>
                  setTransportCost(e.target.value)
                }
                className={inputClass}
                placeholder="2706.00"
              />
            </Field>

            <Field label="Altri costi €">
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={otherCosts}
                onChange={(e) =>
                  setOtherCosts(e.target.value)
                }
                className={inputClass}
                placeholder="275.00"
              />
            </Field>
          </div>

          {/* TOTALE */}
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
              Costo totale carico
            </p>

            <p className="mt-2 text-4xl font-black text-yellow-400">
              {formatCurrency(totalCost)}
            </p>

            <p className="mt-2 text-xs text-zinc-500">
              Merce + trasporto + altri costi
            </p>
          </div>
        </section>

        {/* INVENTARIO */}
        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <h2 className="text-xl font-black">
            Inventario iniziale
          </h2>

          <p className="mt-2 text-zinc-400">
            Dopo aver creato il lotto potrai scegliere come inserire
            la merce.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
              <p className="text-3xl">📄</p>

              <h3 className="mt-3 text-lg font-black">
                Con manifest
              </h3>

              <p className="mt-2 text-sm text-zinc-400">
                Importeremo CSV o Excel e creeremo automaticamente
                tutti i prodotti come N — NON TESTATO.
              </p>

              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-zinc-600">
                Disponibile dopo la creazione del lotto
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
              <p className="text-3xl">📦</p>

              <h3 className="mt-3 text-lg font-black">
                Senza manifest
              </h3>

              <p className="mt-2 text-sm text-zinc-400">
                Potrai censire i prodotti uno alla volta tramite EAN,
                barcode o inserimento manuale.
              </p>

              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-zinc-600">
                Disponibile dopo la creazione del lotto
              </p>
            </div>
          </div>
        </section>

        {/* NOTE */}
        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <h2 className="text-xl font-black">
            Note
          </h2>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Informazioni sul carico, pallet, condizioni generali, note del fornitore..."
            className="mt-5 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400"
          />
        </section>

        {/* ERRORE */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-800 bg-red-950/40 p-5">
            <p className="font-black text-red-300">
              Impossibile creare il lotto
            </p>

            <p className="mt-2 text-sm text-red-200">
              {error}
            </p>
          </div>
        )}

        {/* SUCCESSO */}
        {success && (
          <div className="mt-6 rounded-2xl border border-green-800 bg-green-950/40 p-5">
            <p className="font-black text-green-300">
              ✓ Lotto creato
            </p>

            <p className="mt-2 text-sm text-green-200">
              {success}
            </p>
          </div>
        )}

        {/* CREA LOTTO */}
        <button
          type="button"
          onClick={createLot}
          disabled={saving || Boolean(success)}
          className="mt-8 w-full cursor-pointer rounded-2xl bg-yellow-400 px-8 py-5 text-xl font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "SALVATAGGIO SU SHOPIFY..."
            : success
              ? "LOTTO CREATO ✓"
              : "CREA LOTTO →"}
        </button>

        {success && (
          <a
            href="../"
            className="mt-4 block w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-8 py-4 text-center font-black transition hover:border-yellow-400"
          >
            VAI A LOTTI & CARICHI →
          </a>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-zinc-300">
        {label}
      </span>

      {children}
    </label>
  );
}

function toNumber(value: string) {
  if (!value) {
    return 0;
  }

  const normalized = value.replace(",", ".");
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return parsed;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}