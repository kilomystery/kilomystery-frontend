// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SUPPORTED_LANGS, detectLangFromHeader, type Lang } from "./i18n/lang";

const PUBLIC_FILE = /\.(.*)$/;
const LANG_COOKIE = "km_lang";

// ✅ Lista esplicita di asset che NON devono mai essere toccati dal middleware
const ALWAYS_PUBLIC = new Set([
  "/km-consent-stub.js",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
]);

function isPublicPath(pathname: string) {
  return (
    ALWAYS_PUBLIC.has(pathname) ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_FILE.test(pathname)
  );
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname } = url;

  // 1) Asset e file pubblici (incluso km-consent-stub.js)
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  const hasLang = SUPPORTED_LANGS.includes(first as Lang);

  // 2) Determina lingua
  let lang: Lang;

  if (hasLang) {
    lang = first as Lang;
  } else {
    const fromCookie = req.cookies.get(LANG_COOKIE)?.value as Lang | undefined;
    if (fromCookie && SUPPORTED_LANGS.includes(fromCookie)) {
      lang = fromCookie;
    } else {
      lang = detectLangFromHeader(req.headers.get("accept-language"));
    }
  }

  if (!SUPPORTED_LANGS.includes(lang)) {
    lang = "en";
  }

  // 3) Se manca il prefisso lingua -> redirect a /:lang/...
  if (!hasLang) {
    const redirect = url.clone();
    redirect.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
    const res = NextResponse.redirect(redirect);
    res.cookies.set(LANG_COOKIE, lang, { path: "/", sameSite: "lax" });
    return res;
  }

  // 4) Se c'è già la lingua -> passa e aggiorna cookie
  const res = NextResponse.next();
  res.cookies.set(LANG_COOKIE, lang, { path: "/", sameSite: "lax" });
  return res;
}

export const config = {
  matcher: [
    // ✅ Non eseguire middleware su asset / file / km-consent-stub.js
    "/((?!api/|_next/|static/|favicon.ico|robots.txt|sitemap.xml|km-consent-stub\\.js|.*\\.(?:js|css|map|png|jpg|jpeg|svg|webp|ico|txt|xml)).*)",
  ],
};
