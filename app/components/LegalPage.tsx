// app/components/LegalPage.tsx
import Image from "next/image";
import Header from "./Header";
import Footer from "./Footer";

type Props = {
  lang: "it" | "en" | "es" | "fr" | "de";
  title: string;
  children: React.ReactNode;
};

export default function LegalPage({ lang, title, children }: Props) {
  return (
    <>
      {/* Header è client component ma può essere usato dentro un server component */}
      <Header lang={lang} />

      {/* HERO */}
      <section className="relative border-b border-white/10">
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(1200px 400px at 20% -20%, rgba(139,92,246,.15), transparent 60%), radial-gradient(1200px 400px at 80% -20%, rgba(34,197,94,.12), transparent 60%)",
          }}
        />
        <div className="container relative py-12 md:py-16">
          <div className="mb-6 w-[160px] md:w-[220px] relative aspect-[3/1]">
            <Image
              src="/logo.svg"
              alt="KiloMistery"
              fill
              className="object-contain drop-shadow"
              priority
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {title}
          </h1>
        </div>
      </section>

      {/* CONTENUTO */}
      <main className="container max-w-3xl py-10 md:py-12">
        <div className="prose prose-invert prose-headings:font-extrabold prose-a:underline prose-a:decoration-1 prose-a:underline-offset-4 prose-li:my-1">
          {children}
        </div>
      </main>

      <Footer lang={lang} />
    </>
  );
}