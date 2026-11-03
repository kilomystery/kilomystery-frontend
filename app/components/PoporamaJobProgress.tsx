"use client";
import { useEffect, useRef, useState } from "react";
import { drainJob, pendingManifest, jobRequest } from "@/app/lib/poporama-job-client";
import type { ImportJob } from "@/app/lib/poporama-import-jobs";
export default function PoporamaJobProgress({ handle, onFinish }: { handle: string; onFinish?: (job: ImportJob) => void }) {
  const [job, setJob] = useState<ImportJob | null>(null);
  const [notice, setNotice] = useState("");
  const [attempt, setAttempt] = useState(0);
  const finish = useRef(onFinish); finish.current = onFinish;
  useEffect(() => {
    const controller = new AbortController();
    drainJob(handle, (next, message) => { if (!controller.signal.aborted) { setJob(next); setNotice(message || ""); } }, controller.signal)
      .then(async result => {
        if (controller.signal.aborted || !result) return;
        if (result.phase === "completed") {
          const pending = await pendingManifest(handle, "get").catch(() => undefined);
          if (pending?.legacyStorageKey) localStorage.removeItem(pending.legacyStorageKey);
          await pendingManifest(handle, "delete").catch(() => undefined);
        }
        finish.current?.(result);
      }).catch(error => { if (!controller.signal.aborted) setNotice(error.message); });
    return () => controller.abort();
  }, [handle, attempt]);
  if (!job) return <p role="status">Recupero elaborazione…</p>;
  const complete = job.phase === "completed";
  const labels: Record<ImportJob["phase"], string> = { uploading: "Invio automatico del manifest", allocating: "Preparazione codici identificativi", scanning: "Ricerca nomi mancanti", queued: "In coda", running: "Importazione e traduzione automatica", completed: "Elaborazione completata", failed: "Elaborazione interrotta: i dati salvati sono conservati" };
  const done = job.phase === "uploading" ? Math.min(job.total, job.uploaded.length * 100) : job.position;
  return <section aria-label="Avanzamento elaborazione" className="mt-5 space-y-3 rounded-2xl border border-zinc-700 bg-zinc-900 p-5">
    <p role="status" className="font-bold text-yellow-400">{labels[job.phase]}</p>
    {!complete && <><progress className="w-full accent-yellow-400" max={Math.max(job.total, 1)} value={done} /><p>{done} / {job.total} articoli</p></>}
    {(complete || job.phase === "failed") && <dl className="grid gap-4 sm:grid-cols-3">
      <div><dt>{job.kind === "import" ? "Articoli importati" : "Articoli elaborati"}</dt><dd className="text-2xl font-bold">{job.kind === "import" ? job.imported : job.position}</dd></div>
      <div><dt>Tradotti</dt><dd className="text-2xl font-bold">{job.translated}</dd></div>
      <div><dt>Non tradotti</dt><dd className="text-2xl font-bold">{job.untranslated}</dd></div>
    </dl>}
    {complete && job.untranslated > 0 && <p className="text-sm text-zinc-400">Gli articoli non tradotti conservano il nome originale. Puoi riprovare con “Traduci nomi mancanti”.</p>}
    {job.phase === "failed" && <button type="button" className="rounded-xl border border-yellow-400 px-3 py-2 text-yellow-400" onClick={async () => {
      try { await jobRequest(`/api/poporama/jobs/${handle}`, { action: "retry" }); setAttempt(n => n + 1); }
      catch (e) { setNotice((e as Error).message); }
    }}>Riprendi elaborazione dal checkpoint</button>}
    {(notice || job.error) && <p role="alert" className="text-sm text-amber-300">{notice || job.error}</p>}
  </section>;
}
