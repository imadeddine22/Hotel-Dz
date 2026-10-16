import './admin.css';
import AdminLayout from '@/components/AdminLayout';

export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
  description: 'Panneau d\'administration Meskan dz',
};

export default function AdminRootLayout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
