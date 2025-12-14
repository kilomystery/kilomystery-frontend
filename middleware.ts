// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SUPPORTED_LANGS, detectLangFromHeader, type Lang } from "./i18n/lang";

const PUBLIC_FILE = /\.(.*)$/;
const PREVIEW_COOKIE = "km_preview";

// Coming soon SEMPRE attiva (finché non vai live)
const COMING_SOON_ENABLED = true;

// Bot principali (per SEO)
const BOT_REGEX =
  /googlebot|google-inspectiontool|googleother|adsbot|bingbot|duckduckbot|yandex|baidu|crawler|spider|bot/i;

function isBot(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  return BOT_REGEX.test(ua);
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname } = url;

  // 1️⃣ Escludiamo asset, api, file pubblici
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

  // 2️⃣ Preview admin → set cookie e lascia passare
  if (url.searchParams.get("km_preview") === "1") {
    const clean = url.clone();
    clean.searchParams.delete("km_preview");

    const res = NextResponse.redirect(clean);
    res.cookies.set(PREVIEW_COOKIE, "1", {
      path: "/",
      sameSite: "lax",
    });
    return res;
  }

  const hasPreview = req.cookies.get(PREVIEW_COOKIE)?.value === "1";

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  const hasLang = SUPPORTED_LANGS.includes(first as Lang);

  // 3️⃣ Se BOT o PREVIEW → VEDONO IL SITO REALE
  if (isBot(req) || hasPreview) {
    // Se manca la lingua, la aggiungiamo
    if (!hasLang) {
      const lang = detectLangFromHeader(
        req.headers.get("accept-language")
      );
      const redirect = url.clone();
      redirect.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
      return NextResponse.redirect(redirect);
    }

    return NextResponse.next();
  }

  // 4️⃣ UTENTE NORMALE → SEMPRE COMING SOON
  let lang: Lang;

  if (hasLang) {
    lang = first as Lang;
  } else {
    lang = detectLangFromHeader(req.headers.get("accept-language"));
  }

  // fallback di sicurezza
  if (!SUPPORTED_LANGS.includes(lang)) {
    lang = "en";
  }

  const isAlreadyComingSoon =
    hasLang && segments[1] === "coming-soon";

  if (isAlreadyComingSoon) {
    return NextResponse.next();
  }

  const rewrite = url.clone();
  rewrite.pathname = `/${lang}/coming-soon`;
  rewrite.search = "";

  return NextResponse.rewrite(rewrite);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
