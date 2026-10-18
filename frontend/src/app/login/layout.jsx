import { noIndex } from '@/lib/seo';

export const metadata = noIndex('Connexion');

export default function Layout({ children }) {
  return children;
}
