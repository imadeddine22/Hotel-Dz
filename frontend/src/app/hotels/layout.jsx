import { apiGet } from '@/lib/seo';
import { InitialData } from '@/components/InitialData';
import { getLang, pageMeta } from '@/lib/i18n/server';
import { localized } from '@/lib/i18n/localizeData';

export function generateMetadata() {
  return pageMeta({
    path: '/hotels',
    title: 'Hôtels en Algérie — Réservez dans les 69 wilayas',
    description: "Hôtels vérifiés à Alger, Oran, Constantine, Béjaïa et dans toute l'Algérie : avis clients, prix en dinars, réservation gratuite, paiement sur place.",
  });
}

// First page of listings rendered on the server: crawlers see real listings and links to them
export default async function Layout({ children }) {
  const data = await apiGet('/hotels', { revalidate: 300 });
  return <InitialData value={localized(data, getLang())}>{children}</InitialData>;
}
