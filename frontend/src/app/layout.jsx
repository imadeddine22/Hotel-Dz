import { Poppins, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import AuthInit from '@/components/AuthInit';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata = {
  title: 'HotelsDZ — Meilleurs hôtels d\'Algérie',
  description:
    'Trouvez et réservez les meilleurs hôtels dans les 58 wilayas d\'Algérie. Paiement en DZD via CIB / EDAHABIA.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${poppins.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased">
        <AuthInit />
        {children}
      </body>
    </html>
  );
}
