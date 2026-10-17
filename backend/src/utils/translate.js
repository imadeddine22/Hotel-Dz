/**
 * Machine translation of user-entered content (listing names, descriptions, amenities).
 *
 * Provider: MyMemory (https://mymemory.translated.net) — free, no API key.
 *   - anonymous quota ≈ 5 000 chars/day; set MYMEMORY_EMAIL to raise it to ≈ 50 000 chars/day
 *   - TRANSLATION_PROVIDER=none disables translation (local dev, tests)
 * To switch provider later, replace `translateChunk` — callers only use translateText/translateFields.
 */
const PROVIDER = (process.env.TRANSLATION_PROVIDER || 'mymemory').toLowerCase();
const EMAIL = process.env.MYMEMORY_EMAIL || '';
const LANGS = ['fr', 'ar', 'en'];
const MAX_CHUNK_BYTES = 450; // MyMemory rejects queries over 500 bytes

export const translationEnabled = () => PROVIDER !== 'none';

// Common amenities: machine translation of a lone word lacks context ("Piscine" → «تجمع»,
// "Climatisation" → "air conditioning wire"), so known ones come from this glossary instead.
const GLOSSARY = [
  { fr: 'Piscine', ar: 'مسبح', en: 'Swimming pool' },
  { fr: 'Parking', ar: 'موقف سيارات', en: 'Parking' },
  { fr: 'Climatisation', ar: 'مكيّف هواء', en: 'Air conditioning' },
  { fr: 'Wifi', ar: 'واي فاي', en: 'Wi-Fi' },
  { fr: 'WiFi gratuit', ar: 'واي فاي مجاني', en: 'Free Wi-Fi' },
  { fr: 'Restaurant', ar: 'مطعم', en: 'Restaurant' },
  { fr: 'Spa', ar: 'سبا', en: 'Spa' },
  { fr: 'Jardin', ar: 'حديقة', en: 'Garden' },
  { fr: 'Cuisine', ar: 'مطبخ', en: 'Kitchen' },
  { fr: 'Cuisine équipée', ar: 'مطبخ مجهّز', en: 'Equipped kitchen' },
  { fr: 'Petit-déjeuner', ar: 'فطور الصباح', en: 'Breakfast' },
  { fr: 'Ascenseur', ar: 'مصعد', en: 'Elevator' },
  { fr: 'Garage', ar: 'مرآب', en: 'Garage' },
  { fr: 'Terrasse', ar: 'شرفة واسعة', en: 'Terrace' },
  { fr: 'Balcon', ar: 'شرفة', en: 'Balcony' },
  { fr: 'Vue mer', ar: 'إطلالة على البحر', en: 'Sea view' },
  { fr: 'Télévision', ar: 'تلفاز', en: 'TV' },
  { fr: 'TV', ar: 'تلفاز', en: 'TV' },
  { fr: 'Chauffage', ar: 'تدفئة', en: 'Heating' },
  { fr: 'Lave-linge', ar: 'غسالة ملابس', en: 'Washing machine' },
  { fr: 'Machine à laver', ar: 'غسالة ملابس', en: 'Washing machine' },
  { fr: 'Salle de sport', ar: 'قاعة رياضة', en: 'Gym' },
  { fr: 'Plage', ar: 'شاطئ', en: 'Beach' },
  { fr: 'Accès plage', ar: 'وصول إلى الشاطئ', en: 'Beach access' },
  { fr: 'Barbecue', ar: 'شواء', en: 'Barbecue' },
  { fr: 'BBQ', ar: 'شواء', en: 'BBQ' },
  { fr: 'Sécurité', ar: 'حراسة', en: 'Security' },
  { fr: 'Navette aéroport', ar: 'نقل من وإلى المطار', en: 'Airport shuttle' },
  { fr: 'Service en chambre', ar: 'خدمة الغرف', en: 'Room service' },
  { fr: 'Minibar', ar: 'ميني بار', en: 'Minibar' },
  { fr: 'Coffre-fort', ar: 'خزنة', en: 'Safe' },
  { fr: 'Bar', ar: 'بار', en: 'Bar' },
  { fr: 'Animaux acceptés', ar: 'الحيوانات الأليفة مقبولة', en: 'Pets allowed' },
  { fr: 'Accès handicapés', ar: 'مهيّأ لذوي الاحتياجات الخاصة', en: 'Wheelchair accessible' },
  { fr: 'Salle de réunion', ar: 'قاعة اجتماعات', en: 'Meeting room' },
  { fr: 'Réception 24h/24', ar: 'استقبال على مدار الساعة', en: '24-hour reception' },
  { fr: 'Blanchisserie', ar: 'خدمة غسيل', en: 'Laundry' },
  { fr: 'Hammam', ar: 'حمّام تقليدي', en: 'Hammam' },
  { fr: 'Meublé', ar: 'مفروش', en: 'Furnished' },
];
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[\s-]+/g, ' ').trim();
const GLOSSARY_INDEX = new Map();
for (const entry of GLOSSARY) {
  for (const l of LANGS) GLOSSARY_INDEX.set(`${l}:${norm(entry[l])}`, entry);
}
GLOSSARY_INDEX.set('fr:wi fi', GLOSSARY[3]);
GLOSSARY_INDEX.set('en:wifi', GLOSSARY[3]);
GLOSSARY_INDEX.set('fr:clim', GLOSSARY[2]);
GLOSSARY_INDEX.set('en:pool', GLOSSARY[0]);

let pausedUntil = 0; // set when the daily quota is exhausted
const cache = new Map(); // `${from}|${to}|${text}` → translation (amenities repeat a lot)

/** Guess the language an owner wrote in: Arabic script, else English vs French by common words. */
export function detectLang(text) {
  const s = String(text || '');
  if (/[؀-ۿ]/.test(s)) return 'ar';
  const words = s.toLowerCase().match(/[a-zà-ÿ']+/g) || [];
  const EN = new Set(['the', 'and', 'with', 'for', 'room', 'rooms', 'house', 'near', 'sea', 'view', 'of', 'is', 'in', 'beautiful', 'apartment', 'free']);
  const FR = new Set(['le', 'la', 'les', 'et', 'avec', 'pour', 'de', 'des', 'du', 'une', 'un', 'chambre', 'chambres', 'maison', 'vue', 'mer', 'est', 'à', 'au']);
  let en = 0, fr = 0;
  for (const w of words) { if (EN.has(w)) en++; if (FR.has(w)) fr++; }
  return en > fr ? 'en' : 'fr';
}

const bytes = (s) => Buffer.byteLength(s, 'utf8');

/** Split long text on sentence/line boundaries into chunks under the provider's size limit. */
function chunk(text) {
  const parts = text.split(/(?<=[.!?؟\n])\s+/);
  const out = [];
  let cur = '';
  for (const p of parts) {
    if (bytes(p) > MAX_CHUNK_BYTES) {
      if (cur) { out.push(cur); cur = ''; }
      // very long sentence: cut on words
      let buf = '';
      for (const w of p.split(' ')) {
        if (bytes(`${buf} ${w}`) > MAX_CHUNK_BYTES) { out.push(buf); buf = w; } else buf = buf ? `${buf} ${w}` : w;
      }
      if (buf) out.push(buf);
    } else if (bytes(`${cur} ${p}`) > MAX_CHUNK_BYTES) {
      out.push(cur);
      cur = p;
    } else cur = cur ? `${cur} ${p}` : p;
  }
  if (cur) out.push(cur);
  return out;
}

async function translateChunk(text, from, to) {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text);
  url.searchParams.set('langpair', `${from}|${to}`);
  if (EMAIL) url.searchParams.set('de', EMAIL);
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const data = await res.json().catch(() => ({}));
  const out = data?.responseData?.translatedText;
  const status = Number(data?.responseStatus);
  if (status === 429 || /MYMEMORY WARNING|QUOTA/i.test(out || '') || data?.quotaFinished) {
    pausedUntil = Date.now() + 6 * 60 * 60 * 1000; // try again in 6 h
    throw new Error('Translation quota exhausted');
  }
  if (status !== 200 || !out) throw new Error(`Translation failed (${status || res.status})`);
  return out;
}

/** Translate one text; returns null when translation is disabled, paused or failed. */
export async function translateText(text, from, to) {
  const src = String(text || '').trim();
  if (!src || from === to) return null;
  const known = GLOSSARY_INDEX.get(`${from}:${norm(src)}`);
  if (known) return known[to];
  if (!translationEnabled() || Date.now() < pausedUntil) return null;
  const key = `${from}|${to}|${src}`;
  if (cache.has(key)) return cache.get(key);
  try {
    const pieces = [];
    for (const c of chunk(src)) pieces.push(await translateChunk(c, from, to));
    const result = pieces.join(' ');
    if (cache.size > 5000) cache.clear();
    cache.set(key, result);
    return result;
  } catch (err) {
    console.warn(`[translate] ${from}→${to} failed: ${err.message}`);
    return null;
  }
}

/**
 * Translate a set of fields ({ name, description, amenities: [] }) into the other site languages.
 * Returns { sourceLang, translations: { ar: {...}, en: {...} } } — languages that failed are left out.
 */
export async function translateFields(fields) {
  const sample = [fields.name, fields.title, fields.description].filter(Boolean).join(' ');
  const sourceLang = detectLang(sample);
  const translations = {};
  for (const to of LANGS.filter((l) => l !== sourceLang)) {
    const tr = {};
    let ok = true;
    for (const [k, v] of Object.entries(fields)) {
      if (Array.isArray(v)) {
        const arr = [];
        for (const item of v) arr.push((await translateText(item, sourceLang, to)) ?? item);
        tr[k] = arr;
      } else if (v) {
        const t = await translateText(v, sourceLang, to);
        if (t === null) { ok = false; break; }
        tr[k] = t;
      }
    }
    if (ok) translations[to] = tr;
  }
  return { sourceLang, translations };
}
