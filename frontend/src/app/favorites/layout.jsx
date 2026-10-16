import { noIndex } from '@/lib/seo';

export const metadata = noIndex('Mes favoris');

export default function Layout({ children }) {
  return children;
}
