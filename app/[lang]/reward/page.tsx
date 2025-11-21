"use client";

import SpinWheel from "@/app/components/SpinWheel";

export default function RewardPage({
  params,
}: {
  params: { lang: string };
}) {
  const lang = params.lang || "it";

  return <SpinWheel lang={lang} showBackToShopButton />;
}
