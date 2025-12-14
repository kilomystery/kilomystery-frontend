// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SUPPORTED_LANGS, detectLangFromHeader, type Lang } from "./i18n/lang";

const PUBLIC_FILE = /\.(.*)$/;
const PREVIEW_COOKIE = "km_preview";
const LANG_COOKIE = "km_lang";

// Coming soon sempre attiva
const COMING_SOON_ENABLED = true;

// Bot per SEO
const BOT_REGEX =
  /googlebot|google-inspectiontool|googleother|adsbot|bingbot|duckduckbot|yandex|baidu|crawler|spider|bot/i;

function isBot(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  return BOT_REGEX.test(ua);
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname } = url;

  // 1️⃣ Asset e file pubblici
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2️⃣ Preview admin
  if (url.searchParams.get("km_preview") === "1") {
    const clean = url.clone();
    clean.searchParams.delete("km_preview");

    const res = NextResponse.redirect(clean);
    res.cookies.set(PREVIEW_COOKIE, "1", {
      path: "/",
      sameSite: "lax",
    });
    res.cookies.set(LANG_COOKIE, detectLangFromHeader(req.headers.get("accept-language")), {
      path: "/",
      sameSite: "lax",
    });
    return res;
  }

  const hasPreview = req.cookies.get(PREVIEW_COOKIE)?.value === "1";

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  const hasLang = SUPPORTED_LANGS.includes(first as Lang);

  // 3️⃣ BOT o ADMIN → sito reale
  if (isBot(req) || hasPreview) {
    if (!hasLang) {
      const lang = detectLangFromHeader(
        req.headers.get("accept-language")
      );
      const redirect = url.clone();
      redirect.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
      const res = NextResponse.redirect(redirect);
      res.cookies.set(LANG_COOKIE, lang, { path: "/", sameSite: "lax" });
      return res;
    }
    const res = NextResponse.next();
    res.cookies.set(LANG_COOKIE, first as Lang, {
      path: "/",
      sameSite: "lax",
    });
    return res;
  }

  // 4️⃣ UTENTI NORMALI → COMING SOON

  // 🔥 QUI È LA PARTE CHIAVE 🔥
  // Se l'URL ha già una lingua → USALA
  // NON leggere il browser
  let lang: Lang;

  if (hasLang) {
    lang = first as Lang;
  } else {
    lang = detectLangFromHeader(
      req.headers.get("accept-language")
    );
  }

  // fallback globale
  if (!SUPPORTED_LANGS.includes(lang)) {
    lang = "en";
  }

  const isAlreadyComingSoon =
    hasLang && segments[1] === "coming-soon";

  if (isAlreadyComingSoon) {
    const res = NextResponse.next();
    res.cookies.set(LANG_COOKIE, lang, { path: "/", sameSite: "lax" });
    return res;
  }

  const rewrite = url.clone();
  rewrite.pathname = `/${lang}/coming-soon`;
  rewrite.search = "";

  const res = NextResponse.rewrite(rewrite);
  res.cookies.set(LANG_COOKIE, lang, { path: "/", sameSite: "lax" });
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
