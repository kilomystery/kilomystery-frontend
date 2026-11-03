"use client";
import { useState } from "react";
import { jobRequest } from "@/app/lib/poporama-job-client";
import PoporamaJobProgress from "./PoporamaJobProgress";
export default function PoporamaTranslateMissing({ lottoHandle, onComplete }: { lottoHandle?: string; onComplete?: () => void }) {
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <div className="mt-5">
    <button disabled={busy} type="button" className="rounded-xl border border-yellow-400 px-4 py-3 font-bold text-yellow-400 disabled:opacity-50" onClick={async () => {
      setBusy(true); setError("");
      try { const data = await jobRequest("/api/poporama/jobs", { kind: "translate", lottoHandle }); setHandle(data.job.handle); }
      catch (e) { setError((e as Error).message); setBusy(false); }
    }}>Traduci nomi mancanti</button>
    <p className="mt-2 text-xs text-zinc-400">Traduzione automatica dei titoli mancanti. Le correzioni manuali vengono conservate.</p>
    {error && <p role="alert" className="text-red-300">{error}</p>}
    {handle && <PoporamaJobProgress handle={handle} onFinish={() => { setBusy(false); onComplete?.(); }} />}
  </div>;
}
