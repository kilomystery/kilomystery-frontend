'use client';
import { useState } from 'react';

type Lang = 'it' | 'en' | 'es' | 'fr' | 'de';

function Flag({ code }: { code: Lang }) {
  if (code === 'it')
    return (<svg width="16" height="12" viewBox="0 0 3 2"><rect width="1" height="2" x="0" fill="#009246"/><rect width="1" height="2" x="1" fill="#fff"/><rect width="1" height="2" x="2" fill="#ce2b37"/></svg>);
  if (code === 'fr')
    return (<svg width="16" height="12" viewBox="0 0 3 2"><rect width="1" height="2" x="0" fill="#0055a4"/><rect width="1" height="2" x="1" fill="#fff"/><rect width="1" height="2" x="2" fill="#ef4135"/></svg>);
  if (code === 'de')
    return (<svg width="16" height="12" viewBox="0 0 5 3"><rect width="5" height="1" y="0" fill="#000"/><rect width="5" height="1" y="1" fill="#dd0000"/><rect width="5" height="1" y="2" fill="#ffce00"/></svg>);
  if (code === 'es')
    return (<svg width="16" height="12" viewBox="0 0 3 2"><rect width="3" height="2" fill="#c60b1e"/><rect width="3" height="1" y="0.5" fill="#ffc400"/></svg>);
  // en (UK stilizzato)
  return (
    <svg width="16" height="12" viewBox="0 0 60 36">
      <rect width="60" height="36" fill="#012169" />
      <path d="M0,0 L60,36 M60,0 L0,36" stroke="#fff" strokeWidth="8" />
      <path d="M0,0 L60,36 M60,0 L0,36" stroke="#C8102E" strokeWidth="4" />
      <rect x="24" width="12" height="36" fill="#fff" />
      <rect y="12" width="60" height="12" fill="#fff" />
      <rect x="26" width="8" height="36" fill="#C8102E" />
      <rect y="14" width="60" height="8" fill="#C8102E" />
    </svg>
  );
}

export default function LangSwitcher({ current }: { current: Lang }) {
  const [open, setOpen] = useState(false);
  const langs: Lang[] = ['it', 'en', 'es', 'fr', 'de'];

  function go(next: Lang) {
    setOpen(false); // chiudi il menu prima di navigare
    const parts = window.location.pathname.split('/').filter(Boolean);
    parts[0] = next;
    window.location.assign('/' + parts.join('/'));
  }

  return (
    <div className="dropdown">
      <button
        className="lang-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Flag code={current} />
        <span className="uppercase">{current}</span>
        <svg className="h-4 w-4 opacity-70" viewBox="0 0 20 20"><path fill="currentColor" d="M5.5 7l4.5 5 4.5-5z"/></svg>
      </button>

      <div className={`dropdown-menu right ${open ? 'open' : ''}`} role="menu">
        {langs.map((l) => (
          <button key={l} className="dropdown-item flex items-center gap-2" onClick={() => go(l)}>
            <Flag code={l} /><span className="uppercase">{l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}