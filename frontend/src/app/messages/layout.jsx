import { noIndex } from '@/lib/seo';

export const metadata = noIndex('Messages');

export default function Layout({ children }) {
  return children;
}
