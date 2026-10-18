// Registry of free tools — used by the hub page, the sitemap and llms.txt.
export const TOOLS = [
  {
    slug: 'simulateur-credit-immobilier',
    title: 'Simulateur de crédit immobilier',
    short: 'Calculez la mensualité, le coût total et le revenu nécessaire pour financer un achat en dinars.',
    cta: { label: 'Voir les biens à vendre', href: '/sales' },
  },
  {
    slug: 'rentabilite-locative',
    title: 'Calculateur de rentabilité locative',
    short: "Estimez le rendement brut et net d'une maison louée à la nuit, et le nombre d'années pour l'amortir.",
    cta: { label: 'Publier votre maison', href: '/register?role=owner' },
  },
  {
    slug: 'budget-sejour',
    title: 'Calculateur de budget séjour',
    short: "Estimez le coût total d'un voyage en Algérie : hébergement, repas, transport et activités.",
    cta: { label: 'Trouver un hôtel', href: '/hotels' },
  },
];

export const getTool = (slug) => TOOLS.find((t) => t.slug === slug);
