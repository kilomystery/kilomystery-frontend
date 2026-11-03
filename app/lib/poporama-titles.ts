import { testDocument } from "./poporama-pricing";

export type TitleState = { version: 1; original: string; italian: string; status: "translated" | "manual" | "failed"; error?: string; updatedAt: string };
export type TitleField = { key: string; value: string | null };
export function titleInfo(fields: TitleField[]) {
  const field = (key: string) => fields.find(f => f.key === key)?.value || "";
  const state = testDocument(field("risultati_test"))._poporamaTitle as TitleState | undefined;
  const original = state?.version === 1 ? state.original : field("nome_prodotto");
  const italian = state?.version === 1 ? state.italian : "";
  return { nomeOriginale: original, nomeItaliano: italian, nomeProdotto: italian || original,
    statoTraduzione: state?.status ?? "missing", erroreTraduzione: state?.error || "" };
}
export function needsTranslation(fields: TitleField[]) {
  const title = titleInfo(fields);
  return title.statoTraduzione !== "manual" && title.statoTraduzione !== "translated" && !!title.nomeOriginale;
}
export function withTitle(fields: TitleField[], state: TitleState) {
  const raw = fields.find(f => f.key === "risultati_test")?.value;
  return JSON.stringify({ ...testDocument(raw), _poporamaTitle: state });
}
