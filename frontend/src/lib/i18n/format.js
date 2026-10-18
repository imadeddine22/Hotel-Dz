// Locale for dates/numbers in the user's language (read outside React, e.g. in formatters).
// ar-DZ keeps Latin digits, as is usual in Algeria.
const LOCALES = { fr: 'fr-FR', ar: 'ar-DZ', en: 'en-GB' };

export function dateLocale() {
  if (typeof window === 'undefined') return LOCALES.fr;
  try {
    return LOCALES[JSON.parse(localStorage.getItem('dz-lang-storage'))?.state?.lang] || LOCALES.fr;
  } catch {
    return LOCALES.fr;
  }
}
