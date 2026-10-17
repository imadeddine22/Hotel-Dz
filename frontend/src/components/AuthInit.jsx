'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useT } from '@/lib/i18n/useT';

/**
 * Mounted once in the root layout (every page). Restores the user session and applies the
 * chosen language to <html lang dir> — dashboards and login pages have no Navbar to do it.
 * Renders nothing.
 */
export default function AuthInit() {
  const init = useAuthStore((s) => s.init);
  const { lang, rtl } = useT();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  }, [lang, rtl]);

  return null;
}
