'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Calendar, MapPin, Home, List } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { formatDZD } from '@/lib/data';

const COMMISSION = 0.05;

function PaymentSuccessContent() {
  const params = useSearchParams();
  const bookingId = params.get('booking');
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!bookingId) return;
    api.get(`/bookings/my`).then(({ data }) => {
      const found = data.bookings.find((b) => b._id === bookingId);
      if (found) setBooking(found);
    }).catch(() => {});
  }, [bookingId]);

  const isHouse = booking?.propertyType === 'house';
  const property = isHouse ? booking?.house : booking?.hotel;
  const platformFee = booking ? Math.round(booking.totalPrice * COMMISSION) : 0;
  const totalPaid = booking ? booking.totalPrice + platformFee : 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-3xl bg-white p-8 text-center shadow-xl border border-gray-100">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-500 mb-4">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-black text-ink">Réservation confirmée !</h1>
          <p className="mt-1 text-sm text-gray-500">
            Votre paiement a été traité avec succès via Chargily Pay.
          </p>

          {booking && (
            <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-left space-y-3 border border-gray-100">
              <h3 className="font-bold text-ink text-base">{property?.name}</h3>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                <MapPin className="h-3.5 w-3.5" /> {property?.city}, {property?.wilaya}
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <Calendar className="h-3.5 w-3.5 text-brand-500" />
                <span>
                  {new Date(booking.checkIn).toLocaleDateString('fr-FR')} —{' '}
                  {new Date(booking.checkOut).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="border-t border-gray-200/60 pt-3 flex justify-between text-sm font-extrabold text-ink">
                <span>Total payé:</span>
                <span className="text-brand-600">{formatDZD(totalPaid)}</span>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/my-bookings"
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 font-semibold text-white transition hover:bg-brand-600"
            >
              <List className="h-4 w-4" /> Voir mes réservations
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl py-3 font-medium text-gray-500 hover:bg-gray-50 transition"
            >
              <Home className="h-4 w-4" /> Retour à l&apos;accueil
            </Link>
          </div>
        </div>

        {/* Security note */}
        <p className="mt-6 text-center text-xs text-gray-400">
          🔒 Paiement traité en toute sécurité par <strong>Chargily Pay</strong>
        </p>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Chargement...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
