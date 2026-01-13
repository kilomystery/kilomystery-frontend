import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import { normalizeLang, type Lang } from "@/i18n/lang";
import { getAllPostsMeta } from "@/lib/blog";

export const dynamic = "force-static";

export default function BlogPage({
  params,
}: {
  params: { lang: string };
}) {
  const lang: Lang = normalizeLang(params.lang);
  const posts = getAllPostsMeta();

  return (
    <>
      <Header lang={lang} />

      <main className="container py-12 mb-16 space-y-10">
        <header className="max-w-2xl space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold">
            {lang === "it"
              ? "Blog & Approfondimenti"
              : lang === "en"
              ? "Blog & Insights"
              : lang === "es"
              ? "Blog y artículos"
              : lang === "fr"
              ? "Blog & articles"
              : "Blog & Artikel"}
          </h1>

          <p className="text-white/70">
            {lang === "it"
              ? "Guide, news ed eventi dal mondo KiloMystery."
              : lang === "en"
              ? "Guides, news and events from the KiloMystery world."
              : lang === "es"
              ? "Guías, noticias y eventos del mundo KiloMystery."
              : lang === "fr"
              ? "Guides, actualités et événements KiloMystery."
              : "Guides, News und Events von KiloMystery."}
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => {
            const title = post.title[lang] ?? post.title.it;
            const description =
              post.description[lang] ?? post.description.it;

            return (
              <article
                key={post.slug}
                className="card p-6 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="text-xs text-white/50">
                    {new Date(post.date).toLocaleDateString()}
                  </div>

                  <h2 className="text-xl font-extrabold">{title}</h2>

                  <p className="text-white/70 text-sm">{description}</p>
                </div>

                <div className="pt-4">
                  <Link
                    href={`/${lang}/blog/${post.slug}`}
                    className="btn btn-ghost"
                  >
                    {lang === "it"
                      ? "Leggi articolo"
                      : lang === "en"
                      ? "Read article"
                      : lang === "es"
                      ? "Leer artículo"
                      : lang === "fr"
                      ? "Lire l’article"
                      : "Artikel lesen"}
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
