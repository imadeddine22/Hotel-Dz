'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck, Hotel, Users, Wallet, Store,
  TrendingUp, CheckSquare, Building2, ArrowUpRight, Home,
} from 'lucide-react';
import api from '@/lib/api';
import { formatDZD } from '@/lib/data';

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#00bcd4',
  cancelled: '#ef4444',
  completed: '#3b82f6',
};
const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmées',
  cancelled: 'Annulées',
  completed: 'Terminées',
};

/* ── Mini inline donut ─────────────────────────────────── */
function MiniDonut({ segments }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  let cum = 0;
  return (
    <svg viewBox="0 0 36 36" className="an-mini-svg">
      <circle cx="18" cy="18" r={r} fill="none" stroke="#e8edf4" strokeWidth="4" />
      {segments.map((seg, i) => {
        const dash = `${(seg.pct / 100) * circ} ${circ}`;
        const offset = -(cum / 100) * circ;
        cum += seg.pct;
        return (
          <circle key={i} cx="18" cy="18" r={r} fill="none"
            stroke={seg.color} strokeWidth="4"
            strokeDasharray={dash} strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
        );
      })}
    </svg>
  );
}

/* ── Time helper ──────────────────────────────────────── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}j`;
}

/* ═══════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [stats, setStats]       = useState(null);
  const [activity, setActivity] = useState(null);
  const [tab, setTab]           = useState('bookings');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, aRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/recent-activity'),
        ]);
        setStats(sRes.data.stats);
        setActivity(aRes.data);
      } catch { /* offline */ }
      finally { setLoading(false); }
    })();
  }, []);

  /* chart data */
  const chartData  = stats?.charts?.monthlyRevenue || [];
  const maxRevenue = Math.max(...chartData.map(d => d.total), 1);

  const bookingStatuses   = stats?.charts?.bookingsByStatus || [];
  const totalBookingCount = bookingStatuses.reduce((s, b) => s + b.count, 0) || 1;

  /* mini donut segments for Users card */
  const totalUsers  = stats?.users  || 1;
  const ownerCount  = stats?.owners || 0;
  const adminCount  = 1;
  const custCount   = Math.max(totalUsers - ownerCount - adminCount, 0);
  const userSegs = [
    { color: '#f59e0b', pct: Math.round((custCount  / totalUsers) * 100) },
    { color: '#3b82f6', pct: Math.round((ownerCount / totalUsers) * 100) },
    { color: '#00bcd4', pct: Math.round((adminCount / totalUsers) * 100) },
  ];

  /* mini donut segments for Hotels card */
  const approvedH = stats?.hotels       || 0;
  const pendingH  = stats?.pendingHotels || 0;
  const totalH    = approvedH + pendingH || 1;
  const hotelSegs = [
    { color: '#00bcd4', pct: Math.round((approvedH / totalH) * 100) },
    { color: '#f59e0b', pct: Math.round((pendingH  / totalH) * 100) },
  ];

  /* ── Loading skeleton ── */
  if (loading) return (
    <div>
      <div className="an-page-header">
        <h1 className="an-page-title">Analytics</h1>
      </div>
      <div className="an-stats-row">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="an-stat-card">
            <div className="admin-skeleton" style={{ width: '55%', height: 13, marginBottom: 14 }} />
            <div className="admin-skeleton" style={{ width: '45%', height: 32 }} />
          </div>
        ))}
      </div>
    </div>
  );

  /* ── Dashboard ── */
  return (
    <div>
      {/* ─── Header ─── */}
      <div className="an-page-header">
        <div>
          <h1 className="an-page-title">Analytics</h1>
          <p className="an-page-sub">
            {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ─── Row 1: 4 stat cards ─── */}
      <div className="an-stats-row">

        {/* Card: Réservations */}
        <div className="an-stat-card">
          <div className="an-stat-top">
            <span className="an-stat-label">Réservations</span>
            <div className="an-stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
              <CalendarCheck />
            </div>
          </div>
          <p className="an-stat-num">{stats?.bookings ?? '—'}</p>
          <span className="an-change up"><TrendingUp /> +18% vs mois dernier</span>
        </div>

        {/* Card: Approuvés */}
        <div className="an-stat-card">
          <div className="an-stat-top">
            <span className="an-stat-label">Hôtels approuvés</span>
            <div className="an-stat-icon" style={{ background: '#e0f7fa', color: '#00bcd4' }}>
              <Hotel />
            </div>
          </div>
          <p className="an-stat-num">{stats?.hotels ?? '—'}</p>
          <span className="an-change up"><TrendingUp /> +8% vs mois dernier</span>
        </div>

        {/* Card: Maisons */}
        <div className="an-stat-card">
          <div className="an-stat-top">
            <span className="an-stat-label">Maisons approuvées</span>
            <div className="an-stat-icon" style={{ background: '#fdf4ff', color: '#a855f7' }}>
              <Home />
            </div>
          </div>
          <p className="an-stat-num">{stats?.houses ?? '—'}</p>
          <span className="an-change up"><TrendingUp /> +{stats?.pendingHouses ?? 0} en attente</span>
        </div>

        {/* Card: Utilisateurs + mini donut */}
        <div className="an-stat-card an-stat-card--split">
          <div className="an-stat-split-left">
            <span className="an-stat-label">Utilisateurs</span>
            <p className="an-stat-num">{stats?.users?.toLocaleString('fr-FR') ?? '—'}</p>
            <div className="an-legend-list">
              <span><span className="an-dot" style={{ background: '#f59e0b' }} />Clients</span>
              <span><span className="an-dot" style={{ background: '#3b82f6' }} />Hôteliers</span>
              <span><span className="an-dot" style={{ background: '#00bcd4' }} />Admins</span>
            </div>
          </div>
          <MiniDonut segments={userSegs} />
        </div>

        {/* Card: En attente + mini donut */}
        <div className="an-stat-card an-stat-card--split">
          <div className="an-stat-split-left">
            <span className="an-stat-label">En attente</span>
            <p className="an-stat-num">{stats?.pendingHotels ?? '—'}</p>
            <div className="an-legend-list">
              <span><span className="an-dot" style={{ background: '#00bcd4' }} />Approuvés</span>
              <span><span className="an-dot" style={{ background: '#f59e0b' }} />En attente</span>
            </div>
          </div>
          <MiniDonut segments={hotelSegs} />
        </div>
      </div>

      {/* ─── Row 2: 2 wide metric cards ─── */}
      <div className="an-wide-row">
        <div className="an-wide-card">
          <div className="an-wide-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <Wallet />
          </div>
          <div className="an-wide-body">
            <p className="an-wide-label">Revenu total</p>
            <p className="an-wide-val">{stats ? formatDZD(stats.revenue) : '—'}</p>
            <span className="an-change up"><TrendingUp /> +22% vs mois dernier</span>
          </div>
          <div className="an-wide-badge" style={{ background: '#e0f7fa', color: '#00bcd4' }}>
            +22%
          </div>
        </div>

        <div className="an-wide-card">
          <div className="an-wide-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <Store />
          </div>
          <div className="an-wide-body">
            <p className="an-wide-label">Hôteliers inscrits</p>
            <p className="an-wide-val">{stats?.owners ?? '—'}</p>
            <span className="an-change up"><TrendingUp /> +5% vs mois dernier</span>
          </div>
          <div className="an-wide-badge" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            +5%
          </div>
        </div>
      </div>

      {/* ─── Main grid: Chart + Right panel ─── */}
      <div className="an-main-grid">

        {/* Bar Chart */}
        <div className="an-card">
          <div className="an-card-head">
            <div>
              <h3 className="an-card-title">Revenus mensuels</h3>
              <p className="an-card-sub">6 derniers mois</p>
            </div>
            <span className="an-card-tag">2026</span>
          </div>

          <div className="an-bar-chart-wrap">
            {/* Y-axis labels */}
            <div className="an-y-labels">
              {['100%', '75%', '50%', '25%', '0%'].map(l => (
                <span key={l}>{l}</span>
              ))}
            </div>

            {/* Bars area */}
            <div className="an-bars-area">
              {/* Dotted grid lines */}
              {[0, 25, 50, 75, 100].map(p => (
                <div key={p} className="an-grid-line" style={{ bottom: `${p === 0 ? 0 : p}%` }} />
              ))}

              {chartData.length > 0
                ? chartData.map((d, i) => (
                  <div key={i} className="an-bar-col">
                    <span className="an-bar-top-val">
                      {d.total >= 1000 ? `${Math.round(d.total / 1000)}k` : d.total}
                    </span>
                    <div
                      className="an-bar"
                      style={{ height: `${Math.max((d.total / maxRevenue) * 80, 4)}%` }}
                    />
                    <span className="an-bar-month">
                      {MONTHS_FR[(d._id.month - 1)] ?? d._id.month}
                    </span>
                  </div>
                ))
                : [65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className="an-bar-col">
                    <div className="an-bar" style={{ height: `${h}%` }} />
                    <span className="an-bar-month">
                      {MONTHS_FR[(new Date().getMonth() - 5 + i + 12) % 12]}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="an-right-col">

          {/* Booking status donut */}
          <div className="an-card">
            <div className="an-card-head">
              <h3 className="an-card-title">Statuts réservations</h3>
            </div>
            <div className="an-donut-wrap">
              <div className="an-donut-svg-wrap">
                <svg viewBox="0 0 120 120" className="an-donut-svg">
                  {(() => {
                    let cum = 0;
                    const r = 44, circ = 2 * Math.PI * r;
                    return bookingStatuses.length > 0
                      ? bookingStatuses.map((s) => {
                        const pct = s.count / totalBookingCount;
                        const dash = `${pct * circ} ${circ}`;
                        const off  = -cum * circ;
                        cum += pct;
                        return (
                          <circle key={s._id} cx="60" cy="60" r={r}
                            fill="none" stroke={STATUS_COLORS[s._id] || '#94a3b8'}
                            strokeWidth="14" strokeDasharray={dash}
                            strokeDashoffset={off} strokeLinecap="round"
                          />
                        );
                      })
                      : <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" />;
                  })()}
                  <text x="60" y="54" textAnchor="middle"
                    transform="rotate(90 60 60)"
                    style={{ fontSize: 22, fontWeight: 800, fill: '#1e293b' }}>
                    {stats?.bookings || 0}
                  </text>
                  <text x="60" y="70" textAnchor="middle"
                    transform="rotate(90 60 60)"
                    style={{ fontSize: 9, fill: '#94a3b8' }}>
                    Total
                  </text>
                </svg>
              </div>
              <div className="an-donut-legend">
                {bookingStatuses.map(s => (
                  <div key={s._id} className="an-donut-row">
                    <span className="an-dot" style={{ background: STATUS_COLORS[s._id] }} />
                    <span className="an-donut-lbl">{STATUS_LABELS[s._id] || s._id}</span>
                    <span className="an-donut-cnt">{s.count}</span>
                  </div>
                ))}
                {bookingStatuses.length === 0 && (
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>Aucune donnée</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="an-quick-grid">
            <Link href="/admin/hotels" className="an-quick-btn" style={{ '--qbg': '#fffbeb', '--qco': '#f59e0b' }}>
              <CheckSquare className="an-quick-ico" /> Approbations
            </Link>
            <Link href="/admin/all-hotels" className="an-quick-btn" style={{ '--qbg': '#e0f7fa', '--qco': '#00bcd4' }}>
              <Building2 className="an-quick-ico" /> Hôtels
            </Link>
            <Link href="/admin/all-houses" className="an-quick-btn" style={{ '--qbg': '#fdf4ff', '--qco': '#a855f7' }}>
              <Home className="an-quick-ico" /> Maisons
            </Link>
            <Link href="/admin/users" className="an-quick-btn" style={{ '--qbg': '#eff6ff', '--qco': '#3b82f6' }}>
              <Users className="an-quick-ico" /> Utilisateurs
            </Link>
            <Link href="/admin/bookings" className="an-quick-btn" style={{ '--qbg': '#fdf2f8', '--qco': '#ec4899' }}>
              <CalendarCheck className="an-quick-ico" /> Réservations
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Bottom: Activity Table ─── */}
      <div className="an-card an-bottom-card">
        <div className="an-card-head">
          <h3 className="an-card-title">Activité récente</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="an-tabs">
              <button className={`an-tab ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>
                Réservations
              </button>
              <button className={`an-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
                Membres
              </button>
            </div>
            <Link href={tab === 'bookings' ? '/admin/bookings' : '/admin/users'} className="an-view-all">
              Voir tout <ArrowUpRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        </div>

        <div className="an-table-wrap">
          <table className="an-table">
            <thead>
              <tr>
                <th>Profil</th>
                <th>{tab === 'bookings' ? 'Hôtel' : 'Email'}</th>
                <th>Date</th>
                <th>Statut</th>
                {tab === 'bookings' && <th>Montant</th>}
              </tr>
            </thead>
            <tbody>
              {tab === 'bookings'
                ? activity?.recentBookings?.length > 0
                  ? activity.recentBookings.map(b => (
                    <tr key={b._id}>
                      <td>
                        <div className="an-tbl-user">
                          <div className="an-tbl-avatar" style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
                            {b.customer?.fullName?.charAt(0)?.toUpperCase() || 'B'}
                          </div>
                          <div>
                            <p className="an-tbl-name">{b.customer?.fullName || 'Client'}</p>
                            <p className="an-tbl-meta">{b.nights} nuit{b.nights > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="an-tbl-sub">{b.hotel?.name || '—'}</td>
                      <td className="an-tbl-sub">{new Date(b.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td><span className={`admin-badge ${b.status}`}>{STATUS_LABELS[b.status] || b.status}</span></td>
                      <td className="an-tbl-bold">{formatDZD(b.totalPrice)}</td>
                    </tr>
                  ))
                  : <tr><td colSpan={5} className="an-tbl-empty">Aucune réservation récente</td></tr>

                : activity?.recentUsers?.length > 0
                  ? activity.recentUsers.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div className="an-tbl-user">
                          <div className="an-tbl-avatar" style={{ background: 'linear-gradient(135deg,#00bcd4,#06b6d4)' }}>
                            {u.fullName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="an-tbl-name">{u.fullName}</p>
                            <p className="an-tbl-meta">{timeAgo(u.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="an-tbl-sub">{u.email}</td>
                      <td className="an-tbl-sub">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td><span className={`admin-badge ${u.role}`}>{u.role}</span></td>
                    </tr>
                  ))
                  : <tr><td colSpan={4} className="an-tbl-empty">Aucun nouveau membre</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
