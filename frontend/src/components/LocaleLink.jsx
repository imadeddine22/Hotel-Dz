'use client';

import { forwardRef } from 'react';
import NextLink from 'next/link';
import { useUrlLang } from '@/components/UrlLang';
import { isLocalizable, localePath } from '@/lib/i18n/locale';

/**
 * Drop-in for next/link that keeps the visitor on their language version:
 * on /ar/… pages, href="/hotels" points to /ar/hotels (so crawlers and visitors follow the
 * Arabic site). Private paths (/admin, /login…) and external links are left untouched.
 */
const LocaleLink = forwardRef(function LocaleLink({ href, ...props }, ref) {
  const lang = useUrlLang();
  let target = href;
  if (lang && lang !== 'fr') {
    if (typeof href === 'string' && isLocalizable(href.split(/[?#]/)[0])) {
      const [, path, rest] = href.match(/^([^?#]*)(.*)$/);
      target = localePath(lang, path) + rest;
    } else if (href && typeof href === 'object' && isLocalizable(href.pathname || '')) {
      target = { ...href, pathname: localePath(lang, href.pathname) };
    }
  }
  return <NextLink ref={ref} href={target} {...props} />;
});

export default LocaleLink;
