// Investment projects (land looking for an investor): same lists as the InvestmentProject model.
export const PROJECT_TYPES = ['Résidentiel', 'Hôtel et tourisme', 'Commercial', 'Bureaux', 'Industriel', 'Agricole', 'Santé et éducation', 'Mixte', 'Autre'];
export const PARTNERSHIP_TYPES = ['Partenariat (parts du projet)', 'Construction contre logements', 'Location longue durée', 'Financement contre bénéfices', 'À discuter'];
export const LAND_DOCUMENTS = ['Acte notarié', 'Livret foncier', 'Acte administratif', 'En cours de régularisation'];

// Colours of the brand banner (teal gradient + navy)
export const PROJECT_COLORS = { ink: '#152A41', from: '#0DD5C4', to: '#00B3D2' };
export const projectGradient = `linear-gradient(135deg, ${PROJECT_COLORS.from}, ${PROJECT_COLORS.to})`;

/** "12 000 m²" or "1,2 ha" for large plots. */
export function formatArea(m2, lang = 'fr') {
  const n = Number(m2) || 0;
  const loc = lang === 'ar' ? 'ar-DZ' : 'fr-DZ';
  if (n >= 10000) return `${(n / 10000).toLocaleString(loc, { maximumFractionDigits: 1 })} ha`;
  return `${n.toLocaleString(loc)} m²`;
}
