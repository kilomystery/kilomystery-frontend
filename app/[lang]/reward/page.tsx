"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lang, normalizeLang } from "@/i18n/lang";

const WHEEL_LOCK_KEY = "km_wheel_can_play";

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.removeItem(WHEEL_LOCK_KEY);
    } catch (e) {
      console.error("wheel lock reset error", e);
    }
  }, []);

  useEffect(() => {
    if (!sid) return;

    const loadOrder = async () => {
      try {
        const res = await fetch(`/api/order-by-sid?sid=${encodeURIComponent(sid)}`);
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

  return (
    <div className="container py-20 text-center">
      <h1 className="text-3xl font-bold mb-4">🎉 Ordine confermato!</h1>

      <p className="text-white/70 mb-4">
        Grazie per il tuo acquisto su KiloMystery.
      </p>

      {order ? (
        <div className="mx-auto mb-8 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                Ordine
              </p>
              <p className="text-lg font-bold">{order.name}</p>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                Totale
              </p>
              <p className="text-lg font-bold">
                {Number(order.value || 0).toFixed(2)} {order.currency}
              </p>
            </div>
          </div>

          {!!order.items?.length && (
            <div className="mt-4 space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={`${item.title}-${idx}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2"
                >
                  <span className="text-sm text-white/90">{item.title}</span>
                  <span className="text-sm text-white/60">x{item.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-white/50 mb-8 text-sm">
          Stiamo verificando i dettagli del tuo ordine...
        </p>
      )}

      <a
        href={`/${lang}`}
        className="inline-block px-6 py-3 rounded-xl bg-white text-black font-bold"
      >
        Torna allo shop
      </a>
    </div>
  );
}