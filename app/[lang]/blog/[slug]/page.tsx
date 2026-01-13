import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { normalizeLang, type Lang } from "@/i18n/lang";
import { getPostBySlug, getAllPostsMeta } from "@/lib/blog";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";

// componenti usabili nell’MDX (senza import dentro i contenuti!)
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

function estimateReadingMinutes(input: unknown) {
  // può arrivare stringa o oggetto (se sbagli content). Qui lo rendiamo robusto.
  const text =
    typeof input === "string"
      ? input
      : input && typeof input === "object"
      ? JSON.stringify(input)
      : "";

  const words = text.trim().split(/\s+/g).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function generateStaticParams() {
  const posts = getAllPostsMeta();
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
  const post = getPostBySlug(params.slug, lang);

  const site =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.kilomystery.com";

  if (!post) {
    return {
      title: "Blog | KiloMystery",
      description:
        lang === "it"
          ? "Articoli e news su mystery box, unboxing, eventi e sostenibilità."
          : lang === "en"
          ? "Articles and updates about mystery boxes, unboxing, events and sustainability."
          : lang === "es"
          ? "Artículos y novedades sobre mystery boxes, unboxing, eventos y sostenibilidad."
          : lang === "fr"
          ? "Articles et actus sur les mystery boxes, l’unboxing, les événements et la durabilité."
          : "Artikel & Updates zu Mystery Boxen, Unboxing, Events und Nachhaltigkeit.",
      alternates: {
        canonical: `${site}/${lang}/blog`,
      },
    };
  }

  const title = post.title[lang] || post.title.it;
  const description = post.description[lang] || post.description.it;

  return {
    title,
    description,
    alternates: {
      canonical: `${site}/${lang}/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${site}/${lang}/blog/${post.slug}`,
      type: "article",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { lang: string; slug: string };
}) {
  const lang: Lang = normalizeLang(params.lang);
  const post = getPostBySlug(params.slug, lang);

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
            <a href={`/${lang}/blog`} className="btn btn-ghost mt-4 inline-flex">
              {lang === "it"
                ? "Torna al Blog"
                : lang === "en"
                ? "Back to Blog"
                : lang === "es"
                ? "Volver al Blog"
                : lang === "fr"
                ? "Retour au Blog"
                : "Zurück zum Blog"}
            </a>
          </div>
        </main>
        <Footer lang={lang} />
      </>
    );
  }

  const site =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.kilomystery.com";

  const title = post.title[lang] || post.title.it;
  const description = post.description[lang] || post.description.it;

  // post.content qui è Localized => prendiamo solo la stringa della lingua
  const mdxSource = post.content[lang] || post.content.it || "";
  const readingMin = estimateReadingMinutes(mdxSource);
  const dateLabel = formatDateByLang(post.date, lang);

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
    mainEntityOfPage: `${site}/${lang}/blog/${post.slug}`,
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
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
            <span>{dateLabel}</span>
            <span>•</span>
            <span>
              {lang === "it"
                ? `${readingMin} min lettura`
                : lang === "en"
                ? `${readingMin} min read`
                : lang === "es"
                ? `${readingMin} min lectura`
                : lang === "fr"
                ? `${readingMin} min lecture`
                : `${readingMin} Min. Lesen`}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold">{title}</h1>
          <p className="text-white/70">{description}</p>
        </header>

        <article className="prose prose-invert max-w-none">
          <MDXRemote
            source={mdxSource}
            components={{
              Callout,
              ButtonLink,
              ArticleCta,
            }}
          />
        </article>
      </main>

      <Footer lang={lang} />
    </>
  );
}
