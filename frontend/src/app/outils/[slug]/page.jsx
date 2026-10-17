import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MortgageCalculator from '@/components/tools/MortgageCalculator';
import RentalYieldCalculator from '@/components/tools/RentalYieldCalculator';
import TripBudgetCalculator from '@/components/tools/TripBudgetCalculator';
import { breadcrumbLd, faqLd, JsonLd, SITE_URL } from '@/lib/seo';
import { getTool, TOOLS } from '../tools';

import T from '@/components/T';
const UPDATED = '2026-10-16';

// Per-tool editorial content: intro answer block, method and FAQ.
const CONTENT = {
  'simulateur-credit-immobilier': {
    Calculator: MortgageCalculator,
    metaTitle: 'Simulateur de crédit immobilier en Algérie (DZD)',
    description:
      'Calculez gratuitement la mensualité de votre crédit immobilier en dinars, le coût total des intérêts et le revenu nécessaire selon le taux et la durée.',
    intro:
      "Ce simulateur calcule la mensualité d'un crédit immobilier à taux fixe à partir du prix du bien, de votre apport, du taux annuel et de la durée. Il indique aussi le coût total des intérêts et le revenu mensuel conseillé pour que la mensualité respecte le taux d'endettement accepté par votre banque.",
    method: [
      'Montant emprunté = prix du bien − apport personnel.',
      'Mensualité = C × t / (1 − (1 + t)^−n), où C est le montant emprunté, t le taux mensuel (taux annuel ÷ 12) et n le nombre de mois.',
      'Coût des intérêts = mensualité × n − montant emprunté.',
      'Revenu conseillé = mensualité ÷ taux d’endettement maximum.',
    ],
    faqs: [
      {
        q: 'Comment est calculée la mensualité d’un crédit immobilier ?',
        a: "La mensualité d'un prêt à taux fixe se calcule avec la formule d'amortissement constant : C × t / (1 − (1 + t)^−n). Avec 9 600 000 DA empruntés à 6 % sur 20 ans, la mensualité est d'environ 68 800 DA.",
      },
      {
        q: 'Quelle durée choisir pour un crédit immobilier ?',
        a: "Plus la durée est longue, plus la mensualité baisse, mais plus le coût total des intérêts augmente. Comparez plusieurs durées dans le simulateur : passer de 15 à 25 ans réduit la mensualité mais peut presque doubler les intérêts payés.",
      },
      {
        q: 'Le résultat du simulateur est-il une offre de prêt ?',
        a: "Non. Le simulateur donne une estimation indicative. Le taux, la durée maximale, l'assurance et les frais de dossier dépendent de votre banque et de votre profil : demandez une offre écrite avant de vous engager.",
      },
    ],
  },
  'rentabilite-locative': {
    Calculator: RentalYieldCalculator,
    metaTitle: 'Calculateur de rentabilité locative (location à la nuit)',
    description:
      "Estimez le rendement brut et net d'une maison ou d'un appartement loué à la nuit en Algérie, et le nombre d'années nécessaires pour amortir l'achat.",
    intro:
      "Ce calculateur estime ce que rapporte un logement loué à la nuit. À partir du prix d'achat, des frais, du prix par nuit, du taux d'occupation et des charges, il donne le revenu annuel, le rendement brut et net, et la durée d'amortissement de l'investissement.",
    method: [
      'Investissement total = prix d’achat × (1 + frais d’acquisition) + travaux et ameublement.',
      'Revenu annuel = 365 × taux d’occupation × prix par nuit.',
      'Rendement brut = revenu annuel ÷ investissement total.',
      'Rendement net = (revenu annuel − charges × 12) ÷ investissement total.',
      'Durée d’amortissement = investissement total ÷ bénéfice net annuel.',
    ],
    faqs: [
      {
        q: 'Quelle différence entre rendement brut et rendement net ?',
        a: 'Le rendement brut compare uniquement les loyers encaissés au prix total. Le rendement net retire en plus les charges récurrentes (énergie, ménage, entretien) : c’est l’indicateur qui reflète ce que vous gagnez vraiment.',
      },
      {
        q: 'Quel taux d’occupation retenir ?',
        a: "Restez prudent : un logement de vacances est rarement loué toute l'année. Sur le littoral, la demande se concentre en été ; dans le Sud, d'octobre à avril. Testez plusieurs hypothèses, par exemple 30 %, 40 % et 60 %.",
      },
      {
        q: 'Meskan dz prend-il une commission sur les locations ?',
        a: 'Consultez la page Tarifs pour connaître les formules en vigueur pour les propriétaires. Si une commission s’applique, ajoutez-la à vos charges mensuelles dans le calculateur.',
      },
    ],
  },
  'budget-sejour': {
    Calculator: TripBudgetCalculator,
    metaTitle: 'Calculateur de budget de voyage en Algérie',
    description:
      "Estimez le budget total d'un séjour en Algérie en dinars : hébergement, repas, transport et activités, avec le coût par personne et par jour.",
    intro:
      "Ce calculateur estime le coût d'un séjour en additionnant l'hébergement (prix par nuit × nombre de nuits), les repas (par jour et par personne), le transport et les activités. Il affiche le budget total, le coût par personne et le coût moyen par jour.",
    method: [
      'Hébergement = nombre de nuits × prix par nuit.',
      'Repas = (nombre de nuits + 1) × nombre de voyageurs × budget repas par jour.',
      'Budget total = hébergement + repas + transport + activités.',
      'Par personne = budget total ÷ nombre de voyageurs.',
    ],
    faqs: [
      {
        q: 'Comment réduire le budget d’un séjour ?',
        a: "Partir hors saison, réserver tôt et choisir une maison avec cuisine pour un groupe ou une famille réduisent nettement le coût. Comparez le prix par personne d'un hôtel et d'une location dans le calculateur.",
      },
      {
        q: 'Pourquoi compter une journée de repas de plus que de nuits ?',
        a: 'Un séjour de 5 nuits couvre 6 jours, du jour d’arrivée au jour de départ. Le calculateur compte donc les repas sur nuits + 1 jours.',
      },
      {
        q: 'Comment se paie un hébergement réservé sur Meskan dz ?',
        a: 'La réservation est gratuite : l’établissement confirme votre demande, puis vous payez en dinars directement sur place à votre arrivée.',
      },
    ],
  },
};

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }) {
  const c = CONTENT[params.slug];
  if (!c) return {};
  return {
    title: c.metaTitle,
    description: c.description,
    alternates: { canonical: `/outils/${params.slug}` },
    openGraph: { title: c.metaTitle, description: c.description, url: `${SITE_URL}/outils/${params.slug}` },
  };
}

export default function ToolPage({ params }) {
  const tool = getTool(params.slug);
  const c = CONTENT[params.slug];
  if (!tool || !c) notFound();
  const { Calculator } = c;
  const others = TOOLS.filter((t) => t.slug !== tool.slug);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: tool.title,
            description: c.description,
            url: `${SITE_URL}/outils/${tool.slug}`,
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Web',
            inLanguage: 'fr',
            dateModified: UPDATED,
            offers: { '@type': 'Offer', price: 0, priceCurrency: 'DZD' },
          },
          faqLd(c.faqs),
          breadcrumbLd([
            { name: 'Accueil', path: '/' },
            { name: 'Outils', path: '/outils' },
            { name: tool.title, path: `/outils/${tool.slug}` },
          ]),
        ]}
      />

      <article className="mx-auto max-w-5xl px-4 py-10 text-slate-700">
        <nav aria-label="Fil d'Ariane" className="mb-4 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900"><T>Accueil</T></Link>
          <span aria-hidden="true"> / </span>
          <Link href="/outils" className="hover:text-slate-900"><T>Outils</T></Link>
          <span aria-hidden="true"> / </span>
          <span className="text-slate-900"><T>{tool.title}</T></span>
        </nav>

        <h1 className="font-serif text-3xl font-bold text-slate-900 md:text-4xl"><T>{tool.title}</T></h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed"><T>{c.intro}</T></p>
        <p className="mt-2 text-xs text-slate-500">
          <T>Outil gratuit, sans inscription. Mis à jour le</T> <time dateTime={UPDATED}><T>16 octobre 2026</T></time>.
        </p>

        <div className="mt-8">
          <Calculator />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={tool.cta.href}
            className="inline-flex min-h-[44px] items-center rounded-full bg-slate-900 px-6 text-sm font-bold text-white hover:bg-slate-800"
          >
            <T>{tool.cta.label}</T>
          </Link>
        </div>

        <h2 className="mt-12 text-xl font-bold text-slate-900"><T>Comment fonctionne le calcul ?</T></h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          {c.method.map((m) => <li key={m}><T>{m}</T></li>)}
        </ol>

        <h2 className="mt-10 text-xl font-bold text-slate-900"><T>Questions fréquentes</T></h2>
        <div className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200">
          {c.faqs.map((f) => (
            <details key={f.q} className="p-4">
              <summary className="cursor-pointer list-none font-semibold text-slate-900"><T>{f.q}</T></summary>
              <p className="mt-2 leading-relaxed"><T>{f.a}</T></p>
            </details>
          ))}
        </div>

        <h2 className="mt-10 text-xl font-bold text-slate-900"><T>Autres outils gratuits</T></h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {others.map((t) => (
            <li key={t.slug}>
              <Link href={`/outils/${t.slug}`} className="block rounded-xl border border-slate-200 p-4 hover:border-cyan-600">
                <span className="font-semibold text-slate-900"><T>{t.title}</T></span>
                <span className="mt-1 block text-sm"><T>{t.short}</T></span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-xs text-slate-500">
          <T>Les résultats sont des estimations fournies à titre indicatif et ne constituent pas un conseil financier.</T>
        </p>
      </article>
      <Footer />
    </main>
  );
}
