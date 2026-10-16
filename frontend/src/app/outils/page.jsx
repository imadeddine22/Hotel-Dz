import Link from 'next/link';
import { Calculator, TrendingUp, Wallet } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { breadcrumbLd, JsonLd, SITE_URL } from '@/lib/seo';
import { TOOLS } from './tools';

const ICONS = {
  'simulateur-credit-immobilier': Calculator,
  'rentabilite-locative': TrendingUp,
  'budget-sejour': Wallet,
};

export const metadata = {
  title: 'Outils gratuits : crédit immobilier, rentabilité, budget voyage',
  description:
    "Calculateurs gratuits en dinars pour acheter, louer ou voyager en Algérie : simulateur de crédit immobilier, rentabilité locative et budget de séjour.",
  alternates: { canonical: '/outils' },
};

export default function ToolsHub() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Outils gratuits Meskan dz',
            itemListElement: TOOLS.map((t, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: t.title,
              url: `${SITE_URL}/outils/${t.slug}`,
            })),
          },
          breadcrumbLd([
            { name: 'Accueil', path: '/' },
            { name: 'Outils', path: '/outils' },
          ]),
        ]}
      />
      <section className="mx-auto max-w-5xl px-4 py-12 text-slate-700">
        <h1 className="font-serif text-3xl font-bold text-slate-900 md:text-4xl">Outils gratuits</h1>
        <p className="mt-3 max-w-2xl leading-relaxed">
          Des calculateurs simples, en dinars et sans inscription, pour préparer un achat immobilier, évaluer un
          investissement locatif ou budgéter vos vacances en Algérie.
        </p>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {TOOLS.map((t) => {
            const Icon = ICONS[t.slug];
            return (
              <li key={t.slug}>
                <Link
                  href={`/outils/${t.slug}`}
                  className="flex h-full flex-col rounded-2xl border border-slate-200 p-5 transition-colors hover:border-cyan-600"
                >
                  <Icon className="h-6 w-6 text-cyan-700" aria-hidden="true" />
                  <h2 className="mt-3 text-lg font-bold text-slate-900">{t.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed">{t.short}</p>
                  <span className="mt-auto pt-4 text-sm font-semibold text-cyan-700">Utiliser l'outil →</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      <Footer />
    </main>
  );
}
