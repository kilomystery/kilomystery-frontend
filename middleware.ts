// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SUPPORTED_LANGS, detectLangFromHeader, type Lang } from "./i18n/lang";
import { UTM_LINKS } from "./src/utm-links";
import { POPORAMA_COOKIE, verifyPoporamaSession } from "./app/lib/poporama-session";

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

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname } = url;

  // Prima delle esclusioni asset/API: anche handle con un punto sono privati.
  const privateApi = pathname === "/api/poporama" || pathname.startsWith("/api/poporama/");
  const privatePage = /^\/([^/]+)\/poporama-test(?:\/|$)/.exec(pathname);
  const loginPage = /^\/([^/]+)\/poporama-accesso\/?$/.exec(pathname);
  // Conserva l'host del browser anche quando NextURL normalizza il loopback.
  function poporamaRedirect(target: string) {
    const destination = new URL(req.url);
    destination.host = req.headers.get("host") || destination.host;
    destination.pathname = target;
    destination.search = "";
    const response = NextResponse.redirect(destination);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
  if (loginPage && await verifyPoporamaSession(req.cookies.get(POPORAMA_COOKIE)?.value)) {
    return poporamaRedirect(`/${loginPage[1]}/poporama-test`);
  }
  if ((privateApi && pathname !== "/api/poporama/session") || privatePage) {
    const expiresAt = await verifyPoporamaSession(req.cookies.get(POPORAMA_COOKIE)?.value);
    if (!expiresAt) {
      if (privateApi) return NextResponse.json({ ok: false, authenticated: false,
        error: "Sessione POPORAMA scaduta o assente. Accedi nuovamente." },
      { status: 401, headers: { "Cache-Control": "no-store" } });
      return poporamaRedirect(`/${privatePage![1]}/poporama-accesso`);
    }
  }

  // 1) Asset e file pubblici (incluso km-consent-stub.js)
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // =========================
  // ENTERPRISE TRACKING ROUTES
  // =========================

  // A) Non forzare prefisso lingua su /r/*
  // (questa route serve solo a fare redirect server-side con UTM)
  if (pathname.startsWith("/r/")) {
    return NextResponse.next();
  }

  // B) Se URL è tipo "/susy" (o "/tiktok" ecc.) e lo slug è mappato,
  // fai rewrite interno a "/r/susy" PRIMA della logica lingua.
  // Così eviti che diventi "/it/susy" (che ti rompeva attribuzione).
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  const hasLang = SUPPORTED_LANGS.includes(first as Lang);

  // caso: "/susy" => segments.length === 1 e non ha lingua
  if (!hasLang && segments.length === 1) {
    const slug = first?.toLowerCase();
    if (slug && UTM_LINKS[slug]) {
      const rewrite = url.clone();
      rewrite.pathname = `/r/${slug}`;
      return NextResponse.rewrite(rewrite);
    }
  }

  // =========================
  // TUA LOGICA LINGUA (INVARIATA)
  // =========================

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
    const redirectUrl = url.clone();
    redirectUrl.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
    const res = NextResponse.redirect(redirectUrl);
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
    "/api/poporama/:path*",
    "/:lang/poporama-test/:path*",
    // ✅ Non eseguire middleware su asset / file / km-consent-stub.js
    "/((?!api/|_next/|static/|favicon.ico|robots.txt|sitemap.xml|km-consent-stub\\.js|.*\\.(?:js|css|map|png|jpg|jpeg|svg|webp|ico|txt|xml)).*)",
  ],
};
