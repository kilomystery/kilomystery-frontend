/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { getPageMetadata } from "@/src/seo/meta";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Lang, normalizeLang } from "@/i18n/lang";

type CopyKey =
  | "kicker"
  | "title"
  | "subtitle"
  | "howTitle"
  | "howStep1Title"
  | "howStep1Text"
  | "howStep2Title"
  | "howStep2Text"
  | "howStep3Title"
  | "howStep3Text"
  | "prizeTitle"
  | "prizeAllTitle"
  | "prizeAllText"
  | "prizeMonthlyTitle"
  | "prizeMonthlyText"
  | "rulesTitle"
  | "rulesBullet1"
  | "rulesBullet2"
  | "rulesBullet3"
  | "rulesBullet4"
  | "faqTitle"
  | "faqQ1"
  | "faqA1"
  | "faqQ2"
  | "faqA2"
  | "faqQ3"
  | "faqA3"
  | "ctaPrimary"
  | "ctaSecondary";

type CopyPerLang = Record<CopyKey, string>;

const UGC_COPY: Record<Lang, CopyPerLang> = {
  it: {
    kicker: "Unboxing contest",
    title: "KiloMystery Unboxing Contest",
    subtitle:
      "Registra il tuo unboxing, condividilo sui social e partecipa al contest ufficiale KiloMystery. 10% di sconto a tutti i partecipanti e 2 Kg gratis al miglior unboxing del mese.",

    howTitle: "Come partecipare",
    howStep1Title: "1. Registra il tuo unboxing",
    howStep1Text:
      "Appena ricevi la box, prepara il telefono, scegli una buona luce e registra il momento in cui apri il tuo KiloMystery (video o foto, come preferisci).",
    howStep2Title: "2. Condividi su TikTok o Instagram",
    howStep2Text:
      "Pubblica il contenuto sul tuo profilo TikTok o Instagram, rendi il post pubblico e mostra bene cosa c'era dentro la box.",
    howStep3Title: "3. Tagga @kilomystery e usa l’hashtag",
    howStep3Text:
      "Per entrare ufficialmente nel contest tagga @kilomystery nel post o nella storia e usa l’hashtag #KiloMysteryUnboxing.",

    prizeTitle: "Cosa puoi vincere",
    prizeAllTitle: "🎟 Per tutti i partecipanti",
    prizeAllText:
      "Dopo aver partecipato al contest, ti invieremo un codice sconto del 10% da usare sul tuo prossimo ordine KiloMystery.",
    prizeMonthlyTitle: "🏆 Miglior unboxing del mese",
    prizeMonthlyText:
      "Ogni mese selezioniamo il miglior unboxing tra tutti i contenuti pubblicati e il vincitore riceve 2 Kg di KiloMystery GRATIS, più una menzione speciale sui nostri canali.",

    rulesTitle: "Regole rapide del contest",
    rulesBullet1: "Il contenuto deve mostrare chiaramente l’unboxing di una box KiloMystery.",
    rulesBullet2: "Il post deve essere pubblico e deve taggare @kilomystery.",
    rulesBullet3: "Deve includere l’hashtag #KiloMysteryUnboxing.",
    rulesBullet4: "Ogni box dà diritto a una partecipazione per mese (puoi partecipare anche con più box).",

    faqTitle: "Domande frequenti",
    faqQ1: "Devo mostrare il viso nel video?",
    faqA1:
      "No, non è obbligatorio. Puoi inquadrare solo le mani e la box, oppure il contenuto sul tavolo. L’importante è che l’unboxing sia chiaro.",
    faqQ2: "Come ricevo il codice sconto del 10%?",
    faqA2:
      "Dopo aver pubblicato il contenuto e taggato @kilomystery con l’hashtag #KiloMysteryUnboxing, verifichiamo la partecipazione e ti inviamo il codice via email.",
    faqQ3: "Quando viene scelto il vincitore del mese?",
    faqA3:
      "Ogni fine mese selezioniamo il contenuto che ci è piaciuto di più per creatività, qualità o reazioni dei follower e contattiamo il vincitore via email o DM.",

    ctaPrimary: "Ordina la tua prossima box",
    ctaSecondary: "Seguici su TikTok e Instagram",
  },

  en: {
    kicker: "Unboxing contest",
    title: "KiloMystery Unboxing Contest",
    subtitle:
      "Record your unboxing, share it on social media and join the official KiloMystery contest. 10% off for all participants and 2 Kg free for the best unboxing each month.",

    howTitle: "How to join",
    howStep1Title: "1. Record your unboxing",
    howStep1Text:
      "As soon as you receive your box, grab your phone, find good lighting and record the moment you open your KiloMystery (video or photos).",
    howStep2Title: "2. Share on TikTok or Instagram",
    howStep2Text:
      "Post the content on your TikTok or Instagram profile, make sure it’s public and show clearly what was inside the box.",
    howStep3Title: "3. Tag @kilomystery and use the hashtag",
    howStep3Text:
      "To officially enter the contest, tag @kilomystery in the post or story and use the hashtag #KiloMysteryUnboxing.",

    prizeTitle: "What you can win",
    prizeAllTitle: "🎟 For all participants",
    prizeAllText:
      "After you take part in the contest, we’ll send you a 10% discount code to use on your next KiloMystery order.",
    prizeMonthlyTitle: "🏆 Best unboxing of the month",
    prizeMonthlyText:
      "Each month we select the best unboxing from all published content and the winner gets 2 Kg of KiloMystery for FREE plus a special shout-out on our channels.",

    rulesTitle: "Quick contest rules",
    rulesBullet1: "Your content must clearly show the unboxing of a KiloMystery box.",
    rulesBullet2: "The post must be public and tag @kilomystery.",
    rulesBullet3: "It must include the hashtag #KiloMysteryUnboxing.",
    rulesBullet4: "Each box gives you one entry per month (you can enter with multiple boxes).",

    faqTitle: "FAQ",
    faqQ1: "Do I have to show my face in the video?",
    faqA1:
      "No, it’s not required. You can film only your hands and the box, or just the items on the table. The important part is the unboxing itself.",
    faqQ2: "How do I receive the 10% discount code?",
    faqA2:
      "After you publish the content and tag @kilomystery with the hashtag #KiloMysteryUnboxing, we verify your participation and send the code via email.",
    faqQ3: "When is the monthly winner selected?",
    faqA3:
      "At the end of each month we pick the content we liked the most for creativity, quality or audience reactions and contact the winner via email or DM.",

    ctaPrimary: "Order your next box",
    ctaSecondary: "Follow us on TikTok & Instagram",
  },

  es: {
    kicker: "Unboxing contest",
    title: "Concurso de Unboxing KiloMystery",
    subtitle:
      "Graba tu unboxing, compártelo en redes y participa en el concurso oficial KiloMystery. 10% de descuento para todos los participantes y 2 Kg gratis para el mejor unboxing del mes.",

    howTitle: "Cómo participar",
    howStep1Title: "1. Graba tu unboxing",
    howStep1Text:
      "En cuanto recibas la caja, prepara el móvil, busca buena luz y graba el momento en el que abres tu KiloMystery (vídeo o fotos).",
    howStep2Title: "2. Comparte en TikTok o Instagram",
    howStep2Text:
      "Publica el contenido en tu perfil de TikTok o Instagram, asegúrate de que sea público y enseña claramente qué había dentro de la caja.",
    howStep3Title: "3. Etiqueta a @kilomystery y usa el hashtag",
    howStep3Text:
      "Para entrar oficialmente en el concurso, etiqueta a @kilomystery en la publicación o en la historia y usa el hashtag #KiloMysteryUnboxing.",

    prizeTitle: "Qué puedes ganar",
    prizeAllTitle: "🎟 Para todos los participantes",
    prizeAllText:
      "Tras participar en el concurso, te enviaremos un código de descuento del 10% para tu próximo pedido KiloMystery.",
    prizeMonthlyTitle: "🏆 Mejor unboxing del mes",
    prizeMonthlyText:
      "Cada mes elegimos el mejor unboxing entre todos los contenidos publicados y el ganador recibe 2 Kg de KiloMystery GRATIS, además de una mención especial en nuestros canales.",

    rulesTitle: "Reglas rápidas del concurso",
    rulesBullet1: "El contenido debe mostrar claramente el unboxing de una caja KiloMystery.",
    rulesBullet2: "La publicación debe ser pública y debe etiquetar a @kilomystery.",
    rulesBullet3: "Debe incluir el hashtag #KiloMysteryUnboxing.",
    rulesBullet4: "Cada caja da derecho a una participación por mes (puedes participar con varias cajas).",

    faqTitle: "Preguntas frecuentes",
    faqQ1: "¿Tengo que mostrar mi cara en el vídeo?",
    faqA1:
      "No es obligatorio. Puedes grabar solo las manos y la caja, o simplemente los productos sobre la mesa. Lo importante es el unboxing.",
    faqQ2: "¿Cómo recibo el código de descuento del 10%?",
    faqA2:
      "Después de publicar el contenido y etiquetar a @kilomystery con el hashtag #KiloMysteryUnboxing, verificamos tu participación y te enviamos el código por email.",
    faqQ3: "¿Cuándo se elige al ganador del mes?",
    faqA3:
      "Al final de cada mes elegimos el contenido que más nos ha gustado por creatividad, calidad o reacciones, y contactamos al ganador por email o DM.",

    ctaPrimary: "Pide tu próxima caja",
    ctaSecondary: "Síguenos en TikTok e Instagram",
  },

  fr: {
    kicker: "Unboxing contest",
    title: "Concours d’Unboxing KiloMystery",
    subtitle:
      "Filme ton unboxing, partage-le sur les réseaux et participe au concours officiel KiloMystery. -10 % pour tous les participants et 2 Kg offerts pour le meilleur unboxing du mois.",

    howTitle: "Comment participer",
    howStep1Title: "1. Filme ton unboxing",
    howStep1Text:
      "Dès que tu reçois ta box, prends ton téléphone, trouve une bonne lumière et filme le moment où tu ouvres ton KiloMystery (vidéo ou photos).",
    howStep2Title: "2. Partage sur TikTok ou Instagram",
    howStep2Text:
      "Publie le contenu sur ton profil TikTok ou Instagram, en public, et montre clairement ce qu’il y avait dans la box.",
    howStep3Title: "3. Identifie @kilomystery et ajoute le hashtag",
    howStep3Text:
      "Pour participer officiellement, identifie @kilomystery dans le post ou la story et ajoute le hashtag #KiloMysteryUnboxing.",

    prizeTitle: "Ce que tu peux gagner",
    prizeAllTitle: "🎟 Pour tous les participants",
    prizeAllText:
      "Après ta participation, nous t’envoyons un code de réduction de 10 % à utiliser sur ta prochaine commande KiloMystery.",
    prizeMonthlyTitle: "🏆 Meilleur unboxing du mois",
    prizeMonthlyText:
      "Chaque mois, nous sélectionnons le meilleur unboxing parmi tous les contenus publiés et le gagnant reçoit 2 Kg de KiloMystery GRATUITS, plus une mise en avant sur nos réseaux.",

    rulesTitle: "Règles rapides du concours",
    rulesBullet1: "Le contenu doit clairement montrer l’unboxing d’une box KiloMystery.",
    rulesBullet2: "La publication doit être publique et identifier @kilomystery.",
    rulesBullet3: "Elle doit inclure le hashtag #KiloMysteryUnboxing.",
    rulesBullet4: "Chaque box donne droit à une participation par mois (tu peux participer avec plusieurs box).",

    faqTitle: "Questions fréquentes",
    faqQ1: "Dois-je montrer mon visage dans la vidéo ?",
    faqA1:
      "Non, ce n’est pas obligatoire. Tu peux filmer uniquement tes mains et la box, ou simplement les produits sur la table. L’important, c’est l’unboxing.",
    faqQ2: "Comment je reçois le code promo de -10 % ?",
    faqA2:
      "Après avoir publié ton contenu et identifié @kilomystery avec le hashtag #KiloMysteryUnboxing, nous vérifions la participation et t’envoyons le code par email.",
    faqQ3: "Quand le gagnant du mois est-il choisi ?",
    faqA3:
      "À la fin de chaque mois, nous choisissons le contenu qui nous a le plus plu (créativité, qualité, réactions) et nous contactons le gagnant par email ou DM.",

    ctaPrimary: "Commander ta prochaine box",
    ctaSecondary: "Nous suivre sur TikTok et Instagram",
  },

  de: {
    kicker: "Unboxing contest",
    title: "KiloMystery Unboxing Contest",
    subtitle:
      "Nimm dein Unboxing auf, teile es in den sozialen Medien und mach beim offiziellen KiloMystery-Contest mit. 10 % Rabatt für alle Teilnehmer und 2 Kg gratis für das beste Unboxing des Monats.",

    howTitle: "So machst du mit",
    howStep1Title: "1. Nimm dein Unboxing auf",
    howStep1Text:
      "Sobald du deine Box erhältst, schnapp dir dein Handy, such dir gutes Licht und filme den Moment, in dem du dein KiloMystery öffnest (Video oder Fotos).",
    howStep2Title: "2. Teile es auf TikTok oder Instagram",
    howStep2Text:
      "Veröffentliche den Inhalt auf deinem TikTok- oder Instagram-Profil, stelle den Beitrag auf öffentlich und zeige deutlich, was in der Box war.",
    howStep3Title: "3. Markiere @kilomystery und nutze den Hashtag",
    howStep3Text:
      "Um offiziell teilzunehmen, markiere @kilomystery im Beitrag oder in der Story und nutze den Hashtag #KiloMysteryUnboxing.",

    prizeTitle: "Was du gewinnen kannst",
    prizeAllTitle: "🎟 Für alle Teilnehmer",
    prizeAllText:
      "Nachdem du teilgenommen hast, schicken wir dir einen 10 %-Rabattcode für deine nächste KiloMystery-Bestellung.",
    prizeMonthlyTitle: "🏆 Bestes Unboxing des Monats",
    prizeMonthlyText:
      "Jeden Monat wählen wir das beste Unboxing aus allen veröffentlichten Beiträgen und der Gewinner erhält 2 Kg KiloMystery GRATIS plus ein Shout-out auf unseren Kanälen.",

    rulesTitle: "Kurze Contest-Regeln",
    rulesBullet1: "Der Inhalt muss klar das Unboxing einer KiloMystery-Box zeigen.",
    rulesBullet2: "Der Beitrag muss öffentlich sein und @kilomystery markieren.",
    rulesBullet3: "Er muss den Hashtag #KiloMysteryUnboxing enthalten.",
    rulesBullet4: "Jede Box berechtigt zu einer Teilnahme pro Monat (du kannst mit mehreren Boxen mitmachen).",

    faqTitle: "Häufige Fragen",
    faqQ1: "Muss ich mein Gesicht im Video zeigen?",
    faqA1:
      "Nein, das ist nicht notwendig. Du kannst nur deine Hände und die Box filmen oder einfach die Produkte auf dem Tisch. Wichtig ist das Unboxing selbst.",
    faqQ2: "Wie bekomme ich den 10 %-Rabattcode?",
    faqA2:
      "Nachdem du den Inhalt veröffentlicht, @kilomystery markiert und den Hashtag #KiloMysteryUnboxing genutzt hast, prüfen wir die Teilnahme und senden dir den Code per E-Mail.",
    faqQ3: "Wann wird der Monatsgewinner ausgewählt?",
    faqA3:
      "Am Ende jedes Monats wählen wir den Beitrag, der uns in Kreativität, Qualität oder Reaktionen am meisten überzeugt hat, und kontaktieren den Gewinner per E-Mail oder DM.",

    ctaPrimary: "Deine nächste Box bestellen",
    ctaSecondary: "Folge uns auf TikTok & Instagram",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const lang: Lang = normalizeLang(resolved?.lang);
  // Usa uno slug tipo "ugc" o "unboxing-contest" nel tuo sistema SEO
  return getPageMetadata(lang, "how");
}

export default async function UgcPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolved = await params;
  const lang: Lang = normalizeLang(resolved?.lang);
  const t = UGC_COPY[lang] ?? UGC_COPY.it;

  const instagramUrl = "https://www.instagram.com/kilomystery";
  const tiktokUrl = "https://www.tiktok.com/@kilomystery";

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 space-y-10">
        {/* HERO */}
        <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 md:p-8">
          <header className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="section-kicker">{t.kicker}</div>
            <h1 className="text-4xl md:text-5xl font-extrabold">
              <span className="bg-gradient-to-r from-[#7A20FF] via-white to-[#20D27A] bg-clip-text text-transparent">
                {t.title}
              </span>
            </h1>
            <p className="text-white/70">{t.subtitle}</p>
          </header>
        </section>

        {/* HOW TO */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <span>🎥</span>
            <span>{t.howTitle}</span>
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="card space-y-2">
              <div className="text-3xl">📦</div>
              <h3 className="text-lg md:text-xl font-extrabold">
                {t.howStep1Title}
              </h3>
              <p className="text-white/70 text-sm md:text-base">
                {t.howStep1Text}
              </p>
            </div>
            <div className="card space-y-2">
              <div className="text-3xl">📲</div>
              <h3 className="text-lg md:text-xl font-extrabold">
                {t.howStep2Title}
              </h3>
              <p className="text-white/70 text-sm md:text-base">
                {t.howStep2Text}
              </p>
            </div>
            <div className="card space-y-2">
              <div className="text-3xl">🏷️</div>
              <h3 className="text-lg md:text-xl font-extrabold">
                {t.howStep3Title}
              </h3>
              <p className="text-white/70 text-sm md:text-base">
                {t.howStep3Text}
              </p>
            </div>
          </div>
        </section>

        {/* PRIZES */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <span>🎁</span>
            <span>{t.prizeTitle}</span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card space-y-2">
              <h3 className="text-sm uppercase tracking-[.18em] text-white/60">
                {t.prizeAllTitle}
              </h3>
              <p className="text-white/75 text-sm md:text-base">
                {t.prizeAllText}
              </p>
            </div>
            <div className="card space-y-2">
              <h3 className="text-sm uppercase tracking-[.18em] text-white/60">
                {t.prizeMonthlyTitle}
              </h3>
              <p className="text-white/75 text-sm md:text-base">
                {t.prizeMonthlyText}
              </p>
            </div>
          </div>
        </section>

        {/* RULES */}
        <section className="card space-y-3">
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <span>📜</span>
            <span>{t.rulesTitle}</span>
          </h2>
          <ul className="list-disc ps-5 space-y-1 text-white/70 text-sm md:text-base">
            <li>{t.rulesBullet1}</li>
            <li>{t.rulesBullet2}</li>
            <li>{t.rulesBullet3}</li>
            <li>{t.rulesBullet4}</li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="card space-y-4">
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <span>❓</span>
            <span>{t.faqTitle}</span>
          </h2>
          <div className="space-y-3 text-sm md:text-base text-white/80">
            <div>
              <p className="font-semibold">{t.faqQ1}</p>
              <p className="text-white/70">{t.faqA1}</p>
            </div>
            <div>
              <p className="font-semibold">{t.faqQ2}</p>
              <p className="text-white/70">{t.faqA2}</p>
            </div>
            <div>
              <p className="font-semibold">{t.faqQ3}</p>
              <p className="text-white/70">{t.faqA3}</p>
            </div>
          </div>
        </section>

        {/* CTA FINALE */}
        <section className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-white/60">
              💡
              {lang === "it"
                ? " Vuoi aumentare le probabilità di vincere? Punta su un unboxing creativo, chiaro e divertente."
                : lang === "en"
                ? " Want to increase your chances? Go for a clear, fun and creative unboxing."
                : lang === "es"
                ? " ¿Quieres aumentar tus posibilidades? Apuesta por un unboxing claro, divertido y creativo."
                : lang === "fr"
                ? " Tu veux augmenter tes chances ? Opte pour un unboxing clair, fun et créatif."
                : " Du willst deine Chancen erhöhen? Setze auf ein klares, kreatives und unterhaltsames Unboxing."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`/${lang}/products`} className="btn btn-brand btn-lg">
              {t.ctaPrimary}
            </a>
            <a
              href={lang === "it" || lang === "es" || lang === "fr" || lang === "de" || lang === "en" ? instagramUrl : instagramUrl}
              className="btn btn-ghost btn-sm"
              target="_blank"
              rel="noreferrer"
            >
              {t.ctaSecondary}
            </a>
          </div>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
