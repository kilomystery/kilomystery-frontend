import { normalizeLang } from "@/i18n/lang";

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang = normalizeLang(params.lang);

  return (
    <html lang={lang} className="bg-[#0b0f14] text-white">
      <body>{children}</body>
    </html>
  );
}
