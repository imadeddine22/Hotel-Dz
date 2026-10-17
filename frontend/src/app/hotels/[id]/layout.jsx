import { absoluteImage, apiGetListing, NOT_FOUND, breadcrumbLd, hotelLd, JsonLd, truncate } from '@/lib/seo';
import { wilayaPath } from '@/lib/wilayaInfo';
import { getT, pageMeta } from '@/lib/i18n/server';
import { localized } from '@/lib/i18n/localizeData';
import { InitialData } from '@/components/InitialData';

// NOT_FOUND = doesn't exist or isn't public yet (an owner previewing a pending listing): the page
// still renders in the browser, but must never be indexed
const getHotel = async (id) => {
  const data = await apiGetListing(`/hotels/${encodeURIComponent(id)}`);
  if (data === NOT_FOUND) return { notFound: true };
  return localized(data, getT().lang); // /ar, /en: the listing's machine translation
};

export async function generateMetadata({ params }) {
  const data = await getHotel(params.id);
  const hotel = data?.hotel;
  if (!hotel) {
    // not found / not public → noindex; API unreachable → stay indexable (transient failure)
    return { title: 'Hôtel en Algérie', alternates: { canonical: `/hotels/${params.id}` }, robots: data?.notFound ? { index: false, follow: true } : undefined };
  }

  const { t } = getT();
  const place = { name: hotel.name, city: t(hotel.city), wilaya: t(hotel.wilaya) };
  const stars = hotel.starRating ? ` ${hotel.starRating}★` : '';
  const title = t('{name}{stars} à {city} — Réservation', { ...place, stars });
  const description =
    truncate(hotel.description, 155) ||
    t('Réservez {name} à {city} ({wilaya}). Chambres, prix, avis clients. Réservation gratuite, paiement sur place.', place);
  const images = (hotel.images || []).slice(0, 1).map(absoluteImage);

  const meta = pageMeta({
    path: `/hotels/${hotel._id}`,
    title,
    description,
    robots: hotel.status === 'approved' ? undefined : { index: false, follow: false },
  });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, images, type: 'website' },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description, images },
  };
}

export default async function HotelLayout({ children, params }) {
  const data = await getHotel(params.id);
  const hotel = data?.hotel;
  return (
    <>
      {hotel?.status === 'approved' && (
        <JsonLd
          data={[
            hotelLd(hotel, data.rooms),
            breadcrumbLd([
              { name: 'Accueil', path: '/' },
              { name: 'Hôtels', path: '/hotels' },
              { name: hotel.wilaya, path: wilayaPath(hotel.wilaya) },
              { name: hotel.name, path: `/hotels/${hotel._id}` },
            ]),
          ]}
        />
      )}
      <InitialData value={hotel?.status === 'approved' ? data : null}>{children}</InitialData>
    </>
  );
}
