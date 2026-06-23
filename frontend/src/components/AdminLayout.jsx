'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Hotel,
  CalendarCheck,
  Users,
  CheckSquare,
  LogOut,
  Bell,
  Settings,
  ChevronDown,
  Menu,
  X,
  Search,
  Building2,
  Home,
  Mail,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const ADMIN_MENU = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/hotels', label: 'Approbations', icon: CheckSquare },
  { href: '/admin/all-hotels', label: 'Tous les hôtels', icon: Building2 },
  { href: '/admin/all-houses', label: 'Toutes les maisons', icon: Home },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/messages', label: 'Messages', icon: Mail },
  { href: '/admin/bookings', label: 'Réservations', icon: CalendarCheck },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login?redirect=' + pathname);
    else if (user.role !== 'admin') router.replace('/');
  }, [user, loading, router, pathname]);

  // Pull the unread-message count for the bell + Messages badge.
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    api.get('/messages')
      .then(({ data }) => setUnread((data.messages || []).filter((m) => !m.isRead).length))
      .catch(() => {});
  }, [user, pathname]);

  if (loading || !user) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner" />
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link href="/" className="admin-logo">
            <span className="admin-logo-icon">
              <Hotel className="w-5 h-5" />
            </span>
            <span className="admin-logo-text">
              hotels<span className="admin-logo-accent">dz</span>
            </span>
          </Link>
          <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="admin-nav">
          {ADMIN_MENU.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            const showBadge = item.href === '/admin/messages' && unread > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`admin-nav-item ${active ? 'active' : ''}`}
              >
                <Icon className="admin-nav-icon" />
                <span>{item.label}</span>
                {showBadge && <span className="admin-nav-badge">{unread}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            onClick={async () => { await logout(); router.push('/'); }}
            className="admin-nav-item logout"
          >
            <LogOut className="admin-nav-icon" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="admin-search-box">
              <Search className="admin-search-icon" />
              <input type="text" placeholder="Rechercher..." className="admin-search-input" />
            </div>
          </div>
          <div className="admin-topbar-right">
            <Link href="/admin/messages" className="admin-notif-btn" aria-label="Messages">
              <Bell className="w-5 h-5" />
              {unread > 0 && <span className="admin-notif-badge">{unread}</span>}
            </Link>
            <div className="admin-profile-wrapper">
              <button
                className="admin-profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="admin-avatar">
                  {user.fullName?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="admin-profile-info">
                  <span className="admin-profile-name">{user.fullName}</span>
                  <span className="admin-profile-role">Administrateur</span>
                </div>
                <ChevronDown className={`admin-chevron ${profileOpen ? 'rotated' : ''}`} />
              </button>
              {profileOpen && (
                <div className="admin-profile-dropdown">
                  <Link href="/profile" className="admin-dropdown-item">
                    <Settings className="w-4 h-4" /> Paramètres
                  </Link>
                  <button
                    onClick={async () => { await logout(); router.push('/'); }}
                    className="admin-dropdown-item danger"
                  >
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
