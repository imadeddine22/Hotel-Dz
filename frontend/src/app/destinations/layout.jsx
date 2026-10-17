import { pageMeta } from '@/lib/i18n/server';
export function generateMetadata() {
  return pageMeta({
    path: '/destinations',
    title: 'Destinations en Algérie — Les 69 wilayas',
    description: "Explorez les 69 wilayas d'Algérie : hôtels, locations de vacances et biens à vendre, prix médians et conseils pour chaque destination.",
  });
}

export default function Layout({ children }) {
  return children;
}
