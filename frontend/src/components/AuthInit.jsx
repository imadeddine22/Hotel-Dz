'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore, useLangStore } from '@/store/authStore';
import { useT } from '@/lib/i18n/useT';
import { useUrlLang } from '@/components/UrlLang';
import { localePath, splitLocale } from '@/lib/i18n/locale';

/**
 * Mounted once in the root layout (every page). Restores the user session, applies the
 * language to <html lang dir> (dashboards and login pages have no Navbar to do it), and keeps
 * the saved language and the URL in step:
 *   - opening an /ar/… or /en/… page makes that the saved language;
 *   - a visitor who chose Arabic or English and lands on a French URL is sent to their version.
 * Renders nothing.
 */
export default function AuthInit() {
  const init = useAuthStore((s) => s.init);
  const { lang, rtl } = useT();
  const urlLang = useUrlLang();
  const pathname = usePathname();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  }, [lang, rtl]);

  useEffect(() => {
    if (!urlLang) return; // private page: the saved language applies as-is
    const { lang: stored, setLang } = useLangStore.getState();
    if (urlLang !== 'fr') {
      if (stored !== urlLang) setLang(urlLang);
    } else if (stored === 'ar' || stored === 'en') {
      window.location.replace(localePath(stored, splitLocale(pathname).path) + window.location.search + window.location.hash);
    }
  }, [urlLang, pathname]);

  return null;
}
