import { noIndex } from '@/lib/seo';

export const metadata = noIndex('Mes réservations');

export default function Layout({ children }) {
  return children;
}
