import { absoluteImage, apiGet, breadcrumbLd, hotelLd, JsonLd, truncate } from '@/lib/seo';
import { wilayaPath } from '@/lib/wilayaInfo';

const getHotel = (id) => apiGet(`/hotels/${encodeURIComponent(id)}`);

export async function generateMetadata({ params }) {
  const data = await getHotel(params.id);
  const hotel = data?.hotel;
  if (!hotel) return { title: 'Hôtel en Algérie', alternates: { canonical: `/hotels/${params.id}` } }; // API down or 404: never noindex on a transient failure

  const stars = hotel.starRating ? ` ${hotel.starRating}★` : '';
  const title = `${hotel.name}${stars} à ${hotel.city} — Réservation`;
  const description =
    truncate(hotel.description, 155) ||
    `Réservez ${hotel.name} à ${hotel.city} (${hotel.wilaya}). Chambres, prix, avis clients et paiement CIB / EDAHABIA.`;
  const images = (hotel.images || []).slice(0, 1).map(absoluteImage);

  return {
    title,
    description,
    alternates: { canonical: `/hotels/${hotel._id}` },
    robots: hotel.status === 'approved' ? undefined : { index: false, follow: false },
    openGraph: { title, description, images, type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images },
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
      {children}
    </>
  );
}
