import { NextResponse } from 'next/server';
import { isLocalizable, splitLocale } from '@/lib/i18n/locale';

/**
 * /ar/... and /en/... are served by the same pages as the French root: the prefix is stripped
 * (rewrite) and passed on as the `x-lang` request header, so the server renders that language
 * (lib/i18n/server.js). /fr/... redirects to the unprefixed French URL.
 */
export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  if (pathname === '/fr' || pathname.startsWith('/fr/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }

  const { lang, path } = splitLocale(pathname);
  const headers = new Headers(request.headers);
  // Only pages with language versions get a language; private pages follow the saved choice
  if (isLocalizable(path)) headers.set('x-lang', lang || 'fr');
  else headers.delete('x-lang');

  if (!lang) return NextResponse.next({ request: { headers } });

  // Private areas have no language versions: /ar/admin → /admin
  if (!isLocalizable(path)) {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = search;
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  // Pages only: skip Next internals, API-like routes and static files (anything with an extension)
  matcher: ['/((?!_next/|api/|uploads/|.*\\.[a-zA-Z0-9]+$).*)'],
};
