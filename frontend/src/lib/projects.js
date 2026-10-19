// Investment projects (land or property looking for an investor): same lists as the InvestmentProject model.
export const ASSET_TYPES = ['Terrain', 'Local commercial', 'Bâtiment / immeuble', 'Maison / villa', 'Hangar / entrepôt', 'Ferme', 'Hôtel / établissement existant', 'Autre bien'];
export const PROJECT_TYPES = ['Résidentiel', 'Hôtel et tourisme', 'Commercial', 'Bureaux', 'Industriel', 'Agricole', 'Santé et éducation', 'Mixte', 'Autre'];
export const PARTNERSHIP_TYPES = ['Partenariat (parts du projet)', 'Construction contre logements', 'Location longue durée', 'Financement contre bénéfices', 'Exploitation en commun', 'À discuter'];
export const LAND_DOCUMENTS = ['Acte notarié', 'Livret foncier', 'Acte administratif', 'Acte sous seing privé', 'Décision de concession', 'Certificat de possession', 'En cours de régularisation', 'Autre'];

/** "Terrain", "Local commercial"… or what the owner wrote when they picked "Autre bien". */
export const assetLabel = (p, t) => (p.assetType === 'Autre bien' && p.assetOther ? p.assetOther : t(p.assetType || 'Terrain'));
/** Type of ownership document, or its name when "Autre" was picked. */
export const documentLabel = (p, t) => (p.landDocument === 'Autre' && p.documentOther ? p.documentOther : t(p.landDocument));

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
