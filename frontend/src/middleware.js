import { NextResponse } from 'next/server';

// /admin and /owner are guarded client-side by their layout components
// (AdminLayout / DashboardShell) which have access to Zustand auth store.
// The cookie-based check here only applies to simpler protected pages.
const COOKIE_GUARDED = ['/my-bookings', '/booking', '/account', '/profile'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const needsAuth = COOKIE_GUARDED.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const token = request.cookies.get('token')?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/my-bookings/:path*', '/booking/:path*', '/owner/:path*', '/admin/:path*', '/account/:path*', '/profile/:path*'],
};
