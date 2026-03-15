"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import SpinWheel from "@/app/components/SpinWheel";
import { Lang, normalizeLang } from "@/i18n/lang";

const WHEEL_LOCK_KEY = "km_wheel_can_play";

type RewardOrder = {
  id: string;
  name: string;
  note?: string;
  createdAt?: string;
  value: number;
  currency: string;
  items: Array<{
    title: string;
    quantity: number;
    variantId?: string | null;
  }>;
};

export default function RewardPage({ params }: { params: { lang: string } }) {
  const lang: Lang = normalizeLang(params?.lang);
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<RewardOrder | null>(null);

  const sid = useMemo(() => {
    return searchParams?.get("sid") || "";
  }, [searchParams]);

  useEffect(() => {
    try {
      window.localStorage.removeItem(WHEEL_LOCK_KEY);
    } catch {}
  }, []);

  useEffect(() => {
    if (!sid) return;

    let cancelled = false;

    const run = async () => {
      try {
        const res = await fetch(`/api/order-by-sid?sid=${encodeURIComponent(sid)}`, {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();
        if (cancelled) return;

        if (data?.ok && data?.found && data?.order) {
          setOrder(data.order);
        }
      } catch (e) {
        console.error("[KM_REWARD] order lookup failed", e);
      }
    };

    run();
    const timer = window.setInterval(run, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [sid]);

  useEffect(() => {
    if (!order?.id) return;
    if (typeof window === "undefined") return;
    if (!window.fbq) return;

    const purchaseKey = `km_purchase_sent_${order.id}`;
    if (window.sessionStorage.getItem(purchaseKey)) return;

    const payload = {
      value: Number(order.value || 0),
      currency: order.currency || "EUR",
      content_type: "product",
      content_ids: order.items.map((item) => item.variantId || item.title),
      contents: order.items.map((item) => ({
        content_name: item.title,
        content_id: item.variantId || item.title,
        quantity: Number(item.quantity || 1),
      })),
      order_id: order.name,
    };

    try {
      window.fbq("track", "Purchase", payload);
      window.sessionStorage.setItem(purchaseKey, "1");
      console.log("[KM_REWARD] Purchase sent", payload);
    } catch (e) {
      console.error("[KM_REWARD] Purchase track failed", e);
    }
  }, [order]);

  return <SpinWheel lang={lang} showBackToShopButton />;
}