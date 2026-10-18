import { pageMeta } from '@/lib/i18n/server';
export function generateMetadata() {
  return pageMeta({
    path: '/contact',
    title: 'Contact et aide',
    description: "Une question sur une réservation, un paiement ou une annonce ? Contactez l'équipe Meskan par e-mail, téléphone ou formulaire.",
  });
}

export default function Layout({ children }) {
  return children;
}
