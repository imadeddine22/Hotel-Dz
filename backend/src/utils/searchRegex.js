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
  const pattern = escapeRegex(String(value).trim()).replace(/[-\s]+/g, '[\\s-]+');
  return new RegExp(pattern, 'i');
};

/** Exact (anchored) case-insensitive match — for uniqueness checks. */
export const exactRegex = (value) => new RegExp(`^${escapeRegex(String(value).trim())}$`, 'i');
