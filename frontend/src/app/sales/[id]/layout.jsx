import { absoluteImage, apiGet, breadcrumbLd, formatDZD, JsonLd, saleLd, truncate } from '@/lib/seo';
import { wilayaPath } from '@/lib/wilayaInfo';

const getListing = (id) => apiGet(`/sales/${encodeURIComponent(id)}?noview=1`);

export async function generateMetadata({ params }) {
  const listing = (await getListing(params.id))?.listing;
  if (!listing) return { title: 'Bien immobilier à vendre', alternates: { canonical: `/sales/${params.id}` } }; // API down or 404: never noindex on a transient failure

  const area = listing.area ? ` ${listing.area} m²` : '';
  const title = `${listing.type}${area} à vendre à ${listing.city} — ${formatDZD(listing.price)}`;
  const description =
    truncate(listing.description, 155) ||
    `${listing.title} à ${listing.city} (${listing.wilaya}) : ${listing.rooms} pièce(s), ${formatDZD(listing.price)}. Réf. ${listing.reference}. Contactez le vendeur sur Meskan dz.`;
  const images = (listing.images || []).slice(0, 1).map(absoluteImage);

  return {
    title,
    description,
    alternates: { canonical: `/sales/${listing._id}` },
    robots: listing.status === 'approved' ? undefined : { index: false, follow: false },
    openGraph: { title, description, images, type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images },
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
              { name: listing.wilaya, path: wilayaPath(listing.wilaya) },
              { name: listing.title, path: `/sales/${listing._id}` },
            ]),
          ]}
        />
      )}
      {children}
    </>
  );
}
