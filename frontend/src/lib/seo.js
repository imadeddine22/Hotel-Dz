// Server-side SEO helpers: canonical site URL, API fetch for metadata/sitemaps,
// and JSON-LD builders. Safe to import from server components only.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://hotel-dz-three.vercel.app'
).replace(/\/$/, '');

export { SITE_NAME } from './brand';

const PRODUCTION_API = 'https://backend-yikc.onrender.com/api/v1';
const PRODUCTION_SERVER = 'https://backend-yikc.onrender.com';

// On the server `window` is undefined, so lib/api.js would always fall back to
// localhost. Resolve the API explicitly: env override, else production on Vercel.
const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.VERCEL ? PRODUCTION_API : 'http://localhost:5000/api/v1');

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL ? PRODUCTION_SERVER : 'http://localhost:5000');

/** Fetch JSON from the backend, cached for `revalidate` seconds. Returns null on any failure. */
export async function apiGet(path, { revalidate = 3600, timeoutMs = 12000 } = {}) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Returned by apiGetListing when the API says the listing doesn't exist (vs. API unreachable). */
export const NOT_FOUND = Symbol('not-found');

/**
 * Like apiGet, for a single listing: NOT_FOUND on a definite 400/404 (the page must answer 404,
 * not an indexable empty page), null when the API is unreachable (transient: keep the page indexable).
 */
export async function apiGetListing(path, { revalidate = 3600, timeoutMs = 12000 } = {}) {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate }, signal: AbortSignal.timeout(timeoutMs) });
    if (res.status === 404 || res.status === 400) return NOT_FOUND;
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function absoluteImage(url) {
  if (!url) return `${SITE_URL}/hand_holding_house.png`;
  const u = typeof url === 'string' ? url : url.url;
  if (!u) return `${SITE_URL}/hand_holding_house.png`;
  if (/^https?:\/\//.test(u)) return u;
  return `${SERVER_URL}${u.startsWith('/') ? '' : '/'}${u}`;
}

/** Trim text to a meta-description friendly length without cutting mid-word. */
export function truncate(text, max = 155) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length)}…`;
}

/** Price in its currency ("14 000 DA" for dinars, "180 TND", "1 400 MAD"). */
export const formatDZD = (n, currency = 'DZD') =>
  `${new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 2 }).format(Number(n) || 0)} ${!currency || currency === 'DZD' ? 'DA' : currency}`;

/** Metadata for private / transactional pages that must never be indexed. */
export const noIndex = (title) => ({
  title: { default: title, template: '%s | Meskan' },
  robots: { index: false, follow: false },
});

export function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

export function faqLd(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

function postalAddress(entity) {
  return {
    '@type': 'PostalAddress',
    streetAddress: entity.address || undefined,
    addressLocality: entity.city,
    addressRegion: entity.wilaya,
    addressCountry: entity.country || 'DZ',
  };
}

function geo(entity) {
  const c = entity.coordinates;
  if (!c || typeof c.lat !== 'number' || typeof c.lng !== 'number') return undefined;
  return { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng };
}

function rating(entity) {
  if (!entity.reviewsCount || !entity.avgRating) return undefined;
  return {
    '@type': 'AggregateRating',
    ratingValue: Number(entity.avgRating).toFixed(1),
    reviewCount: entity.reviewsCount,
    bestRating: 10, // scores are out of 10 (Booking.com style)
    worstRating: 1,
  };
}

export function hotelLd(hotel, rooms = []) {
  const prices = rooms.map((r) => r.pricePerNight).filter((p) => p > 0);
  return {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotel.name,
    description: truncate(hotel.description, 500) || undefined,
    url: `${SITE_URL}/hotels/${hotel._id}`,
    image: (hotel.images || []).slice(0, 6).map(absoluteImage),
    address: postalAddress(hotel),
    geo: geo(hotel),
    starRating: hotel.starRating ? { '@type': 'Rating', ratingValue: hotel.starRating } : undefined,
    aggregateRating: rating(hotel),
    amenityFeature: (hotel.amenities || []).map((a) => ({
      '@type': 'LocationFeatureSpecification',
      name: a,
      value: true,
    })),
    priceRange: prices.length
      ? `${formatDZD(Math.min(...prices), hotel.currency)} - ${formatDZD(Math.max(...prices), hotel.currency)}`
      : undefined,
    currenciesAccepted: hotel.currency || 'DZD',
  };
}

export function houseLd(house) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VacationRental',
    name: house.name,
    description: truncate(house.description, 500) || undefined,
    url: `${SITE_URL}/houses/${house._id}`,
    image: (house.images || []).slice(0, 6).map(absoluteImage),
    address: postalAddress(house),
    geo: geo(house),
    aggregateRating: rating(house),
    containsPlace: {
      '@type': 'Accommodation',
      additionalType: house.type,
      numberOfBedrooms: house.rooms,
      numberOfBathroomsTotal: house.bathrooms,
      occupancy: { '@type': 'QuantitativeValue', maxValue: house.capacity },
      amenityFeature: (house.amenities || []).map((a) => ({
        '@type': 'LocationFeatureSpecification',
        name: a,
        value: true,
      })),
    },
    offers: house.pricePerNight
      ? {
          '@type': 'Offer',
          price: house.pricePerNight,
          priceCurrency: house.currency || 'DZD',
          unitText: 'NIGHT',
        }
      : undefined,
  };
}

export function saleLd(listing) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description: truncate(listing.description, 500) || undefined,
    url: `${SITE_URL}/sales/${listing._id}`,
    image: (listing.images || []).slice(0, 6).map(absoluteImage),
    datePosted: listing.createdAt,
    identifier: listing.reference,
    about: {
      '@type': listing.type === 'Appartement' || listing.type === 'Studio' ? 'Apartment' : 'SingleFamilyResidence',
      name: listing.title,
      address: postalAddress(listing),
      geo: geo(listing),
      numberOfRooms: listing.rooms,
      numberOfBathroomsTotal: listing.bathrooms,
      floorSize: listing.area
        ? { '@type': 'QuantitativeValue', value: listing.area, unitCode: 'MTK' }
        : undefined,
    },
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: listing.currency || 'DZD',
      availability: 'https://schema.org/InStock',
    },
  };
}

/** Renders one or more JSON-LD objects. Escapes `<` so data can't close the script tag. */
export function JsonLd({ data }) {
  const list = (Array.isArray(data) ? data : [data]).filter(Boolean);
  return list.map((d, i) => (
    <script
      key={i}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, '\\u003c') }}
    />
  ));
}
