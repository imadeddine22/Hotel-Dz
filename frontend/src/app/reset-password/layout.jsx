import { noIndex } from '@/lib/seo';

// no-referrer: the token in the URL never leaks to other sites
export const metadata = { ...noIndex('Nouveau mot de passe'), referrer: 'no-referrer' };

export default function Layout({ children }) {
  return children;
}
