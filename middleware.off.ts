// middleware.ts
import { NextResponse, NextRequest } from "next/server";

const LOCALES = ["it", "en", "es", "fr", "de"] as const;
type Locale = typeof LOCALES[number];
const DEFAULT_LOCALE: Locale = "it";

// Escludi asset, _next, api, file con estensione, favicon, immagini, ecc.
const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // skip: file pubblici, _next, api
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 1) /  -> /it
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}`;
    const res = NextResponse.redirect(url);
    res.cookies.set("lang", DEFAULT_LOCALE, { path: "/" });
    return res;
  }

  // 2) valida la prima parte del path
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (!LOCALES.includes(maybeLocale as Locale)) {
    // non c'è lingua nello slug -> prepend default
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    const res = NextResponse.redirect(url);
    res.cookies.set("lang", DEFAULT_LOCALE, { path: "/" });
    return res;
  }

  // 3) lingua valida: persistila su cookie
  const res = NextResponse.next();
  res.cookies.set("lang", maybeLocale, { path: "/" });
  return res;
}

// Limita il matcher solo a route dell’app (no static, no api)
export const config = {
  matcher: [
    "/((?!_next|api|.*\\..*|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};