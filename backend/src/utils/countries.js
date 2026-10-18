// Countries Meskan covers. A listing's `wilaya` field holds the region of its country
// (Algerian wilaya, Tunisian governorate, Moroccan city); its currency follows the country.
// Keep in sync with frontend/src/lib/countries.js.
import { WILAYAS } from './wilayas.js';

const norm = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[\s'’-]+/g, ' ')
    .trim();

export const COUNTRIES = {
  DZ: {
    code: 'DZ',
    name: 'Algérie',
    arabic: 'الجزائر',
    english: 'Algeria',
    currency: 'DZD',
    regions: WILAYAS.map(({ name, arabic, ascii }) => ({ name, arabic, ascii })),
  },
  TN: {
    code: 'TN',
    name: 'Tunisie',
    arabic: 'تونس',
    english: 'Tunisia',
    currency: 'TND',
    // 24 governorates
    regions: [
      ['Tunis', 'تونس'], ['Ariana', 'أريانة'], ['Ben Arous', 'بن عروس'], ['Manouba', 'منوبة'],
      ['Nabeul', 'نابل'], ['Zaghouan', 'زغوان'], ['Bizerte', 'بنزرت'], ['Béja', 'باجة'],
      ['Jendouba', 'جندوبة'], ['Le Kef', 'الكاف'], ['Siliana', 'سليانة'], ['Sousse', 'سوسة'],
      ['Monastir', 'المنستير'], ['Mahdia', 'المهدية'], ['Sfax', 'صفاقس'], ['Kairouan', 'القيروان'],
      ['Kasserine', 'القصرين'], ['Sidi Bouzid', 'سيدي بوزيد'], ['Gabès', 'قابس'], ['Médenine', 'مدنين'],
      ['Tataouine', 'تطاوين'], ['Gafsa', 'قفصة'], ['Tozeur', 'توزر'], ['Kébili', 'قبلي'],
    ].map(([name, arabic]) => ({ name, arabic, ascii: norm(name) })),
  },
  MA: {
    code: 'MA',
    name: 'Maroc',
    arabic: 'المغرب',
    english: 'Morocco',
    currency: 'MAD',
    // Main cities (not administrative regions)
    regions: [
      ['Casablanca', 'الدار البيضاء'], ['Rabat', 'الرباط'], ['Marrakech', 'مراكش'], ['Fès', 'فاس'],
      ['Tanger', 'طنجة'], ['Agadir', 'أكادير'], ['Meknès', 'مكناس'], ['Oujda', 'وجدة'],
      ['Tétouan', 'تطوان'], ['Essaouira', 'الصويرة'], ['Chefchaouen', 'شفشاون'], ['Ouarzazate', 'ورزازات'],
      ['El Jadida', 'الجديدة'], ['Kénitra', 'القنيطرة'], ['Nador', 'الناظور'], ['Ifrane', 'إفران'],
      ['Al Hoceïma', 'الحسيمة'], ['Safi', 'آسفي'], ['Errachidia', 'الرشيدية'], ['Béni Mellal', 'بني ملال'],
    ].map(([name, arabic]) => ({ name, arabic, ascii: norm(name) })),
  },
};

export const COUNTRY_CODES = Object.keys(COUNTRIES);
// Countries open to listings and searches. Meskan focuses on Algeria for now; Tunisia and
// Morocco are ready and can be opened with ENABLED_COUNTRIES=DZ,TN,MA (and the same list in
// NEXT_PUBLIC_ENABLED_COUNTRIES on the frontend).
export const ENABLED_COUNTRIES = (process.env.ENABLED_COUNTRIES || 'DZ')
  .split(',')
  .map((c) => c.trim().toUpperCase())
  .filter((c) => COUNTRY_CODES.includes(c));
export const DEFAULT_COUNTRY = 'DZ';
export const CURRENCIES = [...new Set(Object.values(COUNTRIES).map((c) => c.currency))];

export const isCountry = (code) => ENABLED_COUNTRIES.includes(code);
export const currencyOf = (code) => COUNTRIES[code]?.currency || COUNTRIES[DEFAULT_COUNTRY].currency;

/** Official spelling of a region of `country` (accent/case-insensitive, French or Arabic), or null. */
export function findRegion(country, value) {
  const c = COUNTRIES[country];
  if (!c || !value) return null;
  const n = norm(value);
  const r = c.regions.find((x) => norm(x.name) === n || norm(x.ascii) === n || x.arabic === String(value).trim());
  return r ? r.name : null;
}
