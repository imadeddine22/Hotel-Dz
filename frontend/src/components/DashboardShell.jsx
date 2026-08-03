'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Hotel, CalendarCheck, Users, CheckSquare, LogOut, Home, Mail, Search, Bell, Globe } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const MENUS = {
  owner: [
    { href: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/owner/my-hotels', label: 'My Hotels', icon: Hotel },
    { href: '/owner/my-houses', label: 'My Houses', icon: Home },
    { href: '/owner/bookings', label: 'Bookings', icon: CalendarCheck },
    { href: '/', label: 'Site Public', icon: Globe },
  ],
  admin: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/hotels', label: 'Approvals', icon: CheckSquare },
    { href: '/admin/all-hotels', label: 'All Hotels', icon: Hotel },
    { href: '/admin/all-houses', label: 'All Houses', icon: Home },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/messages', label: 'Messages', icon: Mail },
    { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
    { href: '/', label: 'Site Public', icon: Globe },
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
        <Link href="/" className="mb-10 flex items-center gap-3 px-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
            <Hotel className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">hotels<span className="text-indigo-600">dz</span></span>
        </Link>

        <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Overview</p>
        
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
              <LogOut className="h-5 w-5 text-red-400" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-20 items-center justify-between px-8 py-4">
          
          {/* Search Bar */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search everything..." 
              className="h-12 w-full rounded-full bg-white pl-12 pr-4 text-sm font-medium text-gray-700 outline-none placeholder:text-gray-400 border border-transparent focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-6 ml-auto">
            {/* Notification Bell */}
            <button className="relative rounded-full bg-white p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-3 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
            </button>
            
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
