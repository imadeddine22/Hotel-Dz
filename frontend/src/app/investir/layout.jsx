import { apiGet } from '@/lib/seo';
import { InitialData } from '@/components/InitialData';
import { getLang, pageMeta } from '@/lib/i18n/server';
import { localized } from '@/lib/i18n/localizeData';

export function generateMetadata() {
  return pageMeta({
    path: '/investir',
    title: 'Investir en Algérie : terrains, locaux et projets à la recherche d’investisseurs',
    description:
      'Propriétaires de terrains, locaux ou bâtiments et investisseurs se rencontrent : commerces, résidences, hôtels, agriculture… Proposez votre projet ou trouvez un associé dans les 69 wilayas.',
  });
}

// First page of projects rendered on the server: crawlers see real projects and links to them
export default async function Layout({ children }) {
  const data = await apiGet('/projects?page=1&limit=12', { revalidate: 300 });
  return <InitialData value={localized(data, getLang())}>{children}</InitialData>;
}
