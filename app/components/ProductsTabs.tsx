"use client";

import MysteryShowroom from "./home/MysteryShowroom";
import { normalizeLang } from "@/i18n/lang";

// Existing editorial routes keep their embedded shopping entry point and now
// share the same live catalog, availability checks and premium presentation.
export default function ProductsTabs({ lang = "it" }: { lang?: string }) {
  return <MysteryShowroom lang={normalizeLang(lang)} />;
}
