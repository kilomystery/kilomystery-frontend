// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SUPPORTED_LANGS, detectLangFromHeader, type Lang } from "./i18n/lang";

const PUBLIC_FILE = /\.(.*)$/;
const LANG_COOKIE = "km_lang";

function isPublicPath(pathname: string) {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    PUBLIC_FILE.test(pathname)
  );
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname } = url;

  // 1) Asset e file pubblici
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  const hasLang = SUPPORTED_LANGS.includes(first as Lang);

  // 2) Determina lingua
  // - se URL ha /:lang -> usa quella
  // - altrimenti prova cookie km_lang
  // - altrimenti accept-language
  // - fallback: en
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
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
