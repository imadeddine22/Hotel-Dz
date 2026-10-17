import { COUNTRIES, ENABLED_COUNTRIES } from './countries.js';
/**
 * Helpers for building safe case-insensitive RegExp filters from query strings.
 *
 * Raw user input must never be passed straight to `new RegExp()`: characters
 * like `(` or a trailing `\` throw a SyntaxError (surfacing as a 500), and
 * metacharacters otherwise change the meaning of the search.
 */

/** Escape every RegExp metacharacter in a string. */
export const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Case-insensitive "contains" matcher for a free-text field.
 * Returns undefined for empty input so callers can skip the filter.
 */
export const searchRegex = (value) => {
  if (value === undefined || value === null || String(value).trim() === '') return undefined;
  return new RegExp(escapeRegex(String(value).trim()), 'i');
};

/**
 * Matcher for wilaya names, which reach us either as a plain name
 * ("Tizi Ouzou") or as a URL slug ("Tizi-Ouzou"). Spaces and hyphens are
 * treated as interchangeable so both forms match the stored value.
 *
 * Kept unanchored to preserve the original filter semantics.
 */
export const wilayaRegex = (value) => {
  if (value === undefined || value === null || String(value).trim() === '') return undefined;
  const pattern = escapeRegex(stripAccents(String(value).trim()))
    .replace(/[-\s]+/g, '[\\s-]+')
    .replace(/['’]/g, "['’]?")
    .replace(/[aeiouycn]/gi, (ch) => ACCENT_CLASS[ch.toLowerCase()]);
  return new RegExp(pattern, 'i');
};

// "Bejaia", "béjaïa" and "Béjaïa" must all match the stored "Béjaïa".
const ACCENT_CLASS = {
  a: '[aàâäáã]', e: '[eéèêë]', i: '[iîïí]', o: '[oôöó]', u: '[uùûüú]', y: '[yÿ]', c: '[cç]', n: '[nñ]',
};
const stripAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Exact (anchored) case-insensitive match — for uniqueness checks. */
export const exactRegex = (value) => new RegExp(`^${escapeRegex(String(value).trim())}$`, 'i');

/**
 * "Where?" search from the home page: the text may be a wilaya ("Béjaïa") or a
 * commune/city ("Tichy", "Hydra"), so match either field, accent-insensitively.
 */
export const placeFilter = (value) => {
  // A country name ("Tunisie", "تونس", "Morocco") means every listing of that country
  const key = stripAccents(String(value || '').trim()).toLowerCase();
  const country = Object.values(COUNTRIES).filter((c) => ENABLED_COUNTRIES.includes(c.code)).find((c) =>
    [c.name, c.english, c.code].some((n) => stripAccents(n).toLowerCase() === key) || c.arabic === String(value || '').trim()
  );
  if (country) return { country: country.code };
  const rx = wilayaRegex(value);
  return rx ? { $or: [{ wilaya: rx }, { city: rx }] } : undefined;
};
