// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SUPPORTED_LANGS, detectLangFromHeader } from "./i18n/lang";

const PUBLIC_FILE = /\.(.*)$/;
const COMING_SOON_ENABLED =
  process.env.NEXT_PUBLIC_COMING_SOON === "true";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Escludiamo file statici, API, ecc.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // -----------------------------
  // 1) Modalità COMING SOON
  // -----------------------------
  if (COMING_SOON_ENABLED) {
    // segmenti path senza stringhe vuote
    const segments = pathname.split("/").filter(Boolean);
    const first = segments[0];

    const isRootComingSoon = pathname === "/coming-soon";
    const isLangComingSoon =
      segments.length >= 2 &&
      SUPPORTED_LANGS.includes(first as any) &&
      segments[1] === "coming-soon";

    // Se sto già vedendo la coming soon, lascio passare
    if (isRootComingSoon || isLangComingSoon) {
      return NextResponse.next();
    }

    // Tutto il resto viene riscritto su /{lang}/coming-soon
    const url = req.nextUrl.clone();

    // Se il path ha già una lingua supportata, la riuso
    if (SUPPORTED_LANGS.includes(first as any)) {
      url.pathname = `/${first}/coming-soon`;
    } else {
      // altrimenti la deduco dall'header
      const lang = detectLangFromHeader(
        req.headers.get("accept-language")
      );
      url.pathname = `/${lang}/coming-soon`;
    }

    return NextResponse.rewrite(url);
  }

  // -----------------------------
  // 2) Routing i18n "normale"
  // -----------------------------

  // Se l'URL ha già una lingua supportata come primo segmento, non facciamo nulla
  // es: /it, /en/products, /fr/events...
  const segments = pathname.split("/");
  const first = segments[1];

  if (SUPPORTED_LANGS.includes(first as any)) {
    return NextResponse.next();
  }

  // Altrimenti: niente lingua nel path → deduco dal browser
  const lang = detectLangFromHeader(
    req.headers.get("accept-language")
  );

  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(url);
}

// Matcher per dire a Next su quali path applicare il middleware
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
