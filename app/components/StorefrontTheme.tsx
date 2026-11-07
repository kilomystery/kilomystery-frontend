'use client';

import { usePathname } from 'next/navigation';

// Scope the public storefront design away from the operational Poporama tools.
export default function StorefrontTheme({ children, className, lang }: { children: React.ReactNode; className: string; lang: string }) {
  const pathname = usePathname() || `/${lang}`;
  const section = pathname.split('/')[2] || 'home';
  const internal = section.startsWith('poporama') || section === 'labels';
  return <div className={`${className}${internal ? '' : ' km-storefront'}`} data-lang-layout="1" data-lang={lang} data-storefront-page={section}>{children}</div>;
}
