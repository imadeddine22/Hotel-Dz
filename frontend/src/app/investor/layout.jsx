import { noIndex } from '@/lib/seo';
import SpaceGate from '@/components/SpaceGate';

export const metadata = noIndex('Espace investisseur');

export default function Layout({ children }) {
  return <SpaceGate role="investor">{children}</SpaceGate>;
}
