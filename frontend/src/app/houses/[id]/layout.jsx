import { absoluteImage, apiGetListing, NOT_FOUND, breadcrumbLd, formatDZD, houseLd, JsonLd, truncate } from '@/lib/seo';
import { wilayaPath } from '@/lib/wilayaInfo';
import { getT, pageMeta } from '@/lib/i18n/server';
import { localized } from '@/lib/i18n/localizeData';

import { InitialData } from '@/components/InitialData';

// NOT_FOUND = doesn't exist or isn't public yet (an owner previewing a pending listing): the page
// still renders in the browser, but must never be indexed
const getHouse = async (id) => {
  const data = await apiGetListing(`/houses/${encodeURIComponent(id)}`);
  if (data === NOT_FOUND) return { notFound: true };
  return localized(data, getT().lang); // /ar, /en: the listing's machine translation
};

export async function generateMetadata({ params }) {
  const data = await getHouse(params.id);
  const house = data?.house;
  if (!house) {
    // not found / not public → noindex; API unreachable → stay indexable (transient failure)
    return { title: 'Location en Algérie', alternates: { canonical: `/houses/${params.id}` }, robots: data?.notFound ? { index: false, follow: true } : undefined };
  }

  const { t } = getT();
  const place = { name: house.name, city: t(house.city), wilaya: t(house.wilaya) };
  const title = t('{type} à louer à {city} — {name}', { ...place, type: t(house.type || 'Maison') });
  const description =
    truncate(house.description, 155) ||
    t("{name} à {city} ({wilaya}) : {rooms} chambre(s), jusqu'à {capacity} personnes, {price} / nuit. Réservez sur Meskan dz.", {
      ...place, rooms: house.rooms, capacity: house.capacity, price: formatDZD(house.pricePerNight),
    });
  const images = (house.images || []).slice(0, 1).map(absoluteImage);

  const meta = pageMeta({
    path: `/houses/${house._id}`,
    title,
    description,
    robots: house.status === 'approved' ? undefined : { index: false, follow: false },
  });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, images, type: 'website' },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description, images },
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
      <InitialData value={house?.status === 'approved' ? { house } : null}>{children}</InitialData>
    </>
  );
}
