// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SUPPORTED_LANGS, detectLangFromHeader } from "./i18n/lang";

const PUBLIC_FILE = /\.(.*)$/;

// 🔒 PER ORA: Coming Soon sempre attiva
// Quando vorrai spegnerla, puoi rimettere la versione con process.env:
// const COMING_SOON_ENABLED = process.env.NEXT_PUBLIC_COMING_SOON === "true";
const COMING_SOON_ENABLED = true;

// Cookie per bypassare la Coming Soon (solo per te/admin)
const PREVIEW_COOKIE_NAME = "km_preview";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // -----------------------------------
  // 0) Gestione bypass: ?km_preview=1
  //    Esempio: /it?km_preview=1
  // -----------------------------------
  if (req.nextUrl.searchParams.get("km_preview") === "1") {
    const cleanUrl = req.nextUrl.clone();
    cleanUrl.searchParams.delete("km_preview");

    const res = NextResponse.redirect(cleanUrl);
    res.cookies.set(PREVIEW_COOKIE_NAME, "1", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });

    return res;
  }

  // 1) Escludiamo file statici, API, preview, ecc.
  if (
    pathname.startsWith("/api") || // API sempre raggiungibili
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/preview") || // eventuali route /preview
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Controllo cookie di preview (per te/admin)
  const hasPreviewBypass =
    req.cookies.get(PREVIEW_COOKIE_NAME)?.value === "1";

  // -----------------------------
  // 2) Modalità COMING SOON
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

    // Tutto il resto viene riscritto su /{lang}/coming-soon
    const url = req.nextUrl.clone();

    if (SUPPORTED_LANGS.includes(first as any)) {
      // Path con lingua già presente: /it/... → /it/coming-soon
      url.pathname = `/${first}/coming-soon`;
    } else {
      // Nessuna lingua nel path → deduco dal browser
      const lang = detectLangFromHeader(
        req.headers.get("accept-language")
      );
      url.pathname = `/${lang}/coming-soon`;
    }

    return NextResponse.rewrite(url);
  }

  // -----------------------------
  // 3) Routing i18n "normale"
  // -----------------------------
  const segments = pathname.split("/");
  const first = segments[1];

  // Se l'URL ha già una lingua supportata come primo segmento
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
