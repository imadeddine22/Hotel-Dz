'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import api from '@/lib/api';
import { formatDZD } from '@/lib/data';

const STATUS = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
};

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/bookings/owner');
        setBookings(data.bookings);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <DashboardShell role="owner" title="Réservations">
      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-red-600 border border-red-100">{error}</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-500">Aucune réservation pour le moment.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-gray-500">
              <tr>
                <th className="p-4">Client</th>
                <th className="p-4">Hôtel</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Total</th>
                <th className="p-4">Statut</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{b.customer?.fullName}</div>
                    <div className="text-xs text-gray-500">{b.customer?.email}</div>
                  </td>
                  <td className="p-4 text-gray-600">{b.hotel?.name}<div className="text-xs text-gray-400">{b.room?.title}</div></td>
                  <td className="p-4 text-gray-600">
                    {new Date(b.checkIn).toLocaleDateString('fr')} → {new Date(b.checkOut).toLocaleDateString('fr')}
                  </td>
                  <td className="p-4 font-semibold text-brand-600">{formatDZD(b.totalPrice)}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS[b.status]}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
