import { noIndex } from '@/lib/seo';

export const metadata = noIndex('Espace propriétaire');

export default function Layout({ children }) {
  return children;
}
