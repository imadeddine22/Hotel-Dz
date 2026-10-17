// Names of places (69 wilayas + 1541 communes, official list) in the visitor's language:
//   ar:    t('Hydra') → «حيدرة», t('Alger Centre, Alger') → «الجزائر الوسطى، الجزائر»
//   fr/en: t('حيدرة') → "Hydra" (e.g. a commune an owner typed in Arabic)
// Names are matched loosely (case, accents, dashes; hamza/taa marbuta/tatweel in Arabic), so
// "Bejaia", "Béjaïa" and «بجاية» all match. Wilayas are always available; communes (≈50 KB) load
// on demand, the first time a place name is looked up and not found.
import { WILAYA_LIST } from '../wilayas';
import { COUNTRIES } from '../countries';

const ARABIC = /[؀-ۿ]/;

export const normPlace = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Latin accents
    .replace(/[ً-ٰٟـ]/g, '') // Arabic diacritics + tatweel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .replace(/[\s'’`-]+/g, ' ')
    .trim();

// Wilayas win over communes of the same name
const toArabic = new Map();
const toLatin = new Map();
const addPlace = (latin, arabic, overwrite) => {
  if (!latin || !arabic) return;
  const kl = normPlace(latin);
  const ka = normPlace(arabic);
  if (overwrite || !toArabic.has(kl)) toArabic.set(kl, arabic);
  if (overwrite || !toLatin.has(ka)) toLatin.set(ka, latin);
};
for (const w of WILAYA_LIST) {
  addPlace(w.ascii, w.arabic, true);
  addPlace(w.name, w.arabic, true); // official French spelling ("Béjaïa") wins for display
}
// Tunisian governorates, Moroccan cities, and the country names themselves
for (const c of Object.values(COUNTRIES)) {
  if (c.code !== 'DZ') for (const r of c.regions) addPlace(r.name, r.arabic, false);
  addPlace(c.name, c.arabic, false); // «الجزائر» stays the wilaya Alger, «تونس» the governorate Tunis
}

let loading = null;
let loaded = false;
const listeners = new Set();
/** Called once the commune names are available (so translated text can re-render). */
export const onPlacesLoaded = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
export const placesLoaded = () => loaded;

export function loadCommuneNames() {
  return (loading ||= import('../communes.json').then((m) => {
    const all = m.default || m;
    for (const list of Object.values(all)) for (const [name, arabic] of list) addPlace(name, arabic, false);
    loaded = true;
    listeners.forEach((cb) => cb());
  }));
}

function lookup(map, text) {
  const direct = map.get(normPlace(text));
  if (direct) return direct;
  if (!/[,،]/.test(text)) return undefined;
  const parts = text.split(/[,،]/).map((p) => map.get(normPlace(p)));
  return parts.every(Boolean) ? parts : undefined;
}

/** Name of a place in `lang`, or undefined if `text` is not a known place (or already in that script). */
export function placeName(lang, text) {
  if (typeof text !== 'string' || !text.trim() || text.length > 80) return undefined;
  const isArabic = ARABIC.test(text);
  if ((lang === 'ar') === isArabic) return undefined; // already in the right script
  const found = lookup(isArabic ? toLatin : toArabic, text);
  if (!found && !loaded) loadCommuneNames(); // maybe a commune: fetch the list, listeners re-render
  if (!found) return undefined;
  return Array.isArray(found) ? found.join(lang === 'ar' ? '، ' : ', ') : found;
}
