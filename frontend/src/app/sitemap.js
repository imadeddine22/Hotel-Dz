import { apiGet, SITE_URL } from '@/lib/seo';
import { getWilayaInfo, wilayaPath } from '@/lib/wilayaInfo';
import { WILAYAS } from '@/lib/wilayas';
import { TOOLS } from '@/app/outils/tools';

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

  const entries = (list, prefix) =>
    list.map((x) => ({
      url: `${SITE_URL}/${prefix}/${x._id}`,
      lastModified: x.updatedAt ? new Date(x.updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  return [...staticPages, ...wilayaPages, ...entries(hotels, 'hotels'), ...entries(houses, 'houses'), ...entries(sales, 'sales')];
}
