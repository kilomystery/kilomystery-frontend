"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

type Lang = "it" | "en" | "es" | "fr" | "de";

const NewsletterModal = dynamic(() => import("./NewsletterModal"), {
  ssr: false,
});

function getLang(): Lang {
  if (typeof window === "undefined") return "it";

  const supported = ["it", "en", "es", "fr", "de"] as const;

  const saved = window.localStorage.getItem("km_lang");
  if (saved && (supported as readonly string[]).includes(saved)) {
    return saved as Lang;
  }

  const pathLang = window.location.pathname.split("/")[1];
  if ((supported as readonly string[]).includes(pathLang)) {
    return pathLang as Lang;
  }

  return "it";
}

export default function NewsletterModalDelayed() {
  const [mount, setMount] = useState(false);

  useEffect(() => {
    // ✅ evita che PSI lo consideri LCP: lo montiamo DOPO la stabilizzazione iniziale
    const timer = window.setTimeout(() => {
      // se c’è requestIdleCallback, ancora meglio
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(() => setMount(true), { timeout: 2000 });
      } else {
        setMount(true);
      }
    }, 6500); // 6.5s: abbastanza per non diventare LCP

    return () => window.clearTimeout(timer);
  }, []);

  if (!mount) return null;

  return <NewsletterModal lang={getLang()} />;
}
