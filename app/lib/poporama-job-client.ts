"use client";
import type { ImportJob } from "./poporama-import-jobs";
import type { ManifestArticle } from "./poporama-manifest";
export type PendingManifest = { rows: ManifestArticle[]; legacyStorageKey?: string };
export async function jobRequest(url: string, body?: unknown, signal?: AbortSignal) {
  const response = await fetch(url, { method: body === undefined ? "GET" : "POST", cache: "no-store", signal,
    ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) });
  const data = await response.json();
  if (!response.ok || !data.ok) throw Object.assign(new Error(data.error || "Operazione non disponibile"), { status: response.status, retryMs: data.retryMs });
  return data;
}
function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("poporama-manifest-jobs", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("pending");
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
}
export async function pendingManifest(handle: string, operation: "get" | "put" | "delete", value?: PendingManifest): Promise<PendingManifest | undefined> {
  const database = await db();
  try { return await new Promise((resolve, reject) => {
    const transaction = database.transaction("pending", operation === "get" ? "readonly" : "readwrite");
    const store = transaction.objectStore("pending");
    const request = operation === "get" ? store.get(handle) : operation === "put" ? store.put(value, handle) : store.delete(handle);
    transaction.oncomplete = () => resolve(operation === "get" ? request.result : undefined);
    transaction.onerror = () => reject(transaction.error); transaction.onabort = () => reject(transaction.error);
  }); } finally { database.close(); }
}
export async function drainJob(handle: string, update: (job: ImportJob, notice?: string) => void, signal: AbortSignal) {
  let failures = 0;
  while (!signal.aborted) {
    try {
      let job = (await jobRequest(`/api/poporama/jobs/${handle}`, undefined, signal)).job as ImportJob;
      update(job);
      if (job.phase === "completed" || job.phase === "failed") return job;
      if (job.phase === "uploading") {
        const pending = await pendingManifest(handle, "get");
        if (!pending) { update(job, "Caricamento interrotto prima dell’invio completo: seleziona nuovamente lo stesso file per riprendere senza duplicati."); return job; }
        for (let index = 0; index < job.chunks && !signal.aborted; index++) {
          if (job.uploaded.includes(index)) continue;
          job = (await jobRequest(`/api/poporama/jobs/${handle}/chunks`, { index, rows: pending.rows.slice(index * 100, (index + 1) * 100) }, signal)).job;
          update(job);
        }
      } else {
        const result = await jobRequest("/api/poporama/jobs/run", { handle }, signal);
        if (result.job) { job = result.job; update(job); }
      }
      failures = 0;
      await new Promise(resolve => setTimeout(resolve, Math.min(5000, Math.max(300, (job.nextRunAt || 0) - Date.now()))));
    } catch (error) {
      if (signal.aborted) return null;
      const e = error as Error & { status?: number; retryMs?: number };
      if (e.status === 401 || e.status === 403 || e.status === 400 || e.status === 404) throw error;
      failures++;
      // Controlled backoff; reopening the page resumes the same durable job.
      await new Promise(resolve => setTimeout(resolve, Math.min(10000, e.retryMs || 500 * 2 ** Math.min(failures, 5))));
    }
  }
  return null;
}
