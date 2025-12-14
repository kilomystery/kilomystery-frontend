// app/[lang]/reward/page.tsx
"use client";

import SpinWheel from "@/app/components/SpinWheel";
import { Lang, normalizeLang } from "@/i18n/lang";

export default function RewardPage({
  params,
}: {
  params: { lang: string };
}) {
  const lang: Lang = normalizeLang(params?.lang);

  return <SpinWheel lang={lang} showBackToShopButton />;
}
