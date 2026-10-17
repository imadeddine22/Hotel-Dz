// Arabic names of places (69 wilayas + 1541 communes, official list), used when the site is in
// Arabic: t('Hydra') → «حيدرة», t('Alger Centre, Alger') → «الجزائر الوسطى، الجزائر».
// Names are matched loosely (case, accents, dashes), so "Bejaia", "Béjaïa" and "BEJAIA" all match.
// Wilayas are always available; communes (≈50 KB) load on demand, only for Arabic visitors.
import { WILAYA_LIST } from '../wilayas';

export const normPlace = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[\s'’`-]+/g, ' ')
    .trim();

// Wilayas win over communes of the same name (e.g. the commune "Alger Centre" vs wilaya "Alger")
const index = new Map();
const addPlace = (name, arabic, overwrite) => {
  const k = normPlace(name);
  if (k && arabic && (overwrite || !index.has(k))) index.set(k, arabic);
};
for (const w of WILAYA_LIST) {
  addPlace(w.name, w.arabic, true);
  addPlace(w.ascii, w.arabic, true);
}

let loading = null;
/** Loads the commune names once; resolves when they are available. */
export function loadCommuneNames() {
  return (loading ||= import('../communes.json').then((m) => {
    const all = m.default || m;
    for (const list of Object.values(all)) for (const [name, arabic] of list) addPlace(name, arabic, false);
  }));
}

/** Arabic name of a place, or undefined if unknown. Handles "Commune, Wilaya" pairs. */
export function placeArabic(text) {
  if (typeof text !== 'string' || text.length > 80) return undefined;
  const direct = index.get(normPlace(text));
  if (direct) return direct;
  if (!text.includes(',')) return undefined;
  const parts = text.split(',').map((p) => index.get(normPlace(p)));
  return parts.every(Boolean) ? parts.join('، ') : undefined;
}
