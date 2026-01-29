"use client";

import Link from "next/link";
import { useState } from "react";

export default function VerifyFormPage({ params }: { params: { lang: string } }) {
  const lang = params?.lang || "it";
  const [code, setCode] = useState("");

  const href = code.trim() ? `/${lang}/verify/${encodeURIComponent(code.trim())}` : `/${lang}/verify`;

  return (
    <main className="container py-10">
      <div className="card border-white/15 bg-[#0b0f14]/60">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Verifica autenticità</h1>
          <p className="mt-2 text-white/70">
            Inserisci il codice lotto presente sull’etichetta KiloMystery.
          </p>

          <div className="mt-6 grid gap-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="es: KM-20260129-PRM-5KG-1234-01"
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/30"
            />

            <Link
              href={href}
              className={`btn btn-brand ${!code.trim() ? "pointer-events-none opacity-50" : ""}`}
            >
              Verifica
            </Link>

            <p className="text-xs text-white/60">
              Scansioni il QR? Ti porta qui automaticamente con il codice.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
