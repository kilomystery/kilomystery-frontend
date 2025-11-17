'use client';
import Link from 'next/link';

const langs: Array<{ code: 'it' | 'en' | 'es'; label: string }> = [
  { code: 'it', label: 'IT' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

export function LanguageSwitcher({ current }: { current: 'it' | 'en' | 'es' }) {
  return (
    <div className="inline-flex bg-white/5 border border-white/10 rounded-xl p-1">
      {langs.map((l) => (
        <Link
          key={l.code}
          href={`/${l.code}`}
          className={`px-3 py-2 rounded-lg text-sm ${
            current === l.code ? 'bg-white text-black font-bold' : 'text-slate-200'
          }`}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}