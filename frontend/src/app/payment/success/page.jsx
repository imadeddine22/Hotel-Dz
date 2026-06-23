'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-card">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-brand-500" />
        <h1 className="mb-2 text-2xl font-extrabold text-ink">Paiement réussi !</h1>
        <p className="mb-6 text-gray-500">
          Votre réservation est confirmée. Un email de confirmation vous a été envoyé.
        </p>
        <div className="flex flex-col gap-2">
          <Link href="/my-bookings" className="rounded-lg bg-brand-500 py-2.5 font-semibold text-white hover:bg-brand-600">
            Voir mes réservations
          </Link>
          <Link href="/" className="rounded-lg py-2.5 font-medium text-gray-500 hover:bg-gray-100">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
