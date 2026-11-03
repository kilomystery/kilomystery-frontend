"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import PoporamaJobProgress from "@/app/components/PoporamaJobProgress";
import PoporamaTranslateMissing from "@/app/components/PoporamaTranslateMissing";
import { jobRequest, pendingManifest } from "@/app/lib/poporama-job-client";
import type { ImportJob } from "@/app/lib/poporama-import-jobs";
export default function ImportaManifestPage() {
  const params = useParams();
  const handle = String(params.handle || ""), lang = String(params.lang || "it");
  const [jobHandle, setJobHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  const storageKey = `poporama-active-import:${handle}`;
  useEffect(() => {
    const abort = new AbortController(); controller.current = abort;
    const saved = localStorage.getItem(storageKey);
    if (saved) { setJobHandle(saved); setBusy(true); }
    else (async () => {
      let next: string | null = null;
      do {
        const data = await jobRequest(`/api/poporama/jobs?lottoHandle=${encodeURIComponent(handle)}${next ? `&after=${encodeURIComponent(next)}` : ""}`, undefined, abort.signal);
        const active = (data.jobs as ImportJob[]).find(job => job.kind === "import" && !["completed", "failed"].includes(job.phase));
        if (active) { localStorage.setItem(storageKey, active.handle); setJobHandle(active.handle); setBusy(true); return; }
        next = data.next;
      } while (next && !abort.signal.aborted);
    })().catch(e => { if (!abort.signal.aborted) setError(e.message); });
    return () => abort.abort();
  }, [handle, storageKey]);
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); setError(""); setNotice("Lettura automatica del manifest…"); setJobHandle("");
    try {
      const form = new FormData(); form.set("file", file);
      const response = await fetch("/api/poporama/manifest/parse", { method: "POST", body: form, signal: controller.current?.signal });
      const parsed = await response.json();
      if (!response.ok || !parsed.ok) throw new Error(parsed.error || "Manifest non leggibile");
      const legacyStorageKey = ["poporama-import", handle, file.name, file.size, file.lastModified].join(":");
      let legacyPlan;
      try { legacyPlan = JSON.parse(localStorage.getItem(legacyStorageKey) || "null"); } catch { /* no legacy plan */ }
      let result;
      for (let attempt = 0; ; attempt++) {
        try { result = await jobRequest("/api/poporama/jobs", { kind: "import", lottoHandle: handle, digest: parsed.digest, total: parsed.rows.length, fileName: file.name, legacyPlan }, controller.current?.signal); break; }
        catch (e) { if ((e as { status?: number }).status !== 503 || attempt >= 10) throw e; await new Promise(r => setTimeout(r, 1000)); }
      }
      if (result.job.phase === "uploading") await pendingManifest(result.job.handle, "put", { rows: parsed.rows, legacyStorageKey: legacyPlan ? legacyStorageKey : undefined });
      localStorage.setItem(storageKey, result.job.handle);
      setJobHandle(result.job.handle); setNotice("");
    } catch (e) { if (!controller.current?.signal.aborted) { setError((e as Error).message); setBusy(false); setNotice(""); } }
  }
  return <main className="min-h-screen bg-zinc-950 p-6 text-white"><div className="mx-auto max-w-4xl space-y-6">
    <a className="text-yellow-400" href={`/${lang}/poporama-test/lotti/${encodeURIComponent(handle)}`}>← Torna al carico</a>
    <h1 className="text-3xl font-black text-yellow-400">Importa manifest</h1>
    <p className="text-zinc-400">Carica il manifest Amazon: importazione e traduzione italiana partiranno automaticamente, senza revisioni o conferme delle righe. Ogni riga mantiene il suo codice PP e il nome originale.</p>
    <label className="block rounded-2xl border-2 border-yellow-400 p-6 font-bold">Carica CSV o Excel (XLS / XLSX)
      <input aria-label="Carica manifest CSV o Excel" type="file" accept=".csv,.xls,.xlsx" disabled={busy} className="mt-4 block w-full text-sm disabled:opacity-50" onChange={e => { const file = e.target.files?.[0]; e.target.value = ""; void upload(file); }} />
    </label>
    <p className="text-sm text-zinc-400">Gli articoli partono dal Grado N con la percentuale COGS delle impostazioni del carico. I prezzi manuali e gli altri dati esistenti restano conservati.</p>
    {notice && <p role="status">{notice}</p>}
    {error && <p role="alert" className="text-red-300">{error}</p>}
    {jobHandle && <PoporamaJobProgress handle={jobHandle} onFinish={job => { setBusy(false); if (job.phase === "completed" || job.phase === "failed") localStorage.removeItem(storageKey); }} />}
    <PoporamaTranslateMissing lottoHandle={handle} />
  </div></main>;
}
