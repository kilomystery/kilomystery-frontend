/* eslint-disable react/no-unescaped-entities */
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { normalizeLang, type Lang } from "@/i18n/lang";

type Params = { lang: string; id: string };

function parseLotId(id: string) {
  // Esempio: KM-20260128-PRM-5KG-0001
  const parts = id.split("-");
  if (parts.length < 5 || parts[0] !== "KM") return null;

  const yyyymmdd = parts[1];
  const type = parts[2]; // PRM / STD
  const kg = parts[3]; // 5KG
  const serial = parts[4];

  const date =
    yyyymmdd.length === 8
      ? `${yyyymmdd.slice(6, 8)}/${yyyymmdd.slice(4, 6)}/${yyyymmdd.slice(0, 4)}`
      : yyyymmdd;

  const typeLabel =
    type === "PRM" ? "Premium" : type === "STD" ? "Standard" : type;

  return {
    id,
    date,
    typeLabel,
    kg: kg.replace("KG", ""),
    serial,
    warehouse: "Brindisi (BR)",
  };
}

const COPY: Record<
  Lang,
  {
    kicker: string;
    title: string;
    subtitle: string;
    okTitle: string;
    badTitle: string;
    badText: string;
    lotId: string;
    warehouse: string;
    product: string;
    weight: string;
    date: string;
    serial: string;
    support: string;
    ctaContact: string;
    ctaUgc: string;
    ctaProducts: string;
    verified: string;
  }
> = {
  it: {
    kicker: "Verifica",
    title: "Verifica lotto",
    subtitle: "Scansiona il QR sull’etichetta per controllare i dettagli della box.",
    okTitle: "Lotto verificato",
    verified: "✅",
    badTitle: "Codice non valido",
    badText: "Questo ID non sembra corretto. Controlla che sia completo e riprova.",
    lotId: "ID lotto",
    warehouse: "Magazzino",
    product: "Prodotto",
    weight: "Peso",
    date: "Data preparazione",
    serial: "Progressivo",
    support: "Assistenza",
    ctaContact: "Contattaci",
    ctaUgc: "Guarda gli unboxing",
    ctaProducts: "Vai ai prodotti",
  },
  en: {
    kicker: "Verify",
    title: "Lot verification",
    subtitle: "Scan the QR on the label to check your box details.",
    okTitle: "Lot verified",
    verified: "✅",
    badTitle: "Invalid code",
    badText: "This ID doesn’t look valid. Please check it and try again.",
    lotId: "Lot ID",
    warehouse: "Warehouse",
    product: "Product",
    weight: "Weight",
    date: "Packing date",
    serial: "Serial",
    support: "Support",
    ctaContact: "Contact us",
    ctaUgc: "Watch unboxings",
    ctaProducts: "Go to products",
  },
  es: {
    kicker: "Verificar",
    title: "Verificación de lote",
    subtitle: "Escanea el QR de la etiqueta para ver los detalles de la caja.",
    okTitle: "Lote verificado",
    verified: "✅",
    badTitle: "Código no válido",
    badText: "Este ID no parece válido. Revísalo y vuelve a intentarlo.",
    lotId: "ID de lote",
    warehouse: "Almacén",
    product: "Producto",
    weight: "Peso",
    date: "Fecha de preparación",
    serial: "N.º",
    support: "Soporte",
    ctaContact: "Contáctanos",
    ctaUgc: "Ver unboxings",
    ctaProducts: "Ver productos",
  },
  fr: {
    kicker: "Vérifier",
    title: "Vérification du lot",
    subtitle: "Scanne le QR sur l’étiquette pour voir les détails de ta box.",
    okTitle: "Lot vérifié",
    verified: "✅",
    badTitle: "Code invalide",
    badText: "Cet ID ne semble pas valide. Vérifie-le et réessaie.",
    lotId: "ID du lot",
    warehouse: "Entrepôt",
    product: "Produit",
    weight: "Poids",
    date: "Date de préparation",
    serial: "N°",
    support: "Support",
    ctaContact: "Nous contacter",
    ctaUgc: "Voir les unboxings",
    ctaProducts: "Voir les produits",
  },
  de: {
    kicker: "Prüfen",
    title: "Chargenprüfung",
    subtitle: "Scanne den QR-Code auf dem Etikett, um die Box-Details zu sehen.",
    okTitle: "Charge verifiziert",
    verified: "✅",
    badTitle: "Ungültiger Code",
    badText: "Diese ID wirkt ungültig. Bitte prüfe sie und versuche es erneut.",
    lotId: "Chargen-ID",
    warehouse: "Lager",
    product: "Produkt",
    weight: "Gewicht",
    date: "Packdatum",
    serial: "Nr.",
    support: "Support",
    ctaContact: "Kontakt",
    ctaUgc: "Unboxings ansehen",
    ctaProducts: "Zu den Produkten",
  },
};

export default async function VerifyLotPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang: rawLang, id } = await params;
  const lang: Lang = normalizeLang(rawLang);
  const t = COPY[lang] ?? COPY.it;

  const lot = parseLotId(id);

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-8">
        {/* HERO */}
        <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
          <div className="section-kicker text-center">{t.kicker}</div>
          <h1 className="section-title text-center text-3xl md:text-4xl font-extrabold">
            <span className="brand-text">{t.title}</span>
          </h1>
          <p className="text-center text-white/60 text-xs mt-2">{t.subtitle}</p>
        </section>

        {/* CONTENT */}
        <section className="card space-y-4">
          {!lot ? (
            <>
              <h2 className="text-xl font-extrabold">{t.badTitle}</h2>
              <p className="text-white/70 text-sm">{t.badText}</p>
              <a
                href={`/${lang}/contact`}
                className="btn btn-brand btn-sm inline-flex"
              >
                {t.ctaContact}
              </a>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xl font-extrabold">
                  {t.okTitle} {t.verified}
                </h2>
                <span className="pill">
                  <span>📍</span>
                  <span>
                    {t.warehouse} {lot.warehouse}
                  </span>
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-white/50">{t.lotId}</div>
                  <div className="font-semibold break-all">{lot.id}</div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-white/50">{t.product}</div>
                  <div className="font-semibold">{lot.typeLabel} Box</div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-white/50">{t.weight}</div>
                  <div className="font-semibold">{lot.kg} kg (±3%)</div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-white/50">{t.date}</div>
                  <div className="font-semibold">{lot.date}</div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-white/50">{t.serial}</div>
                  <div className="font-semibold">{lot.serial}</div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-white/50">{t.support}</div>
                  <a href={`/${lang}/contact`} className="btn-link">
                    {t.ctaContact}
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <a href={`/${lang}/ugc`} className="btn btn-ghost btn-sm">
                  {t.ctaUgc}
                </a>
                <a href={`/${lang}/products`} className="btn btn-brand btn-sm">
                  {t.ctaProducts}
                </a>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
