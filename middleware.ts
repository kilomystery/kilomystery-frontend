// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SUPPORTED_LANGS, detectLangFromHeader, type Lang } from "./i18n/lang";

const PUBLIC_FILE = /\.(.*)$/;

// 🔒 Cookie per bypassare la Coming Soon (per te/admin)
const PREVIEW_COOKIE_NAME = "km_preview";

// ⚙️ Coming Soon: SPENTA di default.
// Si attiva solo se in ambiente hai NEXT_PUBLIC_COMING_SOON="true".
const COMING_SOON_ENABLED = process.env.NEXT_PUBLIC_COMING_SOON === "true";

// Pattern base per user-agent dei crawler
const CRAWLER_UA_PATTERNS = [
  /googlebot/i,
  /google-inspectiontool/i,
  /googleother/i,
  /adsbot-google/i,
  /mediapartners-google/i,
  /apis-google/i,
  /bingbot/i,
  /duckduckbot/i,
  /yandexbot/i,
  /baiduspider/i,
  /sogou/i,
  /exabot/i,
  /facebot/i,
  /ia_archiver/i,
  /crawler/i,
  /spider/i,
  /bot/i,
  /slurp/i,
];

function isSearchCrawler(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  return CRAWLER_UA_PATTERNS.some((re) => re.test(ua));
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname } = url;

  // 0) Escludiamo asset statici, API, file pubblici, robots, sitemap ecc.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/preview") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 1) Gestione bypass: ?km_preview=1 → set cookie e ripulisce l'URL
  if (url.searchParams.get("km_preview") === "1") {
    const cleanUrl = url.clone();
    cleanUrl.searchParams.delete("km_preview");

    const res = NextResponse.redirect(cleanUrl);
    res.cookies.set(PREVIEW_COOKIE_NAME, "1", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });

    return res;
  }

  const segments = pathname.split("/").filter(Boolean); // es: "/it/how-it-works" → ["it","how-it-works"]
  const firstSegment = segments[0];
  const hasLangPrefix = SUPPORTED_LANGS.includes(firstSegment as Lang);

  const hasPreviewBypass =
    req.cookies.get(PREVIEW_COOKIE_NAME)?.value === "1";

  // 2) Modalità COMING SOON (solo utenti normali, non crawler, non preview)
  if (COMING_SOON_ENABLED && !hasPreviewBypass && !isSearchCrawler(req)) {
    const isAlreadyComingSoon =
      (hasLangPrefix && segments[1] === "coming-soon") ||
      (!hasLangPrefix && pathname === "/coming-soon");

    // Se sto già visualizzando la coming soon, lascio passare
    if (isAlreadyComingSoon) {
      return NextResponse.next();
    }

    // Se il path ha già la lingua → la riuso
    let lang: Lang;
    if (hasLangPrefix) {
      lang = firstSegment as Lang;
    } else {
      // Altrimenti deduco dal browser
      lang = detectLangFromHeader(req.headers.get("accept-language"));
    }

    const rewriteUrl = url.clone();
    rewriteUrl.pathname = `/${lang}/coming-soon`;
    rewriteUrl.search = "";

    return NextResponse.rewrite(rewriteUrl);
  }

  // 3) Routing i18n "normale"

  // 3a) Se l'URL ha già una lingua supportata come primo segmento, non tocchiamo nulla.
  //     Es: /it/..., /en/..., /de/... → passano dritti alle pagine [lang].
  if (hasLangPrefix) {
    return NextResponse.next();
  }

  // 3b) Se NON c'è la lingua nel path (es: "/", "/products"),
  //     redirezioniamo a /{lang}/... in base all'Accept-Language.
  const lang = detectLangFromHeader(req.headers.get("accept-language"));
  const redirectUrl = url.clone();
  redirectUrl.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(redirectUrl);
}

// Applichiamo il middleware a tutte le pagine tranne asset statici & co.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
