'use client';

import { useEffect } from 'react';
import CookieBanner from './CookieBanner';
import NewsletterModal from './NewsletterModal';

export default function ClientShell({ lang = 'it' as const }) {
  // Evita di mostrare il modal ai bot e nei primi istanti se c'è navigazione istantanea
  useEffect(() => {
    // niente qui per ora, ma manteniamo lo useEffect per future guardie
  }, []);

  return (
    <>
      {/* Banner GDPR */}
      <CookieBanner />

      {/* Popup newsletter (usa localStorage per non riproporlo) */}
      <NewsletterModal lang={lang} />
    </>
  );
}