// app/[lang]/verify/VerifyForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VerifyForm({ lang }: { lang: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");

  function normalize(v: string) {
    return v.trim().replace(/\s+/g, "");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const v = normalize(code);
        if (!v) return;
        router.push(`/${lang}/verify/${encodeURIComponent(v)}`);
      }}
      className="flex flex-col md:flex-row gap-3"
    >
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Inserisci codice (es. KM-20260128-PRM-5KG-0001)"
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/25"
      />
      <button
        type="submit"
        className="btn btn-brand rounded-2xl px-5 py-3 font-semibold"
      >
        Verifica
      </button>
    </form>
  );
}
