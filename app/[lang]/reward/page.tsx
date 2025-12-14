// app/[lang]/reward/page.tsx
"use client";

import SpinWheel from "@/app/components/SpinWheel";
import { Lang, normalizeLang } from "@/i18n/lang";

export default async function RewardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolved = await params;
  const lang: Lang = normalizeLang(resolved?.lang);

  return <SpinWheel lang={lang} showBackToShopButton />;
}
