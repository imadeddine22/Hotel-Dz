import './globals.css';
import AuthInit from '@/components/AuthInit';
import { JsonLd, SITE_NAME, SITE_URL } from '@/lib/seo';

const DESCRIPTION =
  "Réservez un hôtel, louez une maison ou achetez un bien immobilier dans les 69 wilayas d'Algérie. Annonces vérifiées, paiement en DZD via CIB / EDAHABIA.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HotelsDZ — Hôtels, locations et immobilier en Algérie",
    template: '%s | HotelsDZ',
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'fr_DZ',
    alternateLocale: ['ar_DZ'],
    url: SITE_URL,
    title: "HotelsDZ — Hôtels, locations et immobilier en Algérie",
    description: DESCRIPTION,
    images: [{ url: '/hand_holding_house.png', alt: 'HotelsDZ' }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

const siteLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/hand_holding_house.png`,
    email: 'support@hotelsdz.dz',
    areaServed: { '@type': 'Country', name: 'Algérie' },
    address: { '@type': 'PostalAddress', addressLocality: 'Alger', addressCountry: 'DZ' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: ['fr', 'ar'],
  },
];

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <JsonLd data={siteLd} />
        <AuthInit />
        <div id="main-content" tabIndex={-1} className="outline-none">
          {children}
        </div>
      </body>
    </html>
  );
}
