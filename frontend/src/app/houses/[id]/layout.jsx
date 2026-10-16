import { absoluteImage, apiGet, breadcrumbLd, formatDZD, houseLd, JsonLd, truncate } from '@/lib/seo';
import { wilayaPath } from '@/lib/wilayaInfo';

const getHouse = (id) => apiGet(`/houses/${encodeURIComponent(id)}`);

export async function generateMetadata({ params }) {
  const house = (await getHouse(params.id))?.house;
  if (!house) return { title: 'Location en Algérie', alternates: { canonical: `/houses/${params.id}` } }; // API down or 404: never noindex on a transient failure

  const title = `${house.type || 'Maison'} à louer à ${house.city} — ${house.name}`;
  const description =
    truncate(house.description, 155) ||
    `${house.name} à ${house.city} (${house.wilaya}) : ${house.rooms} chambre(s), jusqu'à ${house.capacity} personnes, ${formatDZD(house.pricePerNight)} / nuit. Réservez sur HotelsDZ.`;
  const images = (house.images || []).slice(0, 1).map(absoluteImage);

  return {
    title,
    description,
    alternates: { canonical: `/houses/${house._id}` },
    robots: house.status === 'approved' ? undefined : { index: false, follow: false },
    openGraph: { title, description, images, type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}

export default async function HouseLayout({ children, params }) {
  const house = (await getHouse(params.id))?.house;
  return (
    <>
      {house?.status === 'approved' && (
        <JsonLd
          data={[
            houseLd(house),
            breadcrumbLd([
              { name: 'Accueil', path: '/' },
              { name: 'Locations', path: '/houses' },
              { name: house.wilaya, path: wilayaPath(house.wilaya) },
              { name: house.name, path: `/houses/${house._id}` },
            ]),
          ]}
        />
      )}
      {children}
    </>
  );
}
