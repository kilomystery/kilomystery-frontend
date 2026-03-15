"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lang, normalizeLang } from "@/i18n/lang";

type RewardOrder = {
  id: string;
  name: string;
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

  // cerca ordine tramite sid
  useEffect(() => {
    if (!sid) return;

    const loadOrder = async () => {
      try {
        const res = await fetch(`/api/order-by-sid?sid=${sid}`);
        const data = await res.json();

        if (data?.ok && data?.found) {
          setOrder(data.order);
        }
      } catch (e) {
        console.error("order lookup error", e);
      }
    };

    loadOrder();
  }, [sid]);

  // invia purchase a Meta
  useEffect(() => {
    if (!order) return;
    if (!window.fbq) return;

    const key = `km_purchase_sent_${order.id}`;

    if (sessionStorage.getItem(key)) return;

    window.fbq("track", "Purchase", {
      value: order.value,
      currency: order.currency,
      content_type: "product",
      content_ids: order.items.map((i) => i.variantId || i.title),
    });

    sessionStorage.setItem(key, "1");

    console.log("Purchase sent", order);
  }, [order]);

  return (
    <div className="container py-20 text-center">
      <h1 className="text-3xl font-bold mb-4">
        🎉 Ordine confermato!
      </h1>

      <p className="text-white/70 mb-8">
        Grazie per il tuo acquisto su KiloMystery.
      </p>

      <a
        href={`/${lang}`}
        className="px-6 py-3 rounded-xl bg-white text-black font-bold"
      >
        Torna allo shop
      </a>
    </div>
  );
}