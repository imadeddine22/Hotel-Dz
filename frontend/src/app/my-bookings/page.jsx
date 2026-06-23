'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { formatDZD } from '@/lib/data';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data.bookings);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    try {
      await api.put(`/bookings/${id}/cancel`);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="mb-6 text-2xl font-extrabold text-ink">Mes réservations</h1>

        {loading ? (
          <p className="text-gray-400">Chargement...</p>
        ) : error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-red-600">{error}</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-400">Vous n&apos;avez pas encore de réservation.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b._id} className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-card sm:flex-row">
                <img
                  src={b.hotel?.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80'}
                  alt={b.hotel?.name}
                  className="h-32 w-full rounded-xl object-cover sm:w-48"
                />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-ink">{b.hotel?.name}</h3>
                      <p className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" /> {b.hotel?.city}, {b.hotel?.wilaya}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">{b.room?.title} · {b.guests} pers.</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[b.status]}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="mt-auto flex items-end justify-between pt-3">
                    <p className="text-sm text-gray-500">
                      {new Date(b.checkIn).toLocaleDateString('fr')} → {new Date(b.checkOut).toLocaleDateString('fr')}
                      <span className="ml-2 font-bold text-brand-600">{formatDZD(b.totalPrice)}</span>
                    </p>
                    {['pending', 'confirmed'].includes(b.status) && (
                      <button onClick={() => cancel(b._id)} className="text-sm font-medium text-red-600 hover:underline">
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
