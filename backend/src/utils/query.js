/**
 * Page and page size from the query string, always within bounds:
 * ?limit=0, negative or non-numeric values fall back to the default instead of returning every record.
 */
export const paging = (query = {}, { def = 12, max = 50 } = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(max, Math.max(1, parseInt(query.limit, 10) || def));
  return { page, limit, skip: (page - 1) * limit };
};

/** A finite number from a query value, or undefined (blank, "abc", arrays/objects from ?x[y]=…). */
export const num = (v) => {
  if (v === undefined || v === null || v === '' || typeof v === 'object') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

/** A plain string from a query value, or undefined (rejects ?x[$ne]=… objects and arrays). */
export const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
