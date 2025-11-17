// i18n/loadMessages.ts
import it from '@/messages/it.json';
import en from '@/messages/en.json';
import es from '@/messages/es.json';

export function loadMessages(lang: 'it' | 'en' | 'es') {
  if (lang === 'en') return en as any;
  if (lang === 'es') return es as any;
  return it as any; // default sempre IT
}