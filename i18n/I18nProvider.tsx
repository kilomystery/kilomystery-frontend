'use client';

import React, { createContext, useContext, useMemo } from 'react';

type Dict = Record<string, string | Record<string, any>>;
type Ctx = { lang: 'it' | 'en' | 'es'; t: (key: string) => string };

export const I18nCtx = createContext<Ctx>({
  lang: 'it',
  t: (k) => k,
});

export function I18nProvider({
  lang,
  messages,
  children,
}: {
  lang: 'it' | 'en' | 'es';
  messages: Dict | undefined | null;
  children: React.ReactNode;
}) {
  const t = useMemo(() => {
    const flat: Record<string, string> = {};
    const safe = (messages ?? {}) as Dict;

    function walk(prefix: string, obj: any) {
      if (!obj || typeof obj !== 'object') return;
      for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (typeof v === 'string') flat[key] = v;
        else walk(key, v);
      }
    }
    walk('', safe);

    return (key: string) => flat[key] ?? key;
  }, [messages, lang]);

  return (
    <I18nCtx.Provider value={{ lang, t }}>
      {children}
    </I18nCtx.Provider>
  );
}

export function useI18n() {
  return useContext(I18nCtx);
}
