"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    ttq?: any;
    __tiktokConsentGranted?: boolean;
  }
}

export default function TikTokPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!window.__tiktokConsentGranted) return;
    window.ttq?.page();
  }, [pathname, searchParams]);

  return null;
}
