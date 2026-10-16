import { SITE_URL } from '@/lib/seo';

const PRIVATE = [
  '/admin', '/owner', '/seller', '/booking',
  '/my-bookings', '/favorites', '/profile', '/login', '/register',
];

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      // AI search / answer engines: allowed so HotelsDZ can be cited in AI answers.
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'PerplexityBot', 'ClaudeBot', 'Claude-SearchBot', 'anthropic-ai', 'Google-Extended', 'Bingbot'],
        allow: '/',
        disallow: PRIVATE,
      },
      // Training-only bulk crawler.
      { userAgent: 'CCBot', disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
