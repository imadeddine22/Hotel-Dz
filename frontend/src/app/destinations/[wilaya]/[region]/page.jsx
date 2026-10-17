import { notFound } from 'next/navigation';
import Link from '@/components/LocaleLink';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { apiGet, breadcrumbLd, faqLd, formatDZD, JsonLd, absoluteImage } from '@/lib/seo';
import { COUNTRIES, ENABLED_COUNTRIES, countryName } from '@/lib/countries';
import { destinationPath, slugify } from '@/lib/wilayaInfo';
import { getT, pageMeta } from '@/lib/i18n/server';
import { localePath } from '@/lib/i18n/locale';
import { localized } from '@/lib/i18n/localizeData';

// /destinations/tn/sousse, /destinations/ma/marrakech — destination pages outside Algeria
// (Algerian wilayas keep /destinations/<wilaya>, see ../page.jsx).

function resolve(params) {
  const country = COUNTRIES[String(params.wilaya || '').toUpperCase()];
  if (!country || country.code === 'DZ' || !ENABLED_COUNTRIES.includes(country.code)) return null;
  const region = country.regions.find((r) => slugify(r.name) === params.region);
  return region ? { country, region } : null;
}

const median = (nums) => {
  const s = nums.filter((n) => n > 0).sort((a, b) => a - b);
  if (!s.length) return 0;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

async function getListings(country, region, lang) {
  const q = `country=${country.code}&wilaya=${encodeURIComponent(region.name)}&limit=24`;
  const [hotels, houses, sales] = await Promise.all([apiGet(`/hotels?${q}`), apiGet(`/houses?${q}`), apiGet(`/sales?${q}`)]);
  return localized(
    {
      hotels: hotels?.hotels || [],
      houses: houses?.houses || [],
      sales: sales?.listings || [],
      reachable: Boolean(hotels || houses || sales),
    },
    lang
  );
}

export async function generateMetadata({ params }) {
  const r = resolve(params);
  if (!r) return { robots: { index: false, follow: true } };
  const { t, lang } = getT();
  const data = await getListings(r.country, r.region, lang);
  const total = data.hotels.length + data.houses.length + data.sales.length;
  const vars = { name: t(r.region.name), country: countryName(r.country.code, lang) };
  return pageMeta({
    path: destinationPath(r.region.name, r.country.code),
    title: t('Hôtels et locations à {name}, {country}', vars),
    description: t('Hôtels, maisons à louer et biens à vendre à {name} ({country}) : annonces vérifiées, prix en {currency}, réservation gratuite et paiement sur place.', { ...vars, currency: r.country.currency }),
    // no listings yet: keep the page out of the index (thin content)
    robots: data.reachable && total === 0 ? { index: false, follow: true } : undefined,
  });
}

export default async function RegionPage({ params }) {
  const r = resolve(params);
  if (!r) notFound();
  const { t, lang } = getT();
  const { country, region } = r;
  const data = await getListings(country, region, lang);
  const name = t(region.name);
  const cName = countryName(country.code, lang);
  const nightly = median(data.houses.map((h) => h.pricePerNight));
  const hotelFrom = median(data.hotels.map((h) => h.price));
  const total = data.hotels.length + data.houses.length + data.sales.length;

  const faqs = [
    {
      q: t('Combien coûte une nuit à {name} ?', { name }),
      a: nightly || hotelFrom
        ? t('Sur Meskan dz, une maison ou un appartement à {name} coûte en médiane {night} par nuit ; les hôtels démarrent autour de {hotel}. Les prix sont affichés et payés en {currency}.', {
            name, night: nightly ? formatDZD(nightly, country.currency) : '—', hotel: hotelFrom ? formatDZD(hotelFrom, country.currency) : '—', currency: country.currency,
          })
        : t('Les premières annonces de {name} arrivent bientôt sur Meskan dz. Les prix y seront affichés en {currency}.', { name, currency: country.currency }),
    },
    {
      q: t('Comment payer un séjour à {name} ?', { name }),
      a: t("La réservation sur Meskan dz est gratuite : l'établissement confirme votre demande, puis vous payez sur place à l'arrivée, en {currency}. Aucune carte bancaire internationale n'est nécessaire.", { currency: country.currency }),
    },
  ];

  const path = destinationPath(region.name, country.code);
  const Section = ({ title, items, href, price }) =>
    items.length > 0 && (
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((x) => (
            <li key={x._id}>
              <Link href={href(x)} className="block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md">
                {x.images?.[0] && <img src={absoluteImage(x.images[0])} alt={x.name || x.title} loading="lazy" className="h-40 w-full object-cover" />}
                <div className="p-4">
                  <h3 className="font-bold text-slate-900">{x.name || x.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{t(x.city)}</p>
                  <p className="mt-2 font-extrabold text-brand-600">{price(x)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <JsonLd
        data={[
          breadcrumbLd([
            { name: t('Accueil'), path: localePath(lang, '/') },
            { name: t('Destinations'), path: localePath(lang, '/destinations') },
            { name: `${name}, ${cName}`, path: localePath(lang, path) },
          ]),
          faqLd(faqs),
        ]}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 text-slate-700 sm:px-6">
        <nav aria-label={t("Fil d'Ariane")} className="mb-4 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900">{t('Accueil')}</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/destinations" className="hover:text-slate-900">{t('Destinations')}</Link>
          <span aria-hidden="true"> / </span>
          <span className="text-slate-900">{cName}</span>
        </nav>
        <h1 className="text-3xl font-black text-slate-900 md:text-4xl">{t('Hôtels et locations à {name}, {country}', { name, country: cName })}</h1>
        <p className="mt-4 max-w-3xl leading-relaxed">
          {total > 0
            ? t('{name} ({country}) sur Meskan dz : {hotels} hôtel(s), {houses} location(s) et {sales} bien(s) à vendre, avec des prix en {currency}.', {
                name, country: cName, hotels: data.hotels.length, houses: data.houses.length, sales: data.sales.length, currency: country.currency,
              })
            : t('Les premières annonces de {name} arrivent bientôt sur Meskan dz. Hôteliers et propriétaires peuvent publier leur annonce dès maintenant.', { name })}
        </p>

        <Section title={t('Hôtels')} items={data.hotels} href={(h) => `/hotels/${h._id}`} price={(h) => (h.price ? `${t('À partir de')} ${formatDZD(h.price, h.currency)}` : t('Voir les chambres'))} />
        <Section title={t('Locations')} items={data.houses} href={(h) => `/houses/${h._id}`} price={(h) => `${formatDZD(h.pricePerNight, h.currency)} ${t('/ nuit')}`} />
        <Section title={t('Ventes')} items={data.sales} href={(s) => `/sales/${s._id}`} price={(s) => formatDZD(s.price, s.currency)} />

        <section className="mt-12" aria-labelledby="faq">
          <h2 id="faq" className="text-2xl font-bold text-slate-900">{t('Questions fréquentes')}</h2>
          <div className="mt-4 space-y-4">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-semibold text-slate-900">{f.q}</h3>
                <p className="mt-1 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
