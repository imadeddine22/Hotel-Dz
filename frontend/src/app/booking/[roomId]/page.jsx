'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { formatDZD } from '@/lib/data';

const todayStr = () => new Date().toISOString().split('T')[0];
const MS_DAY = 86400000;

export default function BookingPage() {
  const { roomId } = useParams();
  const router = useRouter();

  const [room, setRoom] = useState(null);
  const [form, setForm] = useState({ checkIn: todayStr(), checkOut: '', guests: 1 });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/rooms/${roomId}`);
        setRoom(data.room);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [roomId]);

  const nights =
    form.checkIn && form.checkOut
      ? Math.max(0, Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / MS_DAY))
      : 0;
  const total = room ? nights * room.pricePerNight : 0;

  const pay = async (e) => {
    e.preventDefault();
    setError('');
    if (nights < 1) return setError('Sélectionnez des dates valides.');
    setSubmitting(true);
    try {
      // 1) Create the booking
      const { data: bookingRes } = await api.post('/bookings', {
        roomId,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: Number(form.guests),
      });
      // 2) Create the Chargily checkout and redirect
      const { data: payRes } = await api.post('/payments/checkout', {
        bookingId: bookingRes.booking._id,
      });
      window.location.href = payRes.url;
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="mb-6 text-2xl font-extrabold text-ink">Finaliser la réservation</h1>

        {loading ? (
          <p className="text-gray-400">Chargement...</p>
        ) : !room ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-red-600">{error || 'Chambre introuvable.'}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Form */}
            <form onSubmit={pay} className="rounded-2xl bg-white p-6 shadow-card">
              <h2 className="mb-4 font-bold text-ink">{room.title}</h2>

              {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}

              <label className="mb-1 block text-sm font-medium text-gray-700">Arrivée</label>
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 px-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <input
                  type="date" min={todayStr()} required value={form.checkIn}
                  onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                  className="w-full py-2.5 outline-none"
                />
              </div>

              <label className="mb-1 block text-sm font-medium text-gray-700">Départ</label>
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 px-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <input
                  type="date" min={form.checkIn || todayStr()} required value={form.checkOut}
                  onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                  className="w-full py-2.5 outline-none"
                />
              </div>

              <label className="mb-1 block text-sm font-medium text-gray-700">Voyageurs</label>
              <div className="mb-6 flex items-center gap-2 rounded-lg border border-gray-200 px-3">
                <Users className="h-4 w-4 text-gray-400" />
                <input
                  type="number" min={1} max={room.capacity} required value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: e.target.value })}
                  className="w-full py-2.5 outline-none"
                />
              </div>

              <button
                disabled={submitting}
                className="w-full rounded-lg bg-brand-500 py-3 font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
              >
                {submitting ? 'Redirection vers le paiement...' : 'Payer en DZD'}
              </button>
              <p className="mt-2 text-center text-xs text-gray-400">Paiement sécurisé via CIB / EDAHABIA (Chargily)</p>
            </form>

            {/* Summary */}
            <div className="h-fit rounded-2xl bg-white p-6 shadow-card">
              <h2 className="mb-4 font-bold text-ink">Récapitulatif</h2>
              <Row label="Prix / nuit" value={formatDZD(room.pricePerNight)} />
              <Row label="Nuits" value={nights} />
              <Row label="Voyageurs" value={form.guests} />
              <div className="my-3 border-t border-gray-100" />
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">Total</span>
                <span className="text-xl font-extrabold text-brand-600">{formatDZD(total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
