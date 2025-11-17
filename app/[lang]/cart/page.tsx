'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';

export default function CartPage({ params }: { params: { lang: string } }) {
  const lang = (params?.lang || 'it') as string;
  const { cart, updateQty, removeItem } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  function goToCheckout() {
    if (cart.length === 0) return;
    const base = 'https://shop.kilomystery.com/cart/';

    // costruiamo la stringa tipo "variant:qty,variant2:qty2"
    const query = cart
      .map(i => `${i.shopifyId}:${i.qty}`)
      .join(',');

    window.location.href = base + query;
  }

  return (
    <>
      <Header lang={lang as any} />

      <main className="container py-10 space-y-8">
        <h1 className="text-3xl font-extrabold mb-4">Carrello</h1>

        {cart.length === 0 ? (
          <p className="text-white/70">
            Il tuo carrello è vuoto. Aggiungi una mystery box dalla home o dalla pagina prodotti.
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map(item => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-black/40 border border-white/10">
                    {/* se hai delle immagini statiche, puoi usare <img /> */}
                    <video
                      src={item.image}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  </div>

                  <div className="flex-1 w-full">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold">{item.title}</h2>
                        <p className="text-white/70 text-sm">
                          {item.kind} · {item.kg} kg
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">
                          {(item.price * item.qty).toFixed(2)} €
                        </div>
                        <div className="text-xs text-white/60">
                          {item.price.toFixed(2)} € / box
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="inline-flex items-center rounded-full bg-white/10 border border-white/20 overflow-hidden">
                        <button
                          className="px-3 py-1 text-lg"
                          onClick={() => updateQty(item.id, item.qty - 1)}
                        >
                          −
                        </button>
                        <span className="px-3 text-sm font-semibold">
                          {item.qty}
                        </span>
                        <button
                          className="px-3 py-1 text-lg"
                          onClick={() => updateQty(item.id, item.qty + 1)}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="text-xs text-rose-400 hover:text-rose-300"
                        onClick={() => removeItem(item.id)}
                      >
                        Rimuovi
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Riepilogo */}
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/10 pt-4">
              <div className="text-white/70 text-sm max-w-md">
                I prodotti nel carrello sono pronti per il checkout su Shopify. Potrai ancora
                controllare indirizzo e spedizione nella pagina di pagamento.
              </div>
              <div className="text-right">
                <div className="text-sm text-white/60">Totale provvisorio</div>
                <div className="text-2xl font-extrabold mb-3">
                  {total.toFixed(2)} €
                </div>
                <button
                  onClick={goToCheckout}
                  className="btn btn-brand px-6 py-3 text-base font-bold"
                >
                  Vai al checkout
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer lang={lang as any} />
    </>
  );
}
