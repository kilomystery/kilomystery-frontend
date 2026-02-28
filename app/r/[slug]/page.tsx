// app/r/[slug]/page.tsx
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { detectLangFromHeader, normalizeLang, type Lang } from "@/i18n/lang";
import { UTM_LINKS } from "../../../utm-links";

async function getLang(): Promise<Lang> {
  const c = (await cookies()).get("km_lang")?.value;
  if (c) return normalizeLang(c);

  const al = (await headers()).get("accept-language");
  return detectLangFromHeader(al);
}

export default async function RedirectSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = (params.slug || "").toLowerCase();
  const cfg = UTM_LINKS[slug];

  const lang = await getLang(); // it/en/es/fr/de in base a cookie/header

  // Se slug non esiste, fallback su /{lang}
  if (!cfg) {
    redirect(`/${lang}`);
  }

  const qs = new URLSearchParams({
    utm_source: cfg.source,
    utm_medium: cfg.medium,
    utm_campaign: cfg.campaign,
  }).toString();

  // destinazione: /{lang} oppure path custom
  const destPath = cfg.path ? cfg.path.replace("{lang}", lang) : `/${lang}`;

  redirect(`${destPath}?${qs}`);
}