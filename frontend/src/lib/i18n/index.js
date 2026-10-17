// UI translation for fr (source language), ar and en.
//
// Keys are the French source text itself: t('Mes réservations'). A missing entry falls back
// to the key, so an untranslated string shows in French rather than breaking the page.
// Some French screens still contain English copy; fr.json translates those keys to French.
import ar from './ar.json';
import en from './en.json';
import fr from './fr.json';
import { WILAYA_LIST } from '../wilayas';

export { translateMessage } from './messages';

export const LANGS = ['fr', 'ar', 'en'];
export const DEFAULT_LANG = 'fr';

// Wilaya names are data, not copy: derive their Arabic translation from the official list.
const WILAYA_AR = Object.fromEntries(WILAYA_LIST.map((w) => [w.name, w.arabic]));

const DICTS = { fr, ar: { ...WILAYA_AR, ...ar }, en };

/** Replace {name} placeholders with values. */
const fill = (text, vars) =>
  vars ? text.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m)) : text;

export function translate(lang, key, vars) {
  if (key === undefined || key === null || key === '') return key ?? '';
  if (typeof key !== 'string') return key; // numbers, elements: leave untouched
  const dict = DICTS[lang] || DICTS.fr;
  return fill(dict[key] ?? key, vars);
}

export const isRtl = (lang) => lang === 'ar';
