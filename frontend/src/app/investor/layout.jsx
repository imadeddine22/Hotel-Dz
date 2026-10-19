import { noIndex } from '@/lib/seo';

export const metadata = noIndex('Espace investisseur');

export default function Layout({ children }) {
  return children;
}
