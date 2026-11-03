import * as XLSX from "xlsx";
import { parseCsv } from "./poporama-manifest-csv";
import { parseManifestMoney } from "./poporama-pricing";
export type ManifestArticle = { nomeProdotto: string; asin: string; ean: string; upc: string; fnsku: string; lpn: string; palletId: string; condizioneOriginale: string; categoria: string; sottocategoria: string; retail: number; costoManifest: number | null; numeroSeriale?: string };
function value(row: Record<string, string>, names: string[]) {
  for (const name of names) {
    const key = Object.keys(row).find(key => key.trim().toLowerCase() === name.toLowerCase());
    if (key && row[key]?.trim()) return row[key].trim();
  }
  return "";
}
export function manifestArticle(row: Record<string, string>, number: number): ManifestArticle {
  const name = value(row, ["Item Desc", "Item Description", "Description", "Product Name", "Title", "Product Title", "Nome prodotto"]);
  if (!name || name.length > 4000) throw new Error(`Riga ${number}: titolo mancante o superiore a 4000 caratteri. Nessuna riga viene scartata silenziosamente.`);
  const retailText = value(row, ["Unit Retail", "Retail", "Retail Amazon", "MSRP"]);
  const retail = retailText ? parseManifestMoney(retailText) : 0;
  if (retail === null) throw new Error(`Riga ${number}: Retail non valido.`);
  return { nomeProdotto: name, retail, costoManifest: parseManifestMoney(value(row, ["COGS", "COST", "Unit Cost", "Unit COGS"])),
    asin: value(row, ["ASIN"]), ean: value(row, ["EAN"]), upc: value(row, ["UPC"]), fnsku: value(row, ["FNSKU"]), lpn: value(row, ["LPN"]),
    palletId: value(row, ["Pallet ID", "Pallet"]), condizioneOriginale: value(row, ["Condition"]), categoria: value(row, ["Category"]), sottocategoria: value(row, ["Subcategory"]), numeroSeriale: value(row, ["Serial", "Serial Number", "Numero seriale"]) };
}
export function parseManifest(bytes: Uint8Array, fileName: string): ManifestArticle[] {
  let rows: Record<string, string>[] = [];
  if (/\.csv$/i.test(fileName)) rows = parseCsv(new TextDecoder().decode(bytes)).rows;
  else if (/\.xlsx?$/i.test(fileName)) {
    const book = XLSX.read(bytes, { type: "array", cellFormula: false, cellHTML: false, cellStyles: false });
    for (const name of book.SheetNames) {
      const matrix = XLSX.utils.sheet_to_json<string[]>(book.Sheets[name], { header: 1, raw: false, defval: "" });
      const headerIndex = matrix.findIndex(row => row.some(cell => /^(item desc(?:ription)?|description|product name|product title|title|nome prodotto)$/i.test(String(cell).trim())));
      if (headerIndex < 0) continue;
      const headers = matrix[headerIndex].map(String);
      rows.push(...matrix.slice(headerIndex + 1).filter(row => row.some(cell => String(cell).trim())).map(row => Object.fromEntries(headers.map((key, i) => [key, String(row[i] ?? "")]))));
    }
  } else throw new Error("Carica un file CSV, XLS o XLSX.");
  if (!rows.length) throw new Error("Il manifest non contiene righe prodotto leggibili.");
  if (rows.length > 100000) throw new Error("Massimo 100.000 righe per manifest: dividi il file senza eliminare righe.");
  return rows.map((row, i) => manifestArticle(row, i + 2));
}
