import './admin.css';
import AdminLayout from '@/components/AdminLayout';

export const metadata = {
  title: 'Admin — HotelsDZ',
  description: 'Panneau d\'administration HotelsDZ',
};

export default function AdminRootLayout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
