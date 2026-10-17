// Language in the URL: French at the root (/hotels), Arabic and English prefixed (/ar/hotels,
// /en/hotels). Each language version is a separate, indexable URL with hreflang alternates.
// Shared by the middleware, server components and client components (no server-only imports).

export const LOCALES = ['fr', 'ar', 'en'];
export const DEFAULT_LOCALE = 'fr';
export const PREFIXED_LOCALES = ['ar', 'en'];

// Account / back-office areas are never indexed, so they keep a single unprefixed URL.
const UNPREFIXED = /^\/(admin|owner|seller|booking|my-bookings|favorites|profile|login|register|api|uploads|_next)(\/|$)/;

/** '/ar/hotels/1' → { lang: 'ar', path: '/hotels/1' };  '/hotels' → { lang: null, path: '/hotels' } */
export function splitLocale(pathname = '/') {
  const m = pathname.match(/^\/(ar|en)(?=\/|$)(.*)$/);
  if (!m) return { lang: null, path: pathname || '/' };
  return { lang: m[1], path: m[2] || '/' };
}

/** Should links to this path carry the language prefix? */
export const isLocalizable = (path) => typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') && !UNPREFIXED.test(path);

/** URL of `path` in `lang`: localePath('ar', '/hotels') → '/ar/hotels', localePath('fr', '/hotels') → '/hotels' */
export function localePath(lang, path = '/') {
  const clean = splitLocale(path).path;
  if (!PREFIXED_LOCALES.includes(lang) || !isLocalizable(clean)) return clean;
  return clean === '/' ? `/${lang}` : `/${lang}${clean}`;
}

/** hreflang map for a page path (Next.js metadata `alternates.languages` format). */
export const languageAlternates = (path) => ({
  fr: localePath('fr', path),
  ar: localePath('ar', path),
  en: localePath('en', path),
  'x-default': localePath('fr', path),
});

export const OG_LOCALE = { fr: 'fr_DZ', ar: 'ar_DZ', en: 'en_US' };
