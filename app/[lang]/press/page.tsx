import Header from "../../components/Header";
import Footer from "../../components/Footer";
import type { Lang } from "@/i18n/lang";
import type { Metadata } from "next";

import { PRESS_LANGS, safeLang, getLocale, pressCopy } from "@/lib/press/i18n";
import { getAllPressPostsMeta, getPressMentions } from "@/lib/press";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return PRESS_LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang: Lang = safeLang(params.lang);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kilomystery.com";
  const c = pressCopy(lang);

  return {
    title: `${c.pageTitle} | KiloMystery`,
    description: c.pageSubtitle,
    alternates: { canonical: `${site}/${lang}/press` },
    openGraph: {
      title: `${c.pageTitle} | KiloMystery`,
      description: c.pageSubtitle,
      url: `${site}/${lang}/press`,
      type: "website",
    },
  };
}

export default function PressPage({ params }: { params: { lang: string } }) {
  const lang: Lang = safeLang(params.lang);
  const c = pressCopy(lang);
  const locale = getLocale(lang);

  const posts = getAllPressPostsMeta();
  const mentions = getPressMentions();

  return (
    <>
      <Header lang={lang} />

      <main className="container py-10 mb-16 space-y-10">
        {/* HERO */}
        <header className="card p-6 md:p-8 space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold">{c.pageTitle}</h1>
          <p className="text-white/70">{c.pageSubtitle}</p>

          <div className="pt-2 flex flex-wrap gap-2">
            <a href={`/${lang}/products`} className="btn btn-brand">
              {c.ctaProducts}
            </a>
            <a href={`/${lang}/blog`} className="btn btn-ghost">
              {c.ctaBlog}
            </a>
          </div>
        </header>

        {/* MEDIA KIT */}
        <section className="card p-6 space-y-3">
          <h2 className="text-2xl font-extrabold">{c.kitTitle}</h2>
          <ul className="text-white/75 space-y-1">
            <li>• {c.kitBrand}</li>
            <li>• {c.kitWhat}</li>
            <li>• {c.kitContact}</li>
            <li>• {c.kitSite}</li>
          </ul>

          <div className="text-xs text-white/50">
            Tip: quando avrai loghi/immagini ufficiali, possiamo aggiungere un
            bottone “Download press kit”.
          </div>
        </section>

        {/* OFFICIAL POSTS */}
        <section className="space-y-3">
          <h2 className="text-2xl font-extrabold">{c.eventsTitle}</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {posts.map((p) => {
              const title = p.title[lang] || p.title.it;
              const desc = p.description[lang] || p.description.it;

              return (
                <a
                  key={p.slug}
                  href={`/${lang}/press/${p.slug}`}
                  className="card p-5 hover:brightness-110 transition block"
                >
                  <div className="text-xs text-white/60">
                    {new Date(p.date).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>

                  <div className="mt-1 text-lg font-extrabold">{title}</div>
                  <p className="mt-2 text-white/70 text-sm">{desc}</p>

                  <div className="mt-3 text-sm text-emerald-200/90">
                    {c.openArticle}
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* EXTERNAL MENTIONS */}
        <section className="space-y-3">
          <h2 className="text-2xl font-extrabold">{c.mentionsTitle}</h2>

          {mentions.length === 0 ? (
            <div className="card p-6 text-white/70">{c.mentionsEmpty}</div>
          ) : (
            <div className="grid gap-3">
              {mentions.map((m, idx) => {
                const title = m.title[lang] || m.title.it;
                const note = m.note ? m.note[lang] || m.note.it : "";

                return (
                  <a
                    key={idx}
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="card p-5 hover:brightness-110 transition block"
                  >
                    <div className="text-xs text-white/60">
                      {m.source}
                      {m.date
                        ? ` • ${new Date(m.date).toLocaleDateString(locale)}`
                        : ""}
                    </div>

                    <div className="mt-1 font-extrabold">{title}</div>
                    {note && <p className="mt-2 text-white/70 text-sm">{note}</p>}

                    <div className="mt-3 text-sm text-emerald-200/90">
                      {c.openExternal}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>

        {/* CONTACT */}
        <section className="card p-6">
          <h2 className="text-2xl font-extrabold">{c.mediaTitle}</h2>
          <p className="text-white/70 mt-2">{c.mediaText}</p>

          <div className="mt-3">
            <a className="btn btn-ghost inline-flex" href="mailto:info@kilomystery.com">
              info@kilomystery.com
            </a>
          </div>
        </section>
      </main>

      <Footer lang={lang} />
    </>
  );
}
