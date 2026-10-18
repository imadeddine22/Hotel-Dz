import { noIndex } from '@/lib/seo';

export const metadata = noIndex('Espace vendeur');

export default function Layout({ children }) {
  return children;
}
