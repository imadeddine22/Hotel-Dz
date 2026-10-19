import { noIndex } from '@/lib/seo';

export const metadata = noIndex('Mes projets');

export default function Layout({ children }) {
  return children;
}
