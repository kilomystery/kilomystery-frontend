import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import type { Lang } from "@/i18n/lang";
import type { Metadata } from "next";

import { PRESS_LANGS, safeLang, getLocale } from "@/lib/press/i18n";
import { getPressPostBySlug, getAllPressPostsMeta } from "@/lib/press";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const posts = getAllPressPostsMeta();
  const params: Array<{ lang: Lang; slug: string }> = [];

  for (const p of posts) {
    for (const l of PRESS_LANGS) params.push({ lang: l, slug: p.slug });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string; slug: string };
}): Promise<Metadata> {
  const lang: Lang = safeLang(params.lang);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kilomystery.com";

  const post = getPressPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Press | KiloMystery",
      description: "Press & media page for KiloMystery.",
      alternates: { canonical: `${site}/${lang}/press` },
    };
  }

  const title = post.title[lang] || post.title.it;
  const description = post.description[lang] || post.description.it;

  return {
    title: `${title} | KiloMystery`,
    description,
    alternates: { canonical: `${site}/${lang}/press/${post.slug}` },
    openGraph: {
      title: `${title} | KiloMystery`,
      description,
      url: `${site}/${lang}/press/${post.slug}`,
      type: "article",
    },
  };
}

export default function PressSlugPage({
  params,
}: {
  params: { lang: string; slug: string };
}) {
  const lang: Lang = safeLang(params.lang);
  const locale = getLocale(lang);

  const post = getPressPostBySlug(params.slug);

  if (!post) {
    return (
      <>
        <Header lang={lang} />
        <main className="container py-10 mb-16">
          <div className="card p-6">
            <h1 className="text-2xl font-extrabold">
              {lang === "it"
                ? "Articolo non trovato"
                : lang === "en"
                ? "Article not found"
                : lang === "es"
                ? "Artículo no encontrado"
                : lang === "fr"
                ? "Article introuvable"
                : "Artikel nicht gefunden"}
            </h1>

            <p className="text-white/70 mt-2">
              {lang === "it"
                ? "Torna alla pagina Press per vedere gli articoli disponibili."
                : lang === "en"
                ? "Go back to Press to see available articles."
                : lang === "es"
                ? "Vuelve a Prensa para ver artículos disponibles."
                : lang === "fr"
                ? "Retourne sur Presse pour voir les articles."
                : "Zurück zur Presse-Seite."}
            </p>

            <a href={`/${lang}/press`} className="btn btn-ghost mt-4 inline-flex">
              {lang === "it"
                ? "Vai a Press"
                : lang === "en"
                ? "Go to Press"
                : lang === "es"
                ? "Ir a Prensa"
                : lang === "fr"
                ? "Aller à Presse"
                : "Zur Presse"}
            </a>
          </div>
        </main>
        <Footer lang={lang} />
      </>
    );
  }

  const title = post.title[lang] || post.title.it;
  const description = post.description[lang] || post.description.it;
  const content = post.content[lang] || post.content.it;

  // JSON-LD Article
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kilomystery.com";
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: "KiloMystery",
      url: site,
    },
    publisher: {
      "@type": "Organization",
      name: "KiloMystery",
      url: site,
      logo: {
        "@type": "ImageObject",
        url: `${site}/logo.png`,
      },
    },
    mainEntityOfPage: `${site}/${lang}/press/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <Header lang={lang} />

      <main className="container py-10 mb-16 space-y-6">
        <header className="space-y-3">
          <div className="text-xs text-white/60">
            {new Date(post.date).toLocaleDateString(locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold">{title}</h1>
          <p className="text-white/70">{description}</p>

          <div className="pt-2 flex flex-wrap gap-2">
            <a href={`/${lang}/products`} className="btn btn-brand">
              {lang === "it"
                ? "Vai alle Mystery Box"
                : lang === "en"
                ? "Shop Mystery Boxes"
                : lang === "es"
                ? "Ver Mystery Boxes"
                : lang === "fr"
                ? "Voir les Mystery Boxes"
                : "Mystery Boxen ansehen"}
            </a>

            <a href={`/${lang}/press`} className="btn btn-ghost">
              {lang === "it"
                ? "Torna a Press"
                : lang === "en"
                ? "Back to Press"
                : lang === "es"
                ? "Volver a Prensa"
                : lang === "fr"
                ? "Retour à Presse"
                : "Zurück zur Presse"}
            </a>
          </div>
        </header>

        <article className="prose prose-invert max-w-none">
          {/* content qui è HTML/MDX? In questa versione è stringa markdown */}
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </article>

        <section className="card p-6">
          <h3 className="text-lg font-extrabold">
            {lang === "it"
              ? "Contatto media"
              : lang === "en"
              ? "Media contact"
              : lang === "es"
              ? "Contacto prensa"
              : lang === "fr"
              ? "Contact presse"
              : "Pressekontakt"}
          </h3>
          <p className="text-white/70 mt-2">
            info@kilomystery.com
          </p>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
