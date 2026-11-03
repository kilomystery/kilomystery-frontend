export { workerAuthorized } from "./poporama-worker-auth";
import { NextResponse } from "next/server";
import { RetryLater } from "./poporama-shopify";
export function jobError(error: unknown) {
  if (error instanceof Error && /abort|timeout|fetch failed/i.test(error.message)) error = new RetryLater("Connessione temporaneamente non disponibile. Il lavoro riprenderà automaticamente.");
  return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Operazione non disponibile", retryMs: error instanceof RetryLater ? error.delayMs : undefined }, { status: error instanceof RetryLater ? 503 : 400 });
}
export const validJobHandle = (handle: string) => /^job-[a-f0-9]{64}$/.test(handle);
