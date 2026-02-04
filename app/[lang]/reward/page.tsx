"use client";

import { useEffect } from "react";
import SpinWheel from "@/app/components/SpinWheel";
import { Lang, normalizeLang } from "@/i18n/lang";

const WHEEL_LOCK_KEY = "km_wheel_can_play";

export default function RewardPage({ params }: { params: { lang: string } }) {
  const lang: Lang = normalizeLang(params?.lang);

  useEffect(() => {
    try {
      window.localStorage.removeItem(WHEEL_LOCK_KEY);
    } catch {}
  }, []);

  return <SpinWheel lang={lang} showBackToShopButton />;
}
