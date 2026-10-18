// Owner discounts on rooms and houses ("deals"): a percentage, optionally until a date.

/** Adds `discountPercent` / `discountUntil` to a priced schema (Room, House). */
export function discountPlugin(schema) {
  schema.add({
    discountPercent: { type: Number, default: 0, min: 0, max: 90 },
    discountUntil: { type: Date, default: null }, // null = no end date
  });
}

/** Is the discount running on `at` (inclusive of the end day)? */
export function discountActive(doc, at = new Date()) {
  if (!doc?.discountPercent) return false;
  if (!doc.discountUntil) return true;
  const end = new Date(doc.discountUntil);
  end.setHours(23, 59, 59, 999);
  return end >= at;
}

/** Nightly price after the running discount: { price, original, discountPercent }. */
export function effectivePrice(doc, at = new Date()) {
  const original = Number(doc?.pricePerNight) || 0;
  if (!discountActive(doc, at)) return { price: original, original, discountPercent: 0 };
  const pct = doc.discountPercent;
  return { price: Math.round(original * (1 - pct / 100)), original, discountPercent: pct };
}

/** Discount fields from a request body (form data sends strings); undefined when absent. */
export function parseDiscount(body) {
  const out = {};
  if (body.discountPercent !== undefined && body.discountPercent !== '') {
    const p = Math.round(Number(body.discountPercent));
    if (Number.isFinite(p) && p >= 0 && p <= 90) out.discountPercent = p;
  }
  if (body.discountUntil !== undefined) {
    const d = body.discountUntil ? new Date(body.discountUntil) : null;
    if (d === null || !isNaN(d)) out.discountUntil = d;
  }
  return out;
}
