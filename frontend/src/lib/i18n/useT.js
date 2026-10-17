'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLangStore } from '@/store/authStore';
import { TRANSLATIONS } from '@/lib/data';
import { DEFAULT_LANG, isRtl, translate } from './index';

/**
 * const { t, lang } = useT();  t('Mes réservations')  t('Hôtels à {place}', { place })
 *
 * Renders French on the server and on the very first client render (the saved language
 * lives in localStorage, which the server can't see), then switches to the user's language
 * right after mount. This avoids React hydration mismatches.
 */
export function useT() {
  const stored = useLangStore((s) => s.lang);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const lang = mounted ? stored || DEFAULT_LANG : DEFAULT_LANG;
  // t is a function, and also carries the older keyed translations (t.navHome, t.seeAll…)
  // from lib/data.js so components written against that object keep working.
  const t = useMemo(
    () => Object.assign((key, vars) => translate(lang, key, vars), TRANSLATIONS[lang] || TRANSLATIONS.fr),
    [lang]
  );
  return { t, lang, rtl: isRtl(lang) };
}

export default useT;
