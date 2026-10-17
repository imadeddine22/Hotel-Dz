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
import { UrlLangProvider } from '@/components/UrlLang';
import { translate } from '@/lib/i18n';
import { getLang, getUrlLang, pageMeta } from '@/lib/i18n/server';
const DESCRIPTION =
  "Hôtels, maisons à louer et biens à vendre dans les 69 wilayas d'Algérie. Annonces vérifiées, réservation gratuite, paiement sur place.";

const HOME_TITLE = 'Meskan dz — Hôtels, locations et immobilier en Algérie';

// Per language: /ar and /en are their own indexable versions (canonical + hreflang)
export function generateMetadata() {
  const lang = getLang();
  const brand = translate(lang, SITE_NAME);
  const home = pageMeta({ path: '/', title: HOME_TITLE, description: DESCRIPTION });
  return {
    metadataBase: new URL(SITE_URL),
    ...home,
    title: { default: home.title.absolute, template: `%s | ${brand}` },
    applicationName: brand,
    openGraph: {
      ...home.openGraph,
      type: 'website',
      siteName: brand,
      images: [{ url: '/hand_holding_house.png', alt: brand }],
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    formatDetection: { telephone: false },
  };
}

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
    inLanguage: ['fr', 'ar', 'en'],
  },
];

export default function RootLayout({ children }) {
  const lang = getLang();
  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className={fredoka.variable}>
      <body className="font-sans antialiased">
        <UrlLangProvider lang={getUrlLang()}>
        <a href="#main-content" className="skip-link">
          <T>Aller au contenu principal</T>
        </a>
        <JsonLd data={siteLd} />
        <AuthInit />
        <div id="main-content" tabIndex={-1} className="outline-none">
          {children}
        </div>
        </UrlLangProvider>
      </body>
    </html>
  );
}
