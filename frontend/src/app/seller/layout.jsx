import { noIndex } from '@/lib/seo';
import SpaceGate from '@/components/SpaceGate';

export const metadata = noIndex('Espace vendeur');

export default function Layout({ children }) {
  return <SpaceGate role="seller">{children}</SpaceGate>;
}
