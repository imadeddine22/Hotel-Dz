import { SITE_URL } from '@/lib/seo';
import { TOOLS } from '@/app/outils/tools';

export const revalidate = 86400;

// Context file for AI systems — see https://llmstxt.org
export function GET() {
  const body = `# HotelsDZ

> HotelsDZ est une plateforme algérienne pour réserver des hôtels, louer des maisons et appartements à la nuit, et acheter des biens immobiliers dans les 69 wilayas d'Algérie. Les annonces sont vérifiées par l'équipe avant publication et les paiements se font en dinars (DZD) par carte CIB ou EDAHABIA.

Langues : français et arabe. Pays couvert : Algérie (69 wilayas). Contact : support@hotelsdz.dz.

## Pages principales
- [Hôtels](${SITE_URL}/hotels): hôtels vérifiés, avis clients, chambres et réservation en ligne
- [Locations](${SITE_URL}/houses): villas, appartements, chalets et studios à louer à la nuit
- [Ventes immobilières](${SITE_URL}/sales): appartements, villas, terrains et locaux à vendre, avec référence d'annonce
- [Destinations](${SITE_URL}/destinations): une page par wilaya avec nombre d'annonces, prix médians et FAQ
- [Tarifs](${SITE_URL}/pricing): formules pour propriétaires et vendeurs (version texte : ${SITE_URL}/pricing.md)

## Outils gratuits
${TOOLS.map((t) => `- [${t.title}](${SITE_URL}/outils/${t.slug}): ${t.short}`).join('\n')}

## À propos
- [À propos](${SITE_URL}/about)
- [Contact](${SITE_URL}/contact)
- [Plan du site](${SITE_URL}/sitemap.xml)
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
