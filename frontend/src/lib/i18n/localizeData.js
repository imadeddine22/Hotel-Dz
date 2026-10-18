// Listings carry machine translations (`translations: { ar: { name, description, … }, en: … }`,
// filled by the backend). Swap them in for the visitor's language, keeping the original in
// `_original`. Used by the API client (browser) and by server layouts (/ar, /en pages).

export const LOCALIZED_FIELDS = ['name', 'title', 'description', 'amenities', 'comment'];

/** Mutates `node` in place. */
export function localize(node, lang, depth = 0) {
  if (!node || typeof node !== 'object' || depth > 6) return;
  if (Array.isArray(node)) return node.forEach((n) => localize(n, lang, depth + 1));
  const tr = node.translations?.[lang];
  if (tr && node.sourceLang !== lang) {
    node._original = {};
    for (const f of LOCALIZED_FIELDS) {
      if (tr[f] !== undefined && tr[f] !== null && tr[f] !== '') {
        node._original[f] = node[f];
        node[f] = tr[f];
      }
    }
  }
  for (const v of Object.values(node)) if (v && typeof v === 'object') localize(v, lang, depth + 1);
}

/** Localized copy (leaves `data` untouched). */
export function localized(data, lang) {
  if (!data || typeof data !== 'object') return data;
  const copy = structuredClone(data);
  localize(copy, lang);
  return copy;
}
