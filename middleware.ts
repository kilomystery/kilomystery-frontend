// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SUPPORTED_LANGS, detectLangFromHeader } from "./i18n/lang";

const PUBLIC_FILE = /\.(.*)$/;

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

  // Se l'URL ha già una lingua supportata come primo segmento, non facciamo nulla
  // es: /it, /en/products, /fr/events...
  const segments = pathname.split("/");
  const first = segments[1];

  if (SUPPORTED_LANGS.includes(first as any)) {
    return NextResponse.next();
  }

  // Altrimenti: niente lingua nel path → deduco dal browser
  const lang = detectLangFromHeader(req.headers.get("accept-language"));

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
