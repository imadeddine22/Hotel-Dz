import { noIndex } from '@/lib/seo';
import SpaceGate from '@/components/SpaceGate';

export const metadata = noIndex('Espace propriétaire');

export default function Layout({ children }) {
  return <SpaceGate role="owner">{children}</SpaceGate>;
}
