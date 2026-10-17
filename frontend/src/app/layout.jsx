import localFont from 'next/font/local';
import './globals.css';
import AuthInit from '@/components/AuthInit';

// Fredoka (variable, 300–700) shipped with the app from @fontsource-variable/fredoka, so neither
// the build nor visitors depend on Google Fonts. The latin file covers French accents (é, ï, â…).
const fredoka = localFont({
  src: '../../node_modules/@fontsource-variable/fredoka/files/fredoka-latin-wght-normal.woff2',
  weight: '300 700',
  display: 'swap',
  variable: '--font-fredoka',
  fallback: ['system-ui', 'Segoe UI', 'Tahoma', 'sans-serif'],
});
import { JsonLd, SITE_NAME, SITE_URL } from '@/lib/seo';

import T from '@/components/T';
const DESCRIPTION =
  "Réservez un hôtel, louez une maison ou achetez un bien immobilier dans les 69 wilayas d'Algérie. Annonces vérifiées, réservation gratuite et paiement sur place.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Meskan dz — Hôtels, locations et immobilier en Algérie",
    template: '%s | Meskan dz',
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
    title: "Meskan dz — Hôtels, locations et immobilier en Algérie",
    description: DESCRIPTION,
    images: [{ url: '/hand_holding_house.png', alt: 'Meskan dz' }],
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
    logo: `${SITE_URL}/brand/meskan-mark.png`,
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
    <html lang="fr" className={fredoka.variable}>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">
          <T>Aller au contenu principal</T>
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
