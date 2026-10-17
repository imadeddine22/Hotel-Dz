// Server-side language helpers: the language of the current request (set by the middleware from
// the URL prefix) and localized page metadata with canonical + hreflang alternates.
import { headers } from 'next/headers';
import { translate } from './index';
import { DEFAULT_LOCALE, LOCALES, languageAlternates, localePath, OG_LOCALE } from './locale';

/** 'fr' | 'ar' | 'en' for the current request. */
export function getLang() {
  const lang = headers().get('x-lang');
  return LOCALES.includes(lang) ? lang : DEFAULT_LOCALE;
}

/** Language from the URL, or null on private pages (which have no language versions). */
export function getUrlLang() {
  const lang = headers().get('x-lang');
  return LOCALES.includes(lang) ? lang : null;
}

/** t() for server components and metadata, in the request's language. */
export function getT() {
  const lang = getLang();
  return { lang, t: (key, vars) => translate(lang, key, vars) };
}

/**
 * Metadata for an indexable page, in the request's language.
 * `title` / `description` are French source strings (translation keys) with optional {vars};
 * `path` is the French (unprefixed) path of the page.
 *   pageMeta({ path: '/hotels', title: 'Hôtels en Algérie', description: '…' })
 */
export function pageMeta({ path, title, description, vars, titleVars, descriptionVars, openGraph, ...rest }) {
  const lang = getLang();
  const tTitle = title && translate(lang, title, titleVars || vars);
  const tDesc = description && translate(lang, description, descriptionVars || vars);
  const url = localePath(lang, path);
  // "… | Meskan dz" (« … | مسكن ») set here: a sub-layout's plain title would stop the root template
  const brand = translate(lang, 'Meskan dz');
  const fullTitle = tTitle && (tTitle.includes(brand) ? tTitle : `${tTitle} | ${brand}`);
  return {
    ...(tTitle && { title: { absolute: fullTitle } }),
    ...(tDesc && { description: tDesc }),
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      ...(tTitle && { title: tTitle }),
      ...(tDesc && { description: tDesc }),
      url,
      locale: OG_LOCALE[lang],
      alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
      ...openGraph,
    },
    ...rest,
  };
}
