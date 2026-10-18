import { pageMeta } from '@/lib/i18n/server';
export function generateMetadata() {
  return pageMeta({
    path: '/pricing',
    title: 'Tarifs pour propriétaires et vendeurs',
    description: "Publiez votre hôtel, votre maison à louer ou votre bien à vendre sur Meskan. Découvrez nos formules et leurs tarifs en dinars.",
  });
}

export default function Layout({ children }) {
  return children;
}
