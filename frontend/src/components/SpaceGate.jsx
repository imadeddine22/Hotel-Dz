'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useT } from '@/lib/i18n/useT';

/**
 * Wraps a space's pages (layout of /owner, /seller, /investor): switches the account to that space
 * BEFORE the page mounts, so the page's own requests never run with the wrong role.
 * Visitors are sent to the login page; admins see every space as they are.
 */
export default function SpaceGate({ role, children }) {
  const { t } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, switchSpace } = useAuthStore();
  const ready = Boolean(user) && (user.role === role || user.role === 'admin');

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login?redirect=' + encodeURIComponent(pathname));
    else if (!ready) switchSpace(role).catch(() => router.replace('/'));
  }, [user, loading, ready, role, router, pathname, switchSpace]);

  if (!ready) return <div className="grid min-h-screen place-items-center bg-[#f8f9fc] text-gray-400">{t('Loading...')}</div>;
  return children;
}
