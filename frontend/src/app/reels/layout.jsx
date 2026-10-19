import { pageMeta } from '@/lib/i18n/server';

export function generateMetadata() {
  return pageMeta({
    path: '/reels',
    title: 'Reels : hôtels, locations et biens à vendre en vidéo',
    description: 'Découvrez en vidéo les hôtels, maisons à louer et biens à vendre en Algérie. Faites défiler, choisissez une catégorie, partagez et réservez sur Meskan.',
  });
}

export default function Layout({ children }) {
  return children;
}
