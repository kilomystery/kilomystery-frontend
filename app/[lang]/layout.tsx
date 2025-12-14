// app/[lang]/layout.tsx
import type { ReactNode } from "react";
import { SUPPORTED_LANGS } from "@/i18n/lang";

export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export default function LangSegmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
