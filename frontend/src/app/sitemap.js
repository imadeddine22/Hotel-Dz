import { apiGet, SITE_URL } from '@/lib/seo';
import { destinationPath, getWilayaInfo, wilayaPath } from '@/lib/wilayaInfo';
import { WILAYAS } from '@/lib/wilayas';
import { TOOLS } from '@/app/outils/tools';
import { LOCALES, localePath } from '@/lib/i18n/locale';

export const revalidate = 3600;

const MAX_PAGES = 40; // 40 × 50 = 2 000 URLs per listing type

async function fetchAll(path, key) {
  const items = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await apiGet(`${path}?limit=50&page=${page}&sort=newest`, { revalidate });
    const batch = data?.[key] || [];
    items.push(...batch);
    if (!data || page >= (data.pages || 1)) break;
  }
  return items;
}

export default async function sitemap() {
  const now = new Date();
  const [hotels, houses, sales] = await Promise.all([
    fetchAll('/hotels', 'hotels'),
    fetchAll('/houses', 'houses'),
    fetchAll('/sales', 'listings'),
  ]);

  const staticPages = [
    { path: '/', priority: 1, changeFrequency: 'daily' },
    { path: '/hotels', priority: 0.9, changeFrequency: 'daily' },
    { path: '/houses', priority: 0.9, changeFrequency: 'daily' },
    { path: '/sales', priority: 0.9, changeFrequency: 'daily' },
    { path: '/destinations', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/outils', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/comparatif', priority: 0.6, changeFrequency: 'monthly' },
    ...TOOLS.map((t) => ({ path: `/outils/${t.slug}`, priority: 0.7, changeFrequency: 'monthly' })),
    { path: '/pricing', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/contact', priority: 0.4, changeFrequency: 'yearly' },
  ].map(({ path, ...rest }) => ({ url: `${SITE_URL}${path}`, lastModified: now, ...rest }));

  // Only list destination pages that are indexable: they have listings or editorial content.
  const activeWilayas = new Set([...hotels, ...houses, ...sales].map((x) => getWilayaInfo(x.wilaya || '')?.name).filter(Boolean));
  const wilayaPages = WILAYAS.filter((w) => activeWilayas.has(w) || getWilayaInfo(w).highlights.length).map((w) => ({
    url: `${SITE_URL}${wilayaPath(w)}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: activeWilayas.has(w) ? 0.8 : 0.5,
  }));

  // Destinations outside Algeria (/destinations/tn/sousse…): only those with listings
  const abroad = [...new Set([...hotels, ...houses, ...sales]
    .filter((x) => x.country && x.country !== 'DZ' && x.wilaya)
    .map((x) => destinationPath(x.wilaya, x.country)))]
    .map((path) => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 }));
  wilayaPages.push(...abroad);

  const entries = (list, prefix) =>
    list.map((x) => ({
      url: `${SITE_URL}/${prefix}/${x._id}`,
      lastModified: x.updatedAt ? new Date(x.updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  const all = [...staticPages, ...wilayaPages, ...entries(hotels, 'hotels'), ...entries(houses, 'houses'), ...entries(sales, 'sales')];
  // Every page in its 3 languages (/…, /ar/…, /en/…), each listing all versions as hreflang alternates
  return all.flatMap((entry) => {
    const path = entry.url.slice(SITE_URL.length) || '/';
    const languages = Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}${localePath(l, path)}`]));
    languages['x-default'] = languages.fr;
    return LOCALES.map((l) => ({ ...entry, url: languages[l], alternates: { languages } }));
  });
}
