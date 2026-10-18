import { noIndex } from '@/lib/seo';

export const metadata = noIndex('Mon profil');

export default function Layout({ children }) {
  return children;
}
