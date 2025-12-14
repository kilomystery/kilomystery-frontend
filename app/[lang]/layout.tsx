// app/[lang]/layout.tsx
import { normalizeLang } from "@/i18n/lang";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = normalizeLang(rawLang);

  return (
    <html lang={lang} className="bg-[#0b0f14] text-white">
      <body>{children}</body>
    </html>
  );
}
