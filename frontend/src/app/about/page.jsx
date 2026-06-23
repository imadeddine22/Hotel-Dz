import Link from 'next/link';
import { Building2, ShieldCheck, CreditCard, MapPin, Star, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'À propos — HotelsDZ',
  description:
    "HotelsDZ connecte les hôteliers algériens aux voyageurs : réservation simple, paiement en DZD, hôtels vérifiés dans les 58 wilayas.",
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Hôtels vérifiés',
    text: "Chaque établissement est examiné et approuvé par notre équipe avant d'être publié sur la plateforme.",
  },
  {
    icon: CreditCard,
    title: 'Paiement en DZD',
    text: 'Payez en toute sécurité avec votre carte CIB ou EDAHABIA via Chargily Pay — sans devise étrangère.',
  },
  {
    icon: MapPin,
    title: '58 wilayas couvertes',
    text: "D'Alger à Tamanrasset, trouvez un séjour authentique partout en Algérie.",
  },
  {
    icon: Star,
    title: 'Avis authentiques',
    text: 'Seuls les clients ayant réellement séjourné peuvent laisser un avis — pas de faux commentaires.',
  },
];

const STATS = [
  { value: '650+', label: 'Hôtels partenaires' },
  { value: '58', label: 'Wilayas couvertes' },
  { value: '12 000+', label: 'Nuits réservées' },
  { value: '4.6/5', label: 'Satisfaction moyenne' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            Le séjour algérien, <span className="text-brand-400">simplifié</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-200">
            HotelsDZ connecte les hôteliers d&apos;Algérie aux voyageurs qui cherchent
            une adresse de confiance — réservation en ligne, paiement en dinar, avis vérifiés.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl bg-white p-6 text-center shadow-card">
              <p className="text-3xl font-extrabold text-brand-600">{s.value}</p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold text-ink">Notre mission</h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              Le tourisme algérien mérite des outils modernes. Trop d&apos;hôtels
              n&apos;existent pas en ligne, et trop de voyageurs réservent encore
              par téléphone, sans garantie. HotelsDZ change cela : une vitrine
              professionnelle pour chaque hôtelier, et une réservation transparente
              pour chaque client.
            </p>
            <p className="mt-3 leading-relaxed text-gray-600">
              Vous êtes hôtelier ? Inscrivez votre établissement gratuitement,
              gérez vos chambres et vos réservations depuis un tableau de bord simple.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
              >
                Inscrire mon hôtel
              </Link>
              <Link
                href="/hotels"
                className="rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Explorer les hôtels
              </Link>
            </div>
          </div>
          <div className="relative h-80 overflow-hidden rounded-2xl shadow-card">
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
              alt="Hôtel en Algérie"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow">
            <Building2 className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold text-ink">Pourquoi HotelsDZ ?</h2>
            <p className="text-sm text-gray-500">Ce qui nous rend différents</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl bg-white p-6 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <v.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-bold text-ink">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-r from-brand-500 to-brand-700 p-10 text-center text-white sm:p-14">
          <Users className="h-10 w-10" />
          <h2 className="text-3xl font-extrabold">Rejoignez l&apos;aventure</h2>
          <p className="max-w-xl text-brand-50">
            Que vous soyez voyageur ou hôtelier, HotelsDZ est fait pour vous.
            Créez votre compte en moins d&apos;une minute.
          </p>
          <Link
            href="/register"
            className="mt-2 rounded-full bg-white px-8 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Créer un compte
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
