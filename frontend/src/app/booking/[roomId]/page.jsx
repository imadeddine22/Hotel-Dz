'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Users, ShieldCheck, CreditCard, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { formatDZD } from '@/lib/data';

const todayStr = () => new Date().toISOString().split('T')[0];
const MS_DAY   = 86400000;
const COMMISSION = 0.10;

export default function BookingPage() {
  const { roomId } = useParams();
  const router     = useRouter();

  const [room, setRoom]           = useState(null);
  const [form, setForm]           = useState({ checkIn: todayStr(), checkOut: '', guests: 1 });
  const [error, setError]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading]     = useState(true);

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

  const nights     = form.checkIn && form.checkOut
    ? Math.max(0, Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / MS_DAY))
    : 0;
  const baseAmount  = room ? nights * room.pricePerNight : 0;
  const platformFee = Math.round(baseAmount * COMMISSION);
  const totalAmount = baseAmount + platformFee;

  const pay = async (e) => {
    e.preventDefault();
    setError('');
    if (nights < 1) return setError('Sélectionnez des dates valides.');
    setSubmitting(true);
    try {
      const { data: bookingRes } = await api.post('/bookings', {
        roomId,
        checkIn:  form.checkIn,
        checkOut: form.checkOut,
        guests:   Number(form.guests),
      });
      const { data: payRes } = await api.post('/payments/checkout', {
        bookingId: bookingRes.booking._id,
      });
      window.location.href = payRes.url;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-brand-600 to-cyan-500 py-10 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold">Finaliser la réservation</h1>
          <p className="mt-1 text-brand-50 text-sm">Paiement sécurisé via Chargily Pay</p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
          </div>
        ) : !room ? (
          <div className="flex items-center gap-3 rounded-2xl bg-red-50 px-5 py-4 text-red-600">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error || 'Chambre introuvable.'}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-5">

            {/* ── Form (3/5) ── */}
            <form onSubmit={pay} className="md:col-span-3 rounded-3xl bg-white p-7 shadow-card">
              <h2 className="mb-1 text-lg font-bold text-ink">{room.title}</h2>
              <p className="mb-6 text-sm text-gray-400">{room.type} · jusqu&apos;à {room.capacity} pers.</p>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              {/* Check-in */}
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Date d&apos;arrivée</label>
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition">
                <Calendar className="h-4 w-4 text-gray-400" />
                <input
                  type="date" min={todayStr()} required value={form.checkIn}
                  onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                  className="w-full bg-transparent py-3 outline-none text-sm"
                />
              </div>

              {/* Check-out */}
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Date de départ</label>
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition">
                <Calendar className="h-4 w-4 text-gray-400" />
                <input
                  type="date" min={form.checkIn || todayStr()} required value={form.checkOut}
                  onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                  className="w-full bg-transparent py-3 outline-none text-sm"
                />
              </div>

              {/* Guests */}
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Voyageurs</label>
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition">
                <Users className="h-4 w-4 text-gray-400" />
                <input
                  type="number" min={1} max={room.capacity} required value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: e.target.value })}
                  className="w-full bg-transparent py-3 outline-none text-sm"
                />
              </div>

              {/* Pay button */}
              <button
                disabled={submitting || nights < 1}
                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-brand-500 to-cyan-400 py-3.5 font-bold text-white shadow-md transition hover:shadow-lg disabled:opacity-60"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Redirection vers Chargily…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payer {nights > 0 ? formatDZD(totalAmount) : ''} via Chargily
                  </span>
                )}
              </button>

              {/* Payment badges */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Paiement sécurisé
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">💳 CIB</span>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">📱 EDAHABIA</span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">🔒 Chargily Pay</span>
              </div>
            </form>

            {/* ── Summary (2/5) ── */}
            <div className="md:col-span-2 h-fit rounded-3xl bg-white p-7 shadow-card">
              <h2 className="mb-5 font-bold text-ink">Récapitulatif</h2>

              <Row label="Prix / nuit"    value={formatDZD(room.pricePerNight)} />
              <Row label="Nuits"          value={nights || '—'} />
              <Row label="Voyageurs"      value={form.guests} />

              <div className="my-4 border-t border-dashed border-gray-100" />

              <Row label="Sous-total"     value={nights > 0 ? formatDZD(baseAmount) : '—'} />
              <div className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-amber-600 font-medium">Frais de service (10%)</span>
                <span className="font-semibold text-amber-600">
                  {nights > 0 ? `+ ${formatDZD(platformFee)}` : '—'}
                </span>
              </div>

              <div className="my-4 border-t border-gray-200" />

              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">Total à payer</span>
                <span className="text-xl font-extrabold text-brand-600">
                  {nights > 0 ? formatDZD(totalAmount) : '—'}
                </span>
              </div>

              {nights > 0 && (
                <p className="mt-2 text-center text-[11px] text-gray-400">
                  dont {formatDZD(platformFee)} de frais de service HotelsDZ
                </p>
              )}
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
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
