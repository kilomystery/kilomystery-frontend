import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { POST as createArticle } from "@/app/api/poporama/articoli/route";
import { accessToken, byHandle, byId, field, manyHandles, page, RetryLater, updateNode, withShopifyBudget, type MetaNode } from "./poporama-shopify";
import { CHUNK_SIZE, CHUNK_TYPE, JOB_TYPE, decode, ensureJobSchema, lease, listJobNodes, put, read } from "./poporama-job-store";
import { withImportContext } from "./poporama-import-context";
import { lockPPSequence, rememberPPNumber, reservePPRange, readPPReservation } from "./poporama-pp-sequence";
import { extractPPNumber, formatPPCode } from "./poporama-pp";
import { titleInfo, needsTranslation, withTitle, type TitleState } from "./poporama-titles";
import { titleKey, translateCached } from "./poporama-translation";
import { parseTestPercentage } from "./poporama-test-pricing";
import type { ManifestArticle } from "./poporama-manifest";
export type ImportJob = {
  version: 1; resumePhase?: ImportJob["phase"]; handle: string; kind: "import" | "translate"; lottoId: string; lottoHandle: string;
  phase: "uploading" | "allocating" | "scanning" | "queued" | "running" | "completed" | "failed";
  total: number; position: number; imported: number; translated: number; untranslated: number;
  chunks: number; uploaded: number[]; percentage: number; cursor: string | null; maxPP: number;
  reservation?: { from: number; to: number; ppReservation: string }; fileName?: string;
  createdAt: string; updatedAt: string; nextRunAt?: number; failures: number; error?: string;
};
type Chunk = { rows: ManifestArticle[] } | { ids: string[] };
export const chunkHandle = (job: string, index: number) => `${job}-block-${index}`;
export async function saveJob(job: ImportJob) { job.updatedAt = new Date().toISOString(); await put(JOB_TYPE, job.handle, job); }
export async function createJob(input: { kind: "import" | "translate"; lottoHandle?: string; digest?: string; total?: number; fileName?: string; legacyPlan?: { ppReservation?: string; firstPPNumber?: number; totalRows?: number; handle?: string } | null }) {
  await ensureJobSchema();
  const lot = input.lottoHandle ? await byHandle("poporama_lotto", input.lottoHandle) : null;
  if (input.kind === "import" && !lot) throw new Error("Carico non trovato.");
  if (input.lottoHandle && !lot) throw new Error("Carico non trovato.");
  const percentage = lot ? parseTestPercentage(field(lot, "percentuale_grado_n") || 50) : 50;
  if (percentage === null) throw new Error("Percentuale N del carico non valida.");
  const total = input.kind === "import" ? input.total! : 0;
  if (input.kind === "import" && (!Number.isSafeInteger(total) || total < 1 || total > 100000 || !/^[a-f0-9]{64}$/.test(input.digest || ""))) throw new Error("Manifest non valido.");
  const hash = createHash("sha256").update(`${lot?.id || "all"}:${input.kind}:${input.kind === "import" ? input.digest : Date.now()}`).digest("hex");
  const handle = `job-${hash}`;
  const unlock = await lease();
  if (!unlock) throw new RetryLater("Coda occupata, riprovo automaticamente", 1000);
  try {
    const old = await read<ImportJob>(JOB_TYPE, handle);
    if (old) { if (old.total !== total && input.kind === "import") throw new Error("Manifest già registrato con conteggio diverso."); return old; }
    const job: ImportJob = { version: 1, handle, kind: input.kind, lottoId: lot?.id || "", lottoHandle: input.lottoHandle || "", phase: input.kind === "import" ? "uploading" : "scanning",
      total, position: 0, imported: 0, translated: 0, untranslated: 0, chunks: input.kind === "import" ? Math.ceil(total / CHUNK_SIZE) : 0, uploaded: [], percentage,
      cursor: null, maxPP: 0, fileName: input.fileName?.slice(0, 200), failures: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    if (input.kind === "import" && input.legacyPlan) {
      const plan = input.legacyPlan;
      const reserved = readPPReservation(plan.ppReservation, job.lottoId);
      if (!reserved || plan.handle !== job.lottoHandle || plan.firstPPNumber !== reserved.from || plan.totalRows !== total || reserved.to - reserved.from + 1 !== total) throw new Error("Piano precedente incompatibile: nessun nuovo articolo è stato creato. Conserva il manifest per recuperare il piano originale.");
      job.reservation = { from: reserved.from, to: reserved.to, ppReservation: plan.ppReservation! };
      const counter = await read<{ max: number }>(JOB_TYPE, "pp-counter");
      await put(JOB_TYPE, "pp-counter", { max: Math.max(counter?.max || 0, reserved.to) });
    }
    await saveJob(job); return job;
  } finally { await unlock(); }
}
export async function uploadChunk(handle: string, index: number, rows: ManifestArticle[]) {
  await ensureJobSchema();
  const unlock = await lease(); if (!unlock) throw new RetryLater("Coda occupata", 1000);
  try {
    const job = await read<ImportJob>(JOB_TYPE, handle);
    if (!job || job.kind !== "import") throw new Error("Lavoro non trovato.");
    if (job.phase !== "uploading") return job;
    const expected = index === job.chunks - 1 ? job.total - index * CHUNK_SIZE : CHUNK_SIZE;
    if (!Number.isInteger(index) || index < 0 || index >= job.chunks || !Array.isArray(rows) || rows.length !== expected) throw new Error("Blocco manifest incompleto.");
    for (const row of rows) if (!row || typeof row.nomeProdotto !== "string" || !row.nomeProdotto.trim() || row.nomeProdotto.length > 4000 || !Number.isFinite(row.retail) || row.retail < 0) throw new Error("Riga manifest non valida.");
    const old = await read<Chunk>(CHUNK_TYPE, chunkHandle(handle, index));
    if (old && JSON.stringify(old) !== JSON.stringify({ rows })) throw new Error("Blocco già registrato con dati diversi: non sovrascritto.");
    if (!old) await put(CHUNK_TYPE, chunkHandle(handle, index), { rows });
    if (!job.uploaded.includes(index)) job.uploaded.push(index);
    if (job.uploaded.length === job.chunks) job.phase = job.reservation ? "running" : "allocating";
    await saveJob(job); return job;
  } finally { await unlock(); }
}
async function allocate(job: ImportJob) {
  // Scan stock incrementally; each HTTP invocation reads at most one page.
  const stock = await page("poporama_articolo", job.cursor, 250);
  for (const node of stock.nodes) job.maxPP = Math.max(job.maxPP, extractPPNumber(field(node, "codice_pp")) || 0, extractPPNumber(node.handle) || 0);
  if (stock.pageInfo.hasNextPage) {
    if (!stock.pageInfo.endCursor || stock.pageInfo.endCursor === job.cursor) throw new Error("Paginazione PP non valida");
    job.cursor = stock.pageInfo.endCursor;
  } else {
    const counter = await read<{ max: number }>(JOB_TYPE, "pp-counter");
    const release = await lockPPSequence();
    try {
      const maximum = Math.max(job.maxPP, counter?.max || 0);
      if (maximum > 0) rememberPPNumber(maximum);
      const range = reservePPRange([], job.total, job.lottoId);
      // Persist the maximum before the job so a crash can leave a gap, never reuse PP.
      await put(JOB_TYPE, "pp-counter", { max: range.to });
      job.reservation = range; job.phase = "running"; job.cursor = null;
    } finally { release(); }
  }
  await saveJob(job);
}
async function scanMissing(job: ImportJob) {
  const stock = await page("poporama_articolo", job.cursor, 100);
  const ids = stock.nodes.filter(node => (!job.lottoId || field(node, "lotto") === job.lottoId) && needsTranslation(node.fields)).map(n => n.id);
  if (ids.length) {
    // One source page = one deterministic chunk: safe if a checkpoint write is retried.
    await put(CHUNK_TYPE, chunkHandle(job.handle, job.chunks), { ids });
    job.total += ids.length; job.chunks++;
  }
  if (stock.pageInfo.hasNextPage) {
    if (!stock.pageInfo.endCursor || stock.pageInfo.endCursor === job.cursor) throw new Error("Paginazione articoli non valida");
    job.cursor = stock.pageInfo.endCursor;
  } else { job.cursor = null; job.phase = job.total ? "running" : "completed"; }
  await saveJob(job);
}
async function titlesFor(originals: string[], signal: AbortSignal) { return translateCached(originals, false, signal); }
async function importRows(job: ImportJob, deadline: number, signal: AbortSignal) {
  const index = Math.floor(job.position / CHUNK_SIZE), offset = job.position % CHUNK_SIZE;
  const chunk = await read<Chunk>(CHUNK_TYPE, chunkHandle(job.handle, index));
  if (!chunk || !("rows" in chunk) || !job.reservation) throw new Error("Checkpoint import incompleto: nessun prodotto viene scartato.");
  const rows = chunk.rows.slice(offset, offset + 10);
  const nodes = await manyHandles("poporama_articolo", rows.map((_, i) => formatPPCode(job.reservation!.from + job.position + i).toLowerCase()));
  const translated = await titlesFor(rows.map(r => r.nomeProdotto), signal);
  const titles = new Map<string, TitleState>();
  for (const row of rows) {
    const result = translated.get(titleKey(row.nomeProdotto))!;
    titles.set(row.nomeProdotto, { version: 1, original: row.nomeProdotto, italian: result.italian, status: result.italian ? "translated" : "failed", ...(result.error ? { error: result.error } : {}), updatedAt: new Date().toISOString() });
  }
  await withImportContext({ accessToken: await accessToken(signal), articles: nodes.filter((n): n is MetaNode => !!n), titles, signal }, async () => {
    for (const row of rows) {
      if (Date.now() >= deadline || signal.aborted) break;
      const codicePP = formatPPCode(job.reservation!.from + job.position);
      const response = await createArticle(new NextRequest("http://internal/api/poporama/articoli", { method: "POST", body: JSON.stringify({ ...row, lottoId: job.lottoId, codicePP, grado: "N", percentualePrezzo: job.percentage, ppReservation: job.reservation!.ppReservation }) }));
      const result = await response.json();
      if (!response.ok && !(response.status === 409 && result.matchesImportRow)) {
        if (response.status >= 500) throw new RetryLater(result.error || "Shopify non disponibile");
        throw new Error(`${codicePP}: ${result.error || "Creazione non confermata"}`);
      }
      let article = result.articolo as MetaNode;
      // Recovery of an already-created row never replaces a manual or successful translation.
      if (needsTranslation(article.fields)) {
        const fresh = await byId(article.id);
        if (fresh && needsTranslation(fresh.fields)) article = await updateNode(fresh.id, [{ key: "risultati_test", value: withTitle(fresh.fields, titles.get(row.nomeProdotto)!) }]);
      }
      job.position++; job.imported++;
      if (titleInfo(article.fields).nomeItaliano) job.translated++; else job.untranslated++;
      job.failures = 0; job.error = undefined;
      if (job.position === job.total) job.phase = "completed";
      await saveJob(job);
    }
  });
}
async function translateRows(job: ImportJob, deadline: number, signal: AbortSignal) {
  // Translation chunks may contain fewer than 100 entries. Cursor is a chunk-local offset.
  const index = job.uploaded[0] || 0, offset = job.uploaded[1] || 0;
  const chunk = await read<Chunk>(CHUNK_TYPE, chunkHandle(job.handle, index));
  if (!chunk || !("ids" in chunk)) throw new Error("Blocco traduzioni mancante");
  const ids = chunk.ids.slice(offset, offset + 10);
  const nodes = await Promise.all(ids.map(byId));
  const originals = nodes.filter((node): node is MetaNode => !!node && needsTranslation(node.fields)).map(node => titleInfo(node.fields).nomeOriginale);
  const translations = await translateCached(originals, true, signal, new Date(job.createdAt).getTime());
  for (let i = 0; i < ids.length && Date.now() < deadline && !signal.aborted; i++) {
    // Re-read after the service call to protect corrections made during processing.
    const current = await byId(ids[i]);
    if (current && needsTranslation(current.fields)) {
      const original = titleInfo(current.fields).nomeOriginale;
      const result = translations.get(titleKey(original));
      if (result) await updateNode(current.id, [{ key: "risultati_test", value: withTitle(current.fields, { version: 1, original, italian: result.italian, status: result.italian ? "translated" : "failed", error: result.error, updatedAt: new Date().toISOString() }) }]);
    }
    const final = current ? await byId(current.id) : null;
    if (final && titleInfo(final.fields).nomeItaliano) job.translated++; else job.untranslated++;
    job.position++;
    job.uploaded = offset + i + 1 >= chunk.ids.length ? [index + 1, 0] : [index, offset + i + 1];
    if (job.position >= job.total) job.phase = "completed";
    job.failures = 0; job.error = undefined;
    await saveJob(job);
  }
}
export async function advanceJob(handle?: string): Promise<ImportJob | null> {
  await ensureJobSchema();
  const unlock = await lease(); if (!unlock) return null;
  let job: ImportJob | null = null;
  try {
    if (handle) job = await read<ImportJob>(JOB_TYPE, handle);
    else {
      const cursor = await read<{ after: string | null }>(JOB_TYPE, "worker-cursor");
      const jobs = await listJobNodes(cursor?.after || null);
      job = jobs.nodes.map(n => decode<ImportJob>(n)).find(j => !["uploading", "completed", "failed"].includes(j.phase) && (!j.nextRunAt || j.nextRunAt <= Date.now())) || null;
      // Stay on this page until active work is done; advance if the page is idle.
      if (!job) await put(JOB_TYPE, "worker-cursor", { after: jobs.pageInfo.hasNextPage ? jobs.pageInfo.endCursor : null });
    }
    if (!job || ["uploading", "completed", "failed"].includes(job.phase) || (job.nextRunAt || 0) > Date.now()) return job;
    const signal = AbortSignal.timeout(25000), deadline = Date.now() + 15000;
    await withShopifyBudget(signal, async () => {
      if (job!.phase === "allocating") await allocate(job!);
      else if (job!.phase === "scanning") await scanMissing(job!);
      else if (job!.kind === "import") await importRows(job!, deadline, signal);
      else await translateRows(job!, deadline, signal);
    });
    return job;
  } catch (error) {
    if (!job) throw error;
    job.failures++;
    job.error = error instanceof Error ? error.message : "Elaborazione non disponibile";
    if (error instanceof RetryLater || (error instanceof Error && /abort|timeout|fetch|temporaneamente/i.test(error.message))) {
      job.nextRunAt = Date.now() + Math.min(60000, error instanceof RetryLater ? error.delayMs : 1000 * 2 ** Math.min(job.failures, 6));
    } else { job.resumePhase = job.phase; job.phase = "failed"; }
    await saveJob(job); return job;
  } finally { await unlock(); }
}

export async function retryJob(handle: string) {
  const unlock = await lease(); if (!unlock) throw new RetryLater("Coda occupata", 1000);
  try {
    const job = await read<ImportJob>(JOB_TYPE, handle);
    if (!job) throw new Error("Lavoro non trovato.");
    if (job.phase === "failed") {
      job.phase = job.resumePhase || (job.kind === "import" ? job.reservation ? "running" : "allocating" : "scanning");
      job.error = undefined; job.failures = 0; job.nextRunAt = 0;
      await saveJob(job);
    }
    return job;
  } finally { await unlock(); }
}
