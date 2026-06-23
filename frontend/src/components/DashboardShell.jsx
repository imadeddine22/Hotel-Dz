'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Hotel, CalendarCheck, Users, CheckSquare, LogOut, Home, Mail } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const MENUS = {
  owner: [
    { href: '/owner/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/owner/my-hotels', label: 'Mes hôtels', icon: Hotel },
    { href: '/owner/my-houses', label: 'Mes maisons', icon: Home },
    { href: '/owner/bookings', label: 'Réservations', icon: CalendarCheck },
  ],
  admin: [
    { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/admin/hotels', label: 'Approbations', icon: CheckSquare },
    { href: '/admin/all-hotels', label: 'Tous les hôtels', icon: Hotel },
    { href: '/admin/all-houses', label: 'Toutes les maisons', icon: Home },
    { href: '/admin/users', label: 'Utilisateurs', icon: Users },
    { href: '/admin/messages', label: 'Messages', icon: Mail },
    { href: '/admin/bookings', label: 'Réservations', icon: CalendarCheck },
  ],
};

export default function DashboardShell({ role, title, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuthStore();

  // Client-side role enforcement (cookie presence is checked by middleware)
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login?redirect=' + pathname);
    else if (user.role !== role && user.role !== 'admin') router.replace('/');
  }, [user, loading, role, router, pathname]);

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center text-gray-400">Chargement...</div>;
  }

  const menu = MENUS[role] || [];

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-100 bg-white p-4 md:flex">
        <Link href="/" className="mb-8 flex items-center gap-2 px-2 pt-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-white">
            <Hotel className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold text-ink">hotels<span className="text-brand-500">dz</span></span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {menu.map((m) => {
            const Icon = m.icon;
            const active = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" /> {m.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-gray-100 pt-3">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100">
            <Home className="h-5 w-5" /> Voir le site
          </Link>
          <button
            onClick={async () => { await logout(); router.push('/'); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6">
          <h1 className="text-lg font-bold text-ink">{title}</h1>
          <span className="text-sm text-gray-500">{user.fullName}</span>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
