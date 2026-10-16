'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Hotel, CalendarCheck, Users, CheckSquare, LogOut, Home, Mail, Globe, Tag } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const MENUS = {
  owner: [
    { href: '/owner/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/owner/my-hotels', label: 'Mes hôtels', icon: Hotel },
    { href: '/owner/my-houses', label: 'Mes maisons', icon: Home },
    { href: '/owner/bookings', label: 'Réservations', icon: CalendarCheck },
    { href: '/', label: 'Site public', icon: Globe },
  ],
  seller: [
    { href: '/seller/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/seller/my-listings', label: 'Mes annonces', icon: Tag },
    { href: '/', label: 'Site public', icon: Globe },
  ],
  admin: [
    { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/admin/hotels', label: 'Validations', icon: CheckSquare },
    { href: '/admin/all-hotels', label: 'Tous les hôtels', icon: Hotel },
    { href: '/admin/all-houses', label: 'Toutes les maisons', icon: Home },
    { href: '/admin/all-sales', label: 'Toutes les ventes', icon: Tag },
    { href: '/admin/users', label: 'Utilisateurs', icon: Users },
    { href: '/admin/messages', label: 'Messages', icon: Mail },
    { href: '/admin/bookings', label: 'Réservations', icon: CalendarCheck },
    { href: '/', label: 'Site public', icon: Globe },
  ],
};

export default function DashboardShell({ role, title, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuthStore();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login?redirect=' + pathname);
    else if (user.role !== role && user.role !== 'admin') router.replace('/');
  }, [user, loading, role, router, pathname]);

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center text-gray-400 bg-[#f8f9fc]">Loading...</div>;
  }

  const menu = MENUS[role] || [];

  return (
    <div className="flex min-h-screen bg-[#f3f4f8] font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-white px-5 py-6 md:flex border-r border-gray-100">
        <Link href="/" className="mb-10 flex items-center px-2">
          <BrandLogo className="h-10" />
        </Link>

        <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Menu</p>
        
        <nav className="flex flex-1 flex-col gap-2">
          {menu.map((m) => {
            const Icon = m.icon;
            const active = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  active 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 translate-x-1' 
                    : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-400'}`} /> 
                {m.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="flex flex-col gap-2">
            <button
              onClick={async () => { await logout(); router.push('/'); }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="h-5 w-5 text-red-400" /> Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-20 items-center justify-between px-8 py-4">
          
          {/* Search box and notification bell removed: they were placeholders with no behaviour */}
          <div className="flex items-center gap-6 ml-auto">

            {/* User Profile */}
            <div className="flex items-center gap-3 rounded-full bg-white p-1.5 pr-4 shadow-sm border border-gray-50 cursor-pointer hover:shadow-md transition-shadow">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-sm">
                {user.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-gray-800 leading-tight">{user.fullName}</p>
                <p className="text-xs font-medium text-gray-400 capitalize leading-tight">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-8 py-4 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
