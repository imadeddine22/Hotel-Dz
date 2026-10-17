'use client';

import { createContext, useContext } from 'react';

/**
 * Language of the URL (/ar/… → 'ar', /en/… → 'en', French root → 'fr'), provided by the root
 * layout from the request. useT() renders in it on the server and on the first client render,
 * so prefixed pages come out of the server already translated (and indexable as such).
 * `null` on unprefixed private pages, where the visitor's saved choice applies instead.
 */
const Ctx = createContext(null);

export function UrlLangProvider({ lang, children }) {
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
}

export const useUrlLang = () => useContext(Ctx);
