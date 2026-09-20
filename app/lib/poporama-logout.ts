"use client";

export async function logoutPoporama(lang: string) {
  const response = await fetch("/api/poporama/session", { method: "DELETE" });
  if (!response.ok) throw new Error("Uscita non riuscita. Riprova.");
  window.location.replace(`/${lang}/poporama-accesso`);
}
