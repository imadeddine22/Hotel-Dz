import { noIndex } from '@/lib/seo';

export const metadata = noIndex('Paiement');

export default function Layout({ children }) {
  return children;
}
