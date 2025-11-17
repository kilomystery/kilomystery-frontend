'use client';
import { useEffect, useRef, useState } from 'react';

export default function NavMenu({ lang }: { lang: 'it'|'en'|'es'|'fr'|'de' }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Chiudi al click fuori
  useEffect(() => {
    function onClick(e: MouseEvent){
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [open]);

  return (
    <>
      {/* Desktop */}
      <nav className="justify-self-center hidden md:flex items-center gap-2">
        <div className="dropdown">
          <button className="nav-btn">Shop</button>
          <div className="dropdown-menu">
            <a href={`/${lang}#shop`} className="dropdown-item">Prodotti</a>
            <a href={`/${lang}#how`} className="dropdown-item">Come funziona</a>
          </div>
        </div>
        <a className="nav-btn" href={`/${lang}#faq`}>FAQ</a>
        <div className="dropdown">
          <button className="nav-btn">Chi siamo</button>
          <div className="dropdown-menu">
            <a href={`/${lang}/about`} className="dropdown-item">La nostra storia</a>
            <a href={`/${lang}/policy/terms`} className="dropdown-item">Termini & Condizioni</a>
            <a href={`/${lang}/policy/returns`} className="dropdown-item">Resi</a>
            <a href={`/${lang}/policy/privacy`} className="dropdown-item">Privacy</a>
          </div>
        </div>
      </nav>

      {/* Mobile */}
      <div className="md:hidden justify-self-end relative">
        <button className="nav-btn" onClick={() => setOpen(o => !o)} aria-expanded={open}>
          ☰ Menu
        </button>

        {/* Overlay per intercettare i click e chiudere */}
        {open && <div className="fixed inset-0 z-[9998]" />}

        {open && (
          <div
            ref={panelRef}
            className="fixed right-3 top-16 z-[9999] w-56 bg-[#0f1216] border border-white/10 rounded-xl p-2 shadow-xl"
          >
            <a href={`/${lang}#shop`} className="dropdown-item block">Prodotti</a>
            <a href={`/${lang}#how`} className="dropdown-item block">Come funziona</a>
            <a href={`/${lang}#faq`} className="dropdown-item block">FAQ</a>
            <div className="my-2 border-t border-white/10" />
            <a href={`/${lang}/about`} className="dropdown-item block">Chi siamo</a>
            <a href={`/${lang}/policy/terms`} className="dropdown-item block">Termini & Condizioni</a>
            <a href={`/${lang}/policy/returns`} className="dropdown-item block">Resi</a>
            <a href={`/${lang}/policy/privacy`} className="dropdown-item block">Privacy</a>
          </div>
        )}
      </div>
    </>
  );
}