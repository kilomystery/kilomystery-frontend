import type { Metadata } from "next";
import { normalizeLang, type Lang } from "@/i18n/lang";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang = normalizeLang(params?.lang) as Lang;

  // Se vuoi puoi personalizzare title/description per lingua,
  // ma puoi anche lasciarlo vuoto e usare quello globale in app/layout.tsx
  return {
    alternates: {
      canonical: `/${lang}`,
    },
  };
}

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  // Importante: non serve fare altro qui
  // Il vero <html>/<body> e i Script stanno nel root layout.
  return <>{children}</>;
}
