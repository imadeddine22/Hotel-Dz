// Countries Meskan dz covers. A listing's `wilaya` field holds the region of its country
// (Algerian wilaya, Tunisian governorate, Moroccan city); its currency follows the country.
// Keep in sync with backend/src/utils/countries.js.
import { WILAYA_LIST } from './wilayas';

const list = (pairs) => pairs.map(([name, arabic]) => ({ name, arabic }));

export const COUNTRIES = {
  DZ: {
    code: 'DZ',
    name: 'Algérie',
    arabic: 'الجزائر',
    english: 'Algeria',
    currency: 'DZD',
    regionLabel: 'Wilaya',
    regions: WILAYA_LIST.map(({ name, arabic }) => ({ name, arabic })),
  },
  TN: {
    code: 'TN',
    name: 'Tunisie',
    arabic: 'تونس',
    english: 'Tunisia',
    currency: 'TND',
    regionLabel: 'Gouvernorat',
    regions: list([
      ['Tunis', 'تونس'], ['Ariana', 'أريانة'], ['Ben Arous', 'بن عروس'], ['Manouba', 'منوبة'],
      ['Nabeul', 'نابل'], ['Zaghouan', 'زغوان'], ['Bizerte', 'بنزرت'], ['Béja', 'باجة'],
      ['Jendouba', 'جندوبة'], ['Le Kef', 'الكاف'], ['Siliana', 'سليانة'], ['Sousse', 'سوسة'],
      ['Monastir', 'المنستير'], ['Mahdia', 'المهدية'], ['Sfax', 'صفاقس'], ['Kairouan', 'القيروان'],
      ['Kasserine', 'القصرين'], ['Sidi Bouzid', 'سيدي بوزيد'], ['Gabès', 'قابس'], ['Médenine', 'مدنين'],
      ['Tataouine', 'تطاوين'], ['Gafsa', 'قفصة'], ['Tozeur', 'توزر'], ['Kébili', 'قبلي'],
    ]),
  },
  MA: {
    code: 'MA',
    name: 'Maroc',
    arabic: 'المغرب',
    english: 'Morocco',
    currency: 'MAD',
    regionLabel: 'Ville',
    regions: list([
      ['Casablanca', 'الدار البيضاء'], ['Rabat', 'الرباط'], ['Marrakech', 'مراكش'], ['Fès', 'فاس'],
      ['Tanger', 'طنجة'], ['Agadir', 'أكادير'], ['Meknès', 'مكناس'], ['Oujda', 'وجدة'],
      ['Tétouan', 'تطوان'], ['Essaouira', 'الصويرة'], ['Chefchaouen', 'شفشاون'], ['Ouarzazate', 'ورزازات'],
      ['El Jadida', 'الجديدة'], ['Kénitra', 'القنيطرة'], ['Nador', 'الناظور'], ['Ifrane', 'إفران'],
      ['Al Hoceïma', 'الحسيمة'], ['Safi', 'آسفي'], ['Errachidia', 'الرشيدية'], ['Béni Mellal', 'بني ملال'],
    ]),
  },
};

export const COUNTRY_LIST = Object.values(COUNTRIES);
export const DEFAULT_COUNTRY = 'DZ';

export const currencyOf = (code) => COUNTRIES[code]?.currency || 'DZD';

/** Country name in the interface language. */
export const countryName = (code, lang = 'fr') => {
  const c = COUNTRIES[code];
  if (!c) return code || '';
  return lang === 'ar' ? c.arabic : lang === 'en' ? c.english : c.name;
};

/** Region names (French/official spelling) of a country. */
export const regionNames = (code) => (COUNTRIES[code] || COUNTRIES[DEFAULT_COUNTRY]).regions.map((r) => r.name);
