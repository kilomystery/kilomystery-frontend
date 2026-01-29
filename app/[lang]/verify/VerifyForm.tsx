"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VerifyForm({ lang }: { lang: string }) {
  const r = useRouter();
  const [code, setCode] = useState("");

  return (
    <form
      className="flex flex-col md:flex-row gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const v = code.trim();
        if (!v) return;
        r.push(`/${lang}/verify/${encodeURIComponent(v)}`);
      }}
    >
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="KM-20260128-PRM-5KG-0001"
        className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/30"
      />
      <button type="submit" className="btn btn-brand">
        Verifica
      </button>
    </form>
  );
}
