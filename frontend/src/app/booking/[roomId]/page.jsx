'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Users, Send, Info, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { ROOM_TYPE_LABELS } from '@/lib/statusLabels';
import { formatDZD } from '@/lib/data';
import { useAuthStore } from '@/store/authStore';

import { useT } from '@/lib/i18n/useT';
const todayStr = () => new Date().toISOString().split('T')[0];
const MS_DAY   = 86400000;

export default function BookingPage() {
  const { t } = useT();
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
  // No online payment: the guest pays this amount on site, once the owner has accepted the request
  const totalAmount = room ? nights * room.pricePerNight : 0;

  const sendRequest = async (e) => {
    e.preventDefault();
    setError('');
    if (nights < 1) return setError(t('Sélectionnez des dates valides.'));
    // Visitors must log in first; come back to this page afterwards instead of showing a 401 error
    if (!useAuthStore.getState().user && !localStorage.getItem('token')) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/bookings', {
        roomId,
        checkIn:  form.checkIn,
        checkOut: form.checkOut,
        guests:   Number(form.guests),
      });
      router.push('/my-bookings?requested=1');
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
          <h1 className="text-3xl font-extrabold">{t('Finaliser la réservation')}</h1>
          <p className="mt-1 text-brand-50 text-sm">{t('Demande de réservation · paiement sur place à l\'arrivée')}</p>
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
            {error || t('Chambre introuvable.')}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-5">

            {/* ── Form (3/5) ── */}
            <form onSubmit={sendRequest} className="md:col-span-3 rounded-3xl bg-white p-7 shadow-card">
              <h2 className="mb-1 text-lg font-bold text-ink">{t(room.title)}</h2>
              <p className="mb-6 text-sm text-gray-400">{ROOM_TYPE_LABELS[room.type] || room.type} {t('· jusqu\'à')} {room.capacity} {t('pers.')}</p>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              {/* Check-in */}
              <label htmlFor="bk-checkin" className="mb-1.5 block text-sm font-medium text-gray-700">{t('Date d\'arrivée')}</label>
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition">
                <Calendar className="h-4 w-4 text-gray-400" />
                <input
                  id="bk-checkin"
                  type="date" min={todayStr()} required value={form.checkIn}
                  onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                  className="w-full bg-transparent py-3 outline-none text-sm"
                />
              </div>

              {/* Check-out */}
              <label htmlFor="bk-checkout" className="mb-1.5 block text-sm font-medium text-gray-700">{t('Date de départ')}</label>
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition">
                <Calendar className="h-4 w-4 text-gray-400" />
                <input
                  id="bk-checkout"
                  type="date" min={form.checkIn || todayStr()} required value={form.checkOut}
                  onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                  className="w-full bg-transparent py-3 outline-none text-sm"
                />
              </div>

              {/* Guests */}
              <label htmlFor="bk-guests" className="mb-1.5 block text-sm font-medium text-gray-700">{t('Voyageurs')}</label>
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition">
                <Users className="h-4 w-4 text-gray-400" />
                <input
                  id="bk-guests"
                  type="number" min={1} max={room.capacity} required value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: e.target.value })}
                  className="w-full bg-transparent py-3 outline-none text-sm"
                />
              </div>

              {/* Submit request */}
              <button
                disabled={submitting || nights < 1}
                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-brand-500 to-cyan-400 py-3.5 font-bold text-white shadow-md transition hover:shadow-lg disabled:opacity-60"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    {t('Envoi de la demande…')}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="h-5 w-5" />
                    {t('Envoyer la demande de réservation')}
                  </span>
                )}
              </button>

              {/* How it works */}
              <div className="mt-4 flex gap-2 rounded-xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-gray-600">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                <p>
                  {t('Aucun paiement en ligne. Le propriétaire accepte ou refuse votre demande (sous 48 h au plus), puis vous réglez')} {nights > 0 ? formatDZD(totalAmount) : t('le séjour')} {t('directement sur place à l\'arrivée.')}
                </p>
              </div>
            </form>

            {/* ── Summary (2/5) ── */}
            <div className="md:col-span-2 h-fit rounded-3xl bg-white p-7 shadow-card">
              <h2 className="mb-5 font-bold text-ink">{t('Récapitulatif')}</h2>

              <Row label={t('Prix / nuit')}    value={formatDZD(room.pricePerNight)} />
              <Row label={t('Nuits')}          value={nights || '—'} />
              <Row label={t('Voyageurs')}      value={form.guests} />

              <div className="my-4 border-t border-dashed border-gray-100" />

              <div className="my-4 border-t border-gray-200" />

              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">{t('Total à régler sur place')}</span>
                <span className="text-xl font-extrabold text-brand-600">
                  {nights > 0 ? formatDZD(totalAmount) : '—'}
                </span>
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
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
