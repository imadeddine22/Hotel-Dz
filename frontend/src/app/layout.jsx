import './globals.css';
import AuthInit from '@/components/AuthInit';

export const metadata = {
  title: 'HotelsDZ — Meilleurs hôtels d\'Algérie',
  description:
    'Trouvez et réservez les meilleurs hôtels dans les 58 wilayas d\'Algérie. Paiement en DZD via CIB / EDAHABIA.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        <AuthInit />
        {children}
      </body>
    </html>
  );
}
