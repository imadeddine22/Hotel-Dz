'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, MapPin } from 'lucide-react';
import api from '@/lib/api';
import { formatDZD } from '@/lib/data';

const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
  completed: 'Terminée',
};

const PAYMENT_LABELS = {
  unpaid: 'Non payé',
  paid: 'Payé',
  refunded: 'Remboursé',
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/admin/bookings', { params });
      setBookings(data.bookings);
      setTotal(data.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Réservations</h1>
        <p className="admin-page-subtitle">Toutes les réservations · {total} au total</p>
      </div>

      {/* Filters */}
      <div className="admin-bookings-filters">
        {[
          { label: 'Toutes', value: '' },
          { label: 'En attente', value: 'pending' },
          { label: 'Confirmées', value: 'confirmed' },
          { label: 'Terminées', value: 'completed' },
          { label: 'Annulées', value: 'cancelled' },
        ].map((f) => (
          <button
            key={f.value}
            className={`admin-filter-btn ${statusFilter === f.value ? 'active' : ''}`}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="admin-table-wrapper">
        {loading ? (
          <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="admin-skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
                <div className="admin-skeleton" style={{ flex: 1, height: 16 }} />
                <div className="admin-skeleton" style={{ width: 100, height: 16 }} />
                <div className="admin-skeleton" style={{ width: 80, height: 24, borderRadius: 20 }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ padding: 22 }}>
            <div className="admin-error">{error}</div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><CalendarCheck /></div>
            <p className="admin-empty-title">Aucune réservation</p>
            <p className="admin-empty-desc">Aucune réservation trouvée avec ces filtres</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Hôtel</th>
                  <th>Chambre</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Nuits</th>
                  <th>Prix total</th>
                  <th>Statut</th>
                  <th>Paiement</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div className="admin-table-user">
                        <div className="admin-table-avatar" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                          {b.customer?.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <span className="admin-table-username">{b.customer?.fullName || '—'}</span>
                          <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{b.customer?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin style={{ width: 14, height: 14, color: '#3b82f6', flexShrink: 0 }} />
                        <div>
                          <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{b.hotel?.name || '—'}</span>
                          {b.hotel?.city && (
                            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{b.hotel.city}, {b.hotel.wilaya}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{b.room?.title || b.room?.type || '—'}</td>
                    <td style={{ fontSize: 13, color: '#475569' }}>
                      {new Date(b.checkIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ fontSize: 13, color: '#475569' }}>
                      {new Date(b.checkOut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{b.nights}</td>
                    <td style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>{formatDZD(b.totalPrice)}</td>
                    <td>
                      <span className={`admin-badge ${b.status}`}>
                        {STATUS_LABELS[b.status] || b.status}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${b.paymentStatus}`}>
                        {PAYMENT_LABELS[b.paymentStatus] || b.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
