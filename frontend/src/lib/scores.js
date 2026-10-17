// Review scores out of 10 (Booking.com style) and owner discounts ("deals").

export const SCORE_CATEGORIES = [
  ['cleanliness', 'Propreté'],
  ['location', 'Emplacement'],
  ['value', 'Rapport qualité/prix'],
  ['staff', 'Personnel'],
  ['comfort', 'Confort'],
];

/** Word for a score /10, as a French translation key: 9.4 → "Superbe". */
export function scoreWord(score, count = 1) {
  if (!count || !score) return 'Nouveau';
  if (score >= 9.5) return 'Exceptionnel';
  if (score >= 9) return 'Superbe';
  if (score >= 8) return 'Très bien';
  if (score >= 7) return 'Bien';
  if (score >= 6) return 'Agréable';
  return 'Note';
}

/** Is a discount running today (end day included)? Mirrors backend/src/utils/pricing.js */
export function discountActive(doc, at = new Date()) {
  if (!doc?.discountPercent) return false;
  if (!doc.discountUntil) return true;
  const end = new Date(doc.discountUntil);
  end.setHours(23, 59, 59, 999);
  return end >= at;
}

/** { price, original, discountPercent } after the running discount. */
export function effectivePrice(doc) {
  const original = Number(doc?.pricePerNight) || 0;
  if (!discountActive(doc)) return { price: original, original, discountPercent: 0 };
  return { price: Math.round(original * (1 - doc.discountPercent / 100)), original, discountPercent: doc.discountPercent };
}
