'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api, { getImageUrl } from '@/lib/api';
import { formatDZD } from '@/lib/data';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
};

const PAYMENT_STATUS_STYLES = {
  unpaid: 'bg-red-50 text-red-700 border border-red-200',
  paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  refunded: 'bg-blue-50 text-blue-700 border border-blue-200',
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryingId, setRetryingId] = useState(null);

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
    if (!confirm('Voulez-vous vraiment annuler cette réservation ?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const retryPayment = async (id) => {
    setRetryingId(id);
    try {
      const { data } = await api.post(`/payments/retry/${id}`);
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Impossible de générer le lien de paiement.');
      }
    } catch (e) {
      alert(e.message);
      setRetryingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
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
            {bookings.map((b) => {
              const isHouse = b.propertyType === 'house';
              const property = isHouse ? b.house : b.hotel;
              const rawUrl = property?.images?.[0]?.url;
              const imgUrl = rawUrl ? getImageUrl(rawUrl) : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80';

              return (
                <div key={b._id} className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-card sm:flex-row">
                  <img
                    src={imgUrl}
                    alt={property?.name}
                    className="h-32 w-full rounded-xl object-cover sm:w-48"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-ink">{property?.name}</h3>
                        <p className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" /> {property?.city}, {property?.wilaya}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {isHouse ? `${property?.type} entière` : `${b.room?.title} (${b.room?.type})`} · {b.guests} pers.
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5 items-end">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[b.status]}`}>
                          {b.status === 'pending' ? 'En attente' : b.status === 'confirmed' ? 'Confirmée' : b.status === 'cancelled' ? 'Annulée' : 'Terminée'}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${PAYMENT_STATUS_STYLES[b.paymentStatus || 'unpaid']}`}>
                          {b.paymentStatus === 'paid' ? 'Payé' : b.paymentStatus === 'refunded' ? 'Remboursé' : 'Non payé'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-auto flex items-end justify-between pt-3">
                      <p className="text-sm text-gray-500">
                        {new Date(b.checkIn).toLocaleDateString('fr-DZ')} → {new Date(b.checkOut).toLocaleDateString('fr-DZ')}
                        <span className="ml-2 font-bold text-brand-600">{formatDZD(b.totalPrice)}</span>
                      </p>
                      <div className="flex items-center gap-3">
                        {b.status === 'pending' && b.paymentStatus === 'unpaid' && (
                          <button
                            disabled={retryingId === b._id}
                            onClick={() => retryPayment(b._id)}
                            className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 transition disabled:opacity-50"
                          >
                            {retryingId === b._id ? 'Redirection...' : 'Payer maintenant'}
                          </button>
                        )}
                        {['pending', 'confirmed'].includes(b.status) && (
                          <button onClick={() => cancel(b._id)} className="text-sm font-medium text-red-600 hover:underline">
                            Annuler
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
