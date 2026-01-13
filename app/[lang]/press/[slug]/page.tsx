import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { normalizeLang, type Lang } from "@/i18n/lang";
import { getPressPostBySlug, getAllPressPostsMeta } from "@/lib/press";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";

import Callout from "@/app/components/mdx/Callout";
import ButtonLink from "@/app/components/mdx/ButtonLink";
import ArticleCta from "@/app/components/mdx/ArticleCta";

export const dynamic = "force-static";

const LANGS: Lang[] = ["it", "en", "es", "fr", "de"];

function formatDateByLang(dateISO: string, lang: Lang) {
  const d = new Date(dateISO);
  const locale =
    lang === "it"
      ? "it-IT"
      : lang === "en"
      ? "en-GB"
      : lang === "es"
      ? "es-ES"
      : lang === "fr"
      ? "fr-FR"
      : "de-DE";

  try {
    return d.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export async function generateStaticParams() {
  const posts = getAllPressPostsMeta();
  const params: Array<{ lang: Lang; slug: string }> = [];

  for (const p of posts) {
    for (const l of LANGS) params.push({ lang: l, slug: p.slug });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string; slug: string };
}): Promise<Metadata> {
  const lang: Lang = normalizeLang(params.lang);
  const post = getPressPostBySlug(params.slug, lang);

  const site =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.kilomystery.com";

  if (!post) {
    return {
      title: "Press | KiloMystery",
      description:
        lang === "it"
          ? "Comunicati, eventi e rassegna stampa."
          : lang === "en"
          ? "Press releases, events and media coverage."
          : lang === "es"
          ? "Comunicados, eventos y prensa."
          : lang === "fr"
          ? "Communiqués, événements et presse."
          : "Presse, Events und Medienberichte.",
      alternates: { canonical: `${site}/${lang}/press` },
    };
  }

  const title = post.title[lang] || post.title.it;
  const description = post.description[lang] || post.description.it;

  return {
    title,
    description,
    alternates: {
      canonical: `${site}/${lang}/press/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${site}/${lang}/press/${post.slug}`,
      type: "article",
    },
  };
}

export default async function PressPostPage({
  params,
}: {
  params: { lang: string; slug: string };
}) {
  const lang: Lang = normalizeLang(params.lang);
  const post = getPressPostBySlug(params.slug, lang);

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
                ? "Post not found"
                : lang === "es"
                ? "Artículo no encontrado"
                : lang === "fr"
                ? "Article introuvable"
                : "Artikel nicht gefunden"}
            </h1>
            <a href={`/${lang}/press`} className="btn btn-ghost mt-4 inline-flex">
              {lang === "it"
                ? "Torna a Press"
                : lang === "en"
                ? "Back to Press"
                : lang === "es"
                ? "Volver a Press"
                : lang === "fr"
                ? "Retour à Press"
                : "Zurück zur Presse"}
            </a>
          </div>
        </main>
        <Footer lang={lang} />
      </>
    );
  }

  const title = post.title[lang] || post.title.it;
  const description = post.description[lang] || post.description.it;
  const dateLabel = formatDateByLang(post.date, lang);

  // IMPORTANTISSIMO: content è Localized -> prendo SOLO la stringa per lingua
  const mdxSource = post.content[lang] || post.content.it || "";

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 mb-16 space-y-6">
        <header className="space-y-3">
          <div className="text-xs text-white/60">{dateLabel}</div>
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
                ? "Volver a Press"
                : lang === "fr"
                ? "Retour à Press"
                : "Zurück zur Presse"}
            </a>
          </div>
        </header>

        <article className="prose prose-invert max-w-none">
          <MDXRemote
            source={mdxSource}
            components={{ Callout, ButtonLink, ArticleCta }}
          />
        </article>

        <section className="card p-5">
          <div className="text-sm font-semibold">
            {lang === "it"
              ? "Contatto media"
              : lang === "en"
              ? "Media contact"
              : lang === "es"
              ? "Contacto prensa"
              : lang === "fr"
              ? "Contact presse"
              : "Pressekontakt"}
          </div>
          <div className="text-white/70 mt-1">info@kilomystery.com</div>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
