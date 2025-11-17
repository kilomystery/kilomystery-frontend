'use client';

import { useEffect } from 'react';

function toSafeString(v: any, seen = new WeakSet()): string {
  try {
    if (v == null) return String(v);
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (typeof v === 'function') return `[Function ${v.name || 'anonymous'}]`;
    if (typeof Element !== 'undefined' && v instanceof Element) return `[HTMLElement <${v.tagName?.toLowerCase()}>]`;
    if ((v as any)?.nativeEvent) return `[SyntheticEvent]`;
    if (typeof v === 'object') {
      if (seen.has(v)) return '[Circular]';
      seen.add(v);
      return JSON.stringify(v, (k, val) => {
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) return '[Circular]';
          seen.add(val);
          if (typeof Element !== 'undefined' && val instanceof Element) return `[HTMLElement <${val.tagName?.toLowerCase()}>]`;
          if ((val as any)?.nativeEvent) return '[SyntheticEvent]';
        }
        if (typeof val === 'function') return `[Function ${val.name || 'anonymous'}]`;
        return val;
      });
    }
    return String(v);
  } catch {
    return '[Unserializable]';
  }
}

export default function DevConsoleGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return; // solo in dev/preview

    const c = window.console;
    const orig = { log: c.log, warn: c.warn, error: c.error, dir: c.dir };

    const wrap = (fn: (...args: any[]) => void) => (...args: any[]) => {
      try {
        fn.call(c, args.map(a => toSafeString(a)).join(' '));
      } catch {
        fn.call(c, '[log failed]');
      }
    };

    c.log = wrap(orig.log);
    c.warn = wrap(orig.warn);
    c.error = wrap(orig.error);
    c.dir = wrap(orig.dir);

    return () => {
      c.log = orig.log;
      c.warn = orig.warn;
      c.error = orig.error;
      c.dir = orig.dir;
    };
  }, []);

  return null;
}