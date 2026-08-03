'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  User,
  Percent,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

/* ─── FAQ data ─────────────────────────────────────────────── */
const FAQS = [
  {
    q: 'Comment fonctionne la commission de 10% ?',
    a: "Lorsqu'un client effectue une réservation, HotelsDZ prélève automatiquement une commission de 10% sur le montant total. Le reste (90%) est versé directement au propriétaire après confirmation du séjour.",
  },
  {
    q: 'Y a-t-il des frais pour inscrire mon hôtel ou maison ?',
    a: "Non, l'inscription et la mise en ligne de votre établissement sont totalement gratuites. Vous ne payez que lorsque vous recevez une réservation confirmée.",
  },
  {
    q: 'Quand et comment je reçois mon paiement ?',
    a: 'Le paiement est traité après le check-in du client. Les fonds sont virés sur votre compte bancaire (CIB) dans un délai de 2 à 5 jours ouvrés.',
  },
  {
    q: 'La commission est-elle prélevée sur les annulations ?',
    a: "Non. En cas d'annulation selon la politique d'annulation que vous avez définie, aucune commission n'est perçue sur les montants remboursés.",
  },
  {
    q: 'Les clients paient-ils des frais supplémentaires ?',
    a: "Une frais de service de 10% est ajoutée au prix affiché lors du paiement pour couvrir les services de la plateforme (sécurité, support, paiement en ligne).",
  },
];

/* ─── Feature list component ───────────────────────────────── */
function FeatureItem({ text }) {
  return (
    <li className="flex items-start gap-3 text-sm text-gray-600">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
      {text}
    </li>
  );
}

/* ─── Stat card (iOS emoji style) ──────────────────────────── */
function StatCard({ emoji, value, label, color }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-6 text-center shadow-card">
      <span
        className="grid h-14 w-14 place-items-center rounded-2xl text-3xl"
        style={{ background: `${color}18` }}
      >
        {emoji}
      </span>
      <p className="text-3xl font-extrabold text-ink">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

/* ─── FAQ item ──────────────────────────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left font-semibold text-ink transition hover:bg-gray-50"
      >
        {q}
        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-brand-500" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-gray-400" />
        )}
      </button>
      {open && (
        <div className="border-t border-gray-100 px-6 py-4 text-sm leading-relaxed text-gray-600">
          {a}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function PricingPage() {
  const [view, setView] = useState('owner'); // 'owner' | 'guest'

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-500 to-cyan-400 py-20 text-center text-white">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
          <Percent className="h-4 w-4" />
          Tarification simple &amp; transparente
        </span>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight drop-shadow-sm">
          Seulement <span className="text-yellow-300">10%</span> par réservation
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-brand-50">
          Aucun abonnement, aucun frais caché. Vous payez uniquement lorsque vous
          réalisez ou recevez une réservation confirmée.
        </p>

        {/* Toggle */}
        <div className="mt-8 inline-flex overflow-hidden rounded-full border border-white/30 bg-white/10 backdrop-blur-sm">
          <button
            onClick={() => setView('owner')}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold transition ${
              view === 'owner'
                ? 'bg-white text-brand-600 shadow'
                : 'text-white hover:bg-white/10'
            }`}
          >
            🏨 Je suis propriétaire
          </button>
          <button
            onClick={() => setView('guest')}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold transition ${
              view === 'guest'
                ? 'bg-white text-brand-600 shadow'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <User className="h-4 w-4" />
            Je suis client
          </button>
        </div>
      </section>

      {/* ── Main pricing cards ─────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        {view === 'owner' ? (
          <>
            <p className="mb-10 text-center text-gray-500">
              Rejoignez la plateforme gratuitement et commencez à recevoir des
              réservations dès aujourd&apos;hui.
            </p>
            <div className="grid gap-6 md:grid-cols-2">

              {/* Free listing card */}
              <div className="flex flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-2xl">
                    🏨
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-ink">Inscription gratuite</h2>
                    <p className="text-sm text-gray-400">Pour les propriétaires</p>
                  </div>
                </div>

                <div className="my-6 border-t border-dashed border-gray-100" />

                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold text-ink">0</span>
                  <span className="mb-1.5 text-2xl font-bold text-gray-400">DZD</span>
                  <span className="mb-1.5 text-sm text-gray-400">/ mois</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">Inscription &amp; mise en ligne offertes</p>

                <ul className="mt-6 flex flex-col gap-3">
                  {[
                    'Publiez votre hôtel ou maison gratuitement',
                    'Photos illimitées par annonce',
                    'Tableau de bord propriétaire dédié',
                    'Gestion des réservations en temps réel',
                    'Support client 7j/7',
                    'Visibilité dans les 58 wilayas',
                  ].map((f) => (
                    <FeatureItem key={f} text={f} />
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="mt-8 flex items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
                >
                  Inscrire mon établissement
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Commission card */}
              <div className="relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-cyan-500 p-8 text-white shadow-xl">
                {/* Popular badge */}
                <span className="absolute right-6 top-6 rounded-full bg-yellow-400 px-3 py-0.5 text-xs font-bold text-yellow-900">
                  Par réservation
                </span>

                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Percent className="h-6 w-6 text-white" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold">Commission unique</h2>
                    <p className="text-sm text-white/70">Seulement si vous gagnez</p>
                  </div>
                </div>

                <div className="my-6 border-t border-dashed border-white/20" />

                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold">10</span>
                  <span className="mb-1.5 text-3xl font-bold text-white/80">%</span>
                  <span className="mb-1.5 text-sm text-white/60">/ réservation</span>
                </div>
                <p className="mt-1 text-sm text-white/70">Prélevé sur le montant total de chaque séjour</p>

                {/* Example calculation */}
                <div className="my-6 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                    Exemple de calcul
                  </p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/80">Prix de la nuit</span>
                      <span className="font-semibold">5 000 DZD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Durée du séjour</span>
                      <span className="font-semibold">3 nuits</span>
                    </div>
                    <div className="flex justify-between border-t border-white/20 pt-1.5">
                      <span className="text-white/80">Total brut</span>
                      <span className="font-semibold">15 000 DZD</span>
                    </div>
                    <div className="flex justify-between text-yellow-300">
                      <span>Commission HotelsDZ (10%)</span>
                      <span className="font-bold">- 1 500 DZD</span>
                    </div>
                    <div className="flex justify-between border-t border-white/20 pt-1.5 text-base">
                      <span className="font-bold">Vous recevez</span>
                      <span className="font-extrabold">13 500 DZD</span>
                    </div>
                  </div>
                </div>

                <ul className="flex flex-col gap-3">
                  {[
                    'Zéro commission si pas de réservation',
                    'Paiement sécurisé CIB / EDAHABIA',
                    'Virement sous 2–5 jours ouvrés',
                    'Protection contre les impayés',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/90">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/owner/hotels/new"
                  className="mt-8 flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-brand-600 transition hover:bg-brand-50"
                >
                  Ajouter mon premier hôtel
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </>
        ) : (
          /* ── Guest view ── */
          <>
            <p className="mb-10 text-center text-gray-500">
              Réservez facilement et en toute sécurité avec une frais de service
              transparente.
            </p>
            <div className="grid gap-6 md:grid-cols-2">

              {/* Free browsing */}
              <div className="flex flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-500">
                    <User className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-ink">Navigation gratuite</h2>
                    <p className="text-sm text-gray-400">Parcourez sans engagement</p>
                  </div>
                </div>

                <div className="my-6 border-t border-dashed border-gray-100" />

                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold text-ink">0</span>
                  <span className="mb-1.5 text-2xl font-bold text-gray-400">DZD</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">Inscription &amp; recherche offertes</p>

                <ul className="mt-6 flex flex-col gap-3">
                  {[
                    'Accès à toutes les annonces en Algérie',
                    'Recherche avancée par wilaya / prix',
                    'Avis et notes vérifiés',
                    'Sauvegarde en favoris',
                    'Consultation des disponibilités',
                    'Aucun frais avant réservation',
                  ].map((f) => (
                    <FeatureItem key={f} text={f} />
                  ))}
                </ul>

                <Link
                  href="/hotels"
                  className="mt-8 flex items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
                >
                  Explorer les hôtels
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Service fee card */}
              <div className="relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-cyan-500 p-8 text-white shadow-xl">
                <span className="absolute right-6 top-6 rounded-full bg-yellow-400 px-3 py-0.5 text-xs font-bold text-yellow-900">
                  Frais de service
                </span>

                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/20">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold">Réservation sécurisée</h2>
                    <p className="text-sm text-white/70">Payez uniquement à la réservation</p>
                  </div>
                </div>

                <div className="my-6 border-t border-dashed border-white/20" />

                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold">10</span>
                  <span className="mb-1.5 text-3xl font-bold text-white/80">%</span>
                  <span className="mb-1.5 text-sm text-white/60">/ séjour</span>
                </div>
                <p className="mt-1 text-sm text-white/70">Frais de service inclus dans le total final</p>

                {/* Example calculation */}
                <div className="my-6 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                    Exemple de calcul
                  </p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/80">Prix affiché / nuit</span>
                      <span className="font-semibold">5 000 DZD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Durée du séjour</span>
                      <span className="font-semibold">3 nuits</span>
                    </div>
                    <div className="flex justify-between border-t border-white/20 pt-1.5">
                      <span className="text-white/80">Sous-total</span>
                      <span className="font-semibold">15 000 DZD</span>
                    </div>
                    <div className="flex justify-between text-yellow-300">
                      <span>Frais de service (10%)</span>
                      <span className="font-bold">+ 1 500 DZD</span>
                    </div>
                    <div className="flex justify-between border-t border-white/20 pt-1.5 text-base">
                      <span className="font-bold">Total à payer</span>
                      <span className="font-extrabold">16 500 DZD</span>
                    </div>
                  </div>
                </div>

                <ul className="flex flex-col gap-3">
                  {[
                    'Paiement sécurisé CIB / EDAHABIA',
                    'Confirmation instantanée de réservation',
                    'Protection en cas de litige',
                    'Support disponible 7j/7',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/90">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="mt-8 flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-brand-600 transition hover:bg-brand-50"
                >
                  Créer un compte gratuit
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold text-ink">
            Pourquoi choisir HotelsDZ ?
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard emoji="🏨" value="500+"  label="Établissements listés"     color="#00bcd4" />
            <StatCard emoji="⭐️" value="4.8/5" label="Note moyenne des clients"  color="#ffc107" />
            <StatCard emoji="📈" value="10%"   label="Commission tout compris"   color="#10b981" />
            <StatCard emoji="🎧" value="7j/7"  label="Support client disponible" color="#8b5cf6" />
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="mb-2 text-center text-3xl font-extrabold text-ink">
          Comment ça marche ?
        </h2>
        <p className="mb-10 text-center text-gray-500">En 3 étapes simples</p>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: '01',
              emoji: '🏠',
              title: 'Listez votre bien',
              desc: 'Créez votre compte propriétaire et publiez votre hôtel ou maison gratuitement avec photos et détails.',
              color: '#00bcd4',
            },
            {
              step: '02',
              emoji: '⚡️',
              title: 'Recevez des réservations',
              desc: 'Les clients trouvent votre annonce, réservent et paient en ligne en toute sécurité via CIB ou EDAHABIA.',
              color: '#ffc107',
            },
            {
              step: '03',
              emoji: '💰',
              title: 'Encaissez vos revenus',
              desc: 'Après le séjour, 90% du montant total vous est versé directement. HotelsDZ conserve 10% de commission.',
              color: '#10b981',
            },
          ].map(({ step, emoji, title, desc, color }) => (
            <div
              key={step}
              className="relative flex flex-col items-start rounded-3xl bg-white p-7 shadow-card"
            >
              <span
                className="absolute right-5 top-5 text-6xl font-black opacity-5"
                style={{ color }}
              >
                {step}
              </span>
              <span
                className="mb-4 grid h-12 w-12 place-items-center rounded-2xl text-2xl"
                style={{ background: `${color}18` }}
              >
                {emoji}
              </span>
              <h3 className="mb-2 font-bold text-ink">{title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-2 text-center text-3xl font-extrabold text-ink">
            Questions fréquentes
          </h2>
          <p className="mb-8 text-center text-gray-500">
            Tout ce que vous devez savoir sur notre tarification
          </p>
          <div className="flex flex-col gap-3">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-cyan-500 p-10 text-center text-white shadow-xl">
          <Percent className="mx-auto mb-4 h-10 w-10 opacity-80" />
          <h2 className="text-3xl font-extrabold">Prêt à commencer ?</h2>
          <p className="mx-auto mt-3 max-w-md text-brand-50">
            Rejoignez des centaines de propriétaires algériens et commencez à
            générer des revenus dès aujourd&apos;hui — gratuitement.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-full bg-white px-8 py-3 font-bold text-brand-600 shadow transition hover:bg-brand-50"
            >
              Inscrire mon établissement
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/40 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
