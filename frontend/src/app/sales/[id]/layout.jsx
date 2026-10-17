import { absoluteImage, apiGetListing, NOT_FOUND, breadcrumbLd, formatDZD, JsonLd, saleLd, truncate } from '@/lib/seo';
import { destinationPath } from '@/lib/wilayaInfo';
import { getT, pageMeta } from '@/lib/i18n/server';
import { localized } from '@/lib/i18n/localizeData';

import { InitialData } from '@/components/InitialData';

// NOT_FOUND = doesn't exist or isn't public yet (an owner previewing a pending listing): the page
// still renders in the browser, but must never be indexed
const getListing = async (id) => {
  const data = await apiGetListing(`/sales/${encodeURIComponent(id)}?noview=1`);
  if (data === NOT_FOUND) return { notFound: true };
  return localized(data, getT().lang); // /ar, /en: the listing's machine translation
};

export async function generateMetadata({ params }) {
  const data = await getListing(params.id);
  const listing = data?.listing;
  if (!listing) {
    // not found / not public → noindex; API unreachable → stay indexable (transient failure)
    return { title: 'Bien immobilier à vendre', alternates: { canonical: `/sales/${params.id}` }, robots: data?.notFound ? { index: false, follow: true } : undefined };
  }

  const { t } = getT();
  const place = { name: listing.title, city: t(listing.city), wilaya: t(listing.wilaya) };
  const area = listing.area ? ` ${listing.area} m²` : '';
  const title = t('{type}{area} à vendre à {city} — {price}', { ...place, type: t(listing.type), area, price: formatDZD(listing.price, listing.currency) });
  const description =
    truncate(listing.description, 155) ||
    t('{name} à {city} ({wilaya}) : {rooms} pièce(s), {price}. Réf. {reference}. Contactez le vendeur sur Meskan dz.', {
      ...place, rooms: listing.rooms, price: formatDZD(listing.price, listing.currency), reference: listing.reference,
    });
  const images = (listing.images || []).slice(0, 1).map(absoluteImage);

  const meta = pageMeta({
    path: `/sales/${listing._id}`,
    title,
    description,
    robots: listing.status === 'approved' ? undefined : { index: false, follow: false },
  });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, images, type: 'website' },
    twitter: { card: 'summary_large_image', title: meta.openGraph.title, description: meta.description, images },
  };
}

export default async function SaleLayout({ children, params }) {
  const listing = (await getListing(params.id))?.listing;
  return (
    <>
      {listing?.status === 'approved' && (
        <JsonLd
          data={[
            saleLd(listing),
            breadcrumbLd([
              { name: 'Accueil', path: '/' },
              { name: 'Ventes', path: '/sales' },
              { name: listing.wilaya, path: destinationPath(listing.wilaya, listing.country) },
              { name: listing.title, path: `/sales/${listing._id}` },
            ]),
          ]}
        />
      )}
      <InitialData value={listing?.status === 'approved' ? { listing } : null}>{children}</InitialData>
    </>
  );
}
