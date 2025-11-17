import type { Metadata } from "next";
import "../globals.css";

import Header from "../components/Header";
import Footer from "../components/Footer";
import CookieBanner from "../components/CookieBanner";
import NewsletterModal from "../components/NewsletterModal";

export const metadata: Metadata = {
  title: "KiloMistery",
  description: "Mystery box al kg – scegli Standard o Premium, aggiungi al carrello.",
};

function TopMarquee() {
  // unico marquee, posizionato SOPRA l’header
  return (
    <div className="top-marquee" aria-label="annunci in evidenza">
      <div className="track">
        <span>SPEDIZIONE GRATUITA &gt; 200€</span>
        <span>•</span>
        <span>PAGAMENTI SICURI</span>
        <span>•</span>
        <span>KILOMISTERY.COM</span>
        <span>•</span>
        <span>MYSTERY BOX</span>
        <span>•</span>
        <span>TRACCIABILITÀ ORDINE</span>
        <span>•</span>
        <span>ASSISTENZA RAPIDA</span>
        {/* duplico per riempire la corsa */}
        <span>SPEDIZIONE GRATUITA &gt; 200€</span>
        <span>•</span>
        <span>PAGAMENTI SICURI</span>
        <span>•</span>
        <span>KILOMISTERY.COM</span>
        <span>•</span>
        <span>MYSTERY BOX</span>
        <span>•</span>
        <span>TRACCIABILITÀ ORDINE</span>
        <span>•</span>
        <span>ASSISTENZA RAPIDA</span>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return (
    <html lang={lang}>
      <body>
        <TopMarquee />
        <Header lang={lang} />
        {children}
        <Footer lang={lang} />
        <CookieBanner />
        <NewsletterModal />
      </body>
    </html>
  );
}