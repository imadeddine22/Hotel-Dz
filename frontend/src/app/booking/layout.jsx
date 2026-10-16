import { noIndex } from '@/lib/seo';

export const metadata = noIndex('Réservation');

export default function Layout({ children }) {
  return children;
}
