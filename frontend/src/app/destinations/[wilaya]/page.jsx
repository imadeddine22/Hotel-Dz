import Link from 'next/link';
import WilayaClient from './WilayaClient';
import { apiGet, breadcrumbLd, faqLd, formatDZD, JsonLd, SITE_URL } from '@/lib/seo';
import { getWilayaInfo, getNeighbourWilayas, wilayaPath } from '@/lib/wilayaInfo';

const median = (nums) => {
  const s = nums.filter((n) => n > 0).sort((a, b) => a - b);
  if (!s.length) return 0;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

// Live, per-wilaya numbers: these are what make each destination page unique.
async function getWilayaStats(name) {
  const q = encodeURIComponent(name);
  const [hotels, houses, sales] = await Promise.all([
    apiGet(`/hotels?wilaya=${q}&limit=50`),
    apiGet(`/houses?wilaya=${q}&limit=50`),
    apiGet(`/sales?wilaya=${q}&limit=50`),
  ]);
  const hotelList = hotels?.hotels || [];
  const rated = hotelList.filter((h) => h.reviewsCount > 0);
  return {
    reachable: Boolean(hotels || houses || sales),
    hotels: hotels?.total ?? hotelList.length,
    houses: houses?.total ?? houses?.houses?.length ?? 0,
    sales: sales?.total ?? sales?.listings?.length ?? 0,
    medianNight: median((houses?.houses || []).map((h) => h.pricePerNight)),
    medianSale: median((sales?.listings || []).map((l) => l.price)),
    topHotel: rated.sort((a, b) => b.avgRating - a.avgRating)[0] || null,
    cities: [...new Set([...hotelList, ...(houses?.houses || [])].map((x) => x.city).filter(Boolean))].slice(0, 8),
  };
}

function buildFaqs(name, info, s) {
  const faqs = [
    {
      q: `Combien d'hôtels sont disponibles à ${name} sur HotelsDZ ?`,
      a: s.hotels
        ? `HotelsDZ référence actuellement ${s.hotels} hôtel${s.hotels > 1 ? 's' : ''} vérifié${s.hotels > 1 ? 's' : ''} dans la wilaya de ${name}, réservables en ligne avec paiement en dinars (CIB ou EDAHABIA).`
        : `Aucun hôtel n'est encore publié à ${name}. Les hôteliers de la wilaya peuvent inscrire leur établissement gratuitement sur HotelsDZ.`,
    },
    {
      q: `Quel est le prix d'une location de maison à ${name} ?`,
      a: s.medianNight
        ? `Le prix médian d'une maison ou d'un appartement en location à ${name} est de ${formatDZD(s.medianNight)} par nuit, calculé sur les ${s.houses} annonces publiées sur HotelsDZ.`
        : `Il n'y a pas encore assez d'annonces de location à ${name} pour calculer un prix moyen. Consultez la page régulièrement : de nouvelles maisons sont ajoutées chaque semaine.`,
    },
    {
      q: `Peut-on acheter un bien immobilier à ${name} via HotelsDZ ?`,
      a: s.sales
        ? `Oui, ${s.sales} bien${s.sales > 1 ? 's' : ''} à vendre ${s.sales > 1 ? 'sont' : 'est'} publié${s.sales > 1 ? 's' : ''} à ${name}${s.medianSale ? `, pour un prix médian de ${formatDZD(s.medianSale)}` : ''}. Chaque annonce est validée par notre équipe et le vendeur est contactable directement.`
        : `Aucun bien n'est actuellement en vente à ${name}. Les vendeurs peuvent publier une annonce après inscription sur HotelsDZ.`,
    },
  ];
  if (info) {
    faqs.push({
      q: `Quand partir à ${name} ?`,
      a: `${name} (wilaya n°${info.code}) fait partie de la région ${info.region.label}. ${info.region.blurb}`,
    });
  }
  return faqs;
}

export async function generateMetadata({ params }) {
  const name = decodeURIComponent(params.wilaya);
  const info = getWilayaInfo(name);
  const displayName = info?.name || name;
  const s = await getWilayaStats(displayName);
  const total = s.hotels + s.houses + s.sales;

  const parts = [];
  if (s.hotels) parts.push(`${s.hotels} hôtels`);
  if (s.houses) parts.push(`${s.houses} maisons à louer`);
  if (s.sales) parts.push(`${s.sales} biens à vendre`);

  return {
    title: `Hôtels, locations et maisons à vendre à ${displayName}`,
    description: parts.length
      ? `${parts.join(', ')} à ${displayName}. Comparez les prix, lisez les avis et réservez en ligne avec paiement CIB / EDAHABIA sur HotelsDZ.`
      : `Trouvez un hôtel, une maison à louer ou un bien à acheter à ${displayName}. Réservation en ligne et paiement en dinars sur HotelsDZ.`,
    alternates: { canonical: wilayaPath(displayName) },
    // Unknown wilaya, or no listings and no editorial content: keep it out of the index.
    robots: !info || (s.reachable && total === 0 && !info.highlights.length) ? { index: false, follow: true } : undefined,
    openGraph: { url: `${SITE_URL}${wilayaPath(displayName)}` },
  };
}

export default async function WilayaPage({ params }) {
  const name = decodeURIComponent(params.wilaya);
  const info = getWilayaInfo(name);
  const displayName = info?.name || name;
  const s = await getWilayaStats(displayName);
  const faqs = buildFaqs(displayName, info, s);
  const neighbours = getNeighbourWilayas(displayName);

  return (
    <WilayaClient>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: 'Accueil', path: '/' },
            { name: 'Destinations', path: '/destinations' },
            { name: displayName, path: wilayaPath(displayName) },
          ]),
          faqLd(faqs),
        ]}
      />

      <section className="mx-auto max-w-5xl px-4 pb-16 pt-4 text-slate-700" aria-labelledby="wilaya-guide">
        <nav aria-label="Fil d'Ariane" className="mb-4 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900">Accueil</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/destinations" className="hover:text-slate-900">Destinations</Link>
          <span aria-hidden="true"> / </span>
          <span className="text-slate-900">{displayName}</span>
        </nav>

        <h2 id="wilaya-guide" className="font-serif text-2xl font-bold text-slate-900 md:text-3xl">
          Séjourner, louer ou acheter à {displayName}
        </h2>

        <p className="mt-3 max-w-3xl leading-relaxed">
          {info ? `${displayName} est la wilaya n°${info.code} d'Algérie, dans la région ${info.region.label}. ` : ''}
          {s.hotels + s.houses + s.sales > 0
            ? `Sur HotelsDZ, vous y trouvez ${s.hotels} hôtel${s.hotels > 1 ? 's' : ''}, ${s.houses} maison${s.houses > 1 ? 's' : ''} à louer et ${s.sales} bien${s.sales > 1 ? 's' : ''} à vendre, tous vérifiés par notre équipe.`
            : `Les premières annonces de ${displayName} arrivent bientôt sur HotelsDZ. Hôteliers, propriétaires et vendeurs de la wilaya peuvent publier leur annonce dès maintenant.`}
          {s.cities.length > 0 && ` Annonces disponibles notamment à ${s.cities.join(', ')}.`}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Hôtels', value: s.hotels },
            { label: 'Locations', value: s.houses },
            { label: 'Prix médian / nuit', value: s.medianNight ? formatDZD(s.medianNight) : '—' },
            { label: 'Prix médian à la vente', value: s.medianSale ? formatDZD(s.medianSale) : '—' },
          ].map((st) => (
            <div key={st.label} className="rounded-xl border border-slate-200 bg-white p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{st.label}</dt>
              <dd className="mt-1 text-lg font-bold tabular-nums text-slate-900">{st.value}</dd>
            </div>
          ))}
        </dl>

        {s.topHotel && (
          <p className="mt-6">
            L'hôtel le mieux noté de la wilaya est{' '}
            <Link href={`/hotels/${s.topHotel._id}`} className="font-semibold text-cyan-700 underline-offset-2 hover:underline">
              {s.topHotel.name}
            </Link>{' '}
            ({Number(s.topHotel.avgRating).toFixed(1)}/5 sur {s.topHotel.reviewsCount} avis).
          </p>
        )}

        {info?.highlights.length > 0 && (
          <>
            <h3 className="mt-8 text-lg font-bold text-slate-900">À voir à {displayName}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {info.highlights.map((h) => <li key={h}>{h.charAt(0).toUpperCase() + h.slice(1)}</li>)}
            </ul>
          </>
        )}

        <h3 className="mt-8 text-lg font-bold text-slate-900">Questions fréquentes</h3>
        <div className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {faqs.map((f) => (
            <details key={f.q} className="group p-4">
              <summary className="cursor-pointer list-none font-semibold text-slate-900 marker:hidden">
                {f.q}
              </summary>
              <p className="mt-2 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>

        {neighbours.length > 0 && (
          <>
            <h3 className="mt-8 text-lg font-bold text-slate-900">Autres destinations — {info.region.label}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {neighbours.map((w) => (
                <li key={w}>
                  <Link
                    href={wilayaPath(w)}
                    className="inline-flex min-h-[44px] items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium hover:border-cyan-500 hover:text-cyan-700"
                  >
                    {w}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="mt-8 text-sm">
          Vous financez un achat à {displayName} ?{' '}
          <Link href="/outils/simulateur-credit-immobilier" className="font-semibold text-cyan-700 hover:underline">
            Simulez votre crédit immobilier
          </Link>{' '}
          ou{' '}
          <Link href="/outils/rentabilite-locative" className="font-semibold text-cyan-700 hover:underline">
            calculez la rentabilité d'une location
          </Link>.
        </p>
      </section>
    </WilayaClient>
  );
}
