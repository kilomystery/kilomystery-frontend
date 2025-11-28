// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SUPPORTED_LANGS, detectLangFromHeader } from "./i18n/lang";

const PUBLIC_FILE = /\.(.*)$/;

// flag per attivare/disattivare la coming soon
const COMING_SOON_ENABLED =
  process.env.NEXT_PUBLIC_COMING_SOON === "true";

// nome cookie per bypassare la coming soon (per te/admin)
const PREVIEW_COOKIE_NAME = "km_preview";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 0) Escludiamo file statici, API, preview, ecc.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/preview") || // così /preview/enable funziona anche con coming soon attiva
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Controllo cookie di preview (per te/admin)
  const hasPreviewBypass =
    req.cookies.get(PREVIEW_COOKIE_NAME)?.value === "1";

  // -----------------------------
  // 1) Modalità COMING SOON
  // -----------------------------
  if (COMING_SOON_ENABLED && !hasPreviewBypass) {
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

    const url = req.nextUrl.clone();

    // Se il path ha già una lingua supportata, la riuso
    if (SUPPORTED_LANGS.includes(first as any)) {
      url.pathname = `/${first}/coming-soon`;
    } else {
      // altrimenti deduco la lingua dall'header
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
  const segments = pathname.split("/");
  const first = segments[1];

  if (SUPPORTED_LANGS.includes(first as any)) {
    return NextResponse.next();
  }

  const lang = detectLangFromHeader(
    req.headers.get("accept-language")
  );

  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
