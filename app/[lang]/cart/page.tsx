"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useCart } from "@/app/components/cart/CartProvider";

export default function CartPage({ params }: { params: { lang: string } }) {
  const lang = (params?.lang || "it") as string;
  const { items, setQty, removeItem, subtotal } = useCart();

  function goToCheckout() {
    if (items.length === 0) return;

    const base = "https://shop.kilomystery.com/cart/";
    const query = items
      .map(i => `${i.shopifyId}:${i.qty}`)
      .join(",");

    window.location.href = base + query;
  }

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-8">
        <h1 className="text-3xl font-extrabold mb-4">Carrello</h1>

        {items.length === 0 ? (
          <p className="text-white/70">Il tuo carrello è vuoto.</p>
        ) : (
          <>
            <div className="space-y-4">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl"
                >
                  <div className="w-24 h-24 bg-black/40 rounded-xl overflow-hidden border border-white/10">
                    <video
                      src={item.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h2 className="text-lg font-bold">{item.title}</h2>
                        <p className="text-white/70 text-sm">
                          {item.tier} · {item.weightKg} kg
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold">
                          {(item.pricePerKg * item.weightKg * item.qty).toFixed(2)} €
                        </div>
                        <div className="text-xs text-white/60">
                          {(item.pricePerKg * item.weightKg).toFixed(2)} € / box
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="inline-flex rounded-full border border-white/20 bg-white/10 overflow-hidden">
                        <button
                          className="px-3 py-1"
                          onClick={() => setQty(item.id, item.qty - 1)}
                        >
                          −
                        </button>
                        <span className="px-3 font-semibold">{item.qty}</span>
                        <button
                          className="px-3 py-1"
                          onClick={() => setQty(item.id, item.qty + 1)}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="text-xs text-rose-400"
                        onClick={() => removeItem(item.id)}
                      >
                        Rimuovi
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totale */}
            <div className="border-t border-white/10 pt-4 flex justify-between">
              <div className="text-white/60">Totale</div>
              <div className="text-2xl font-extrabold">{subtotal.toFixed(2)} €</div>
            </div>

            <button className="btn btn-brand px-6 py-3" onClick={goToCheckout}>
              Vai al checkout
            </button>
          </>
        )}
      </main>

      <Footer lang={lang} />
    </>
  );
}
