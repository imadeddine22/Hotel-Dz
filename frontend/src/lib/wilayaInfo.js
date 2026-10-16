import { WILAYAS, WILAYA_LIST } from './wilayas';

// Region per official wilaya code. WILAYAS is ordered by code (index + 1).
const LITTORAL = [2, 6, 13, 15, 16, 18, 21, 23, 27, 31, 35, 36, 42, 46];
// 59-69: wilayas created by the 2025 administrative division.
const HAUTS_PLATEAUX = [4, 5, 12, 14, 17, 19, 20, 28, 32, 34, 38, 40, 45, 59, 60, 62, 63, 64, 65, 66, 68, 69];
const SUD = [1, 3, 7, 8, 11, 30, 33, 37, 39, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 61];

const REGIONS = {
  littoral: {
    label: 'Littoral méditerranéen',
    blurb: 'Une wilaya côtière : la haute saison va de juin à septembre, réservez tôt pour les séjours en bord de mer.',
  },
  hautsPlateaux: {
    label: 'Hauts-Plateaux',
    blurb: 'Une wilaya des Hauts-Plateaux au climat continental : étés chauds, hivers froids, idéale au printemps et en automne.',
  },
  sud: {
    label: 'Sud et Sahara',
    blurb: "Une wilaya du Sud : la meilleure période s'étend d'octobre à avril, quand les températures sont douces.",
  },
  tell: {
    label: 'Tell intérieur',
    blurb: 'Une wilaya du Tell, entre montagnes et plaines agricoles, accessible toute l’année depuis les grandes villes du Nord.',
  },
};

// Short, factual highlights for the main tourist wilayas.
const HIGHLIGHTS = {
  Alger: ['la Casbah, classée au patrimoine mondial de l’UNESCO', 'la basilique Notre-Dame d’Afrique', 'le Jardin d’Essai du Hamma'],
  Oran: ['le fort de Santa Cruz', 'le front de mer', 'les plages de la corniche oranaise'],
  Constantine: ['les ponts suspendus, dont celui de Sidi M’Cid', 'les gorges du Rhummel', 'le palais du Bey'],
  Annaba: ['le site antique d’Hippone', 'la basilique Saint-Augustin', 'les plages de la corniche'],
  'Béjaïa': ['le Cap Carbon', 'le parc national de Gouraya', 'les plages de la côte de Saphir'],
  Tipaza: ['les ruines romaines classées par l’UNESCO', 'le Tombeau de la Chrétienne', 'les plages de la côte ouest'],
  Tlemcen: ['la Grande Mosquée', 'le site de Mansourah', 'les cascades d’El Ourit'],
  'Ghardaïa': ['la vallée du M’zab, classée par l’UNESCO', 'les ksour de Beni Isguen', 'le marché traditionnel'],
  Tamanrasset: ['le massif du Hoggar', 'le plateau de l’Assekrem', 'les circuits en 4x4 dans le désert'],
  Djanet: ['le Tassili n’Ajjer, classé par l’UNESCO', 'les gravures rupestres', 'les dunes de l’Erg Admer'],
  Jijel: ['la corniche jijelienne', 'les Grottes merveilleuses', 'le parc national de Taza'],
  'Sétif': ['le site romain de Djemila, classé par l’UNESCO', 'la fontaine d’Aïn El Fouara', 'le parc d’attractions'],
  Batna: ['le site romain de Timgad, classé par l’UNESCO', 'les Aurès', 'le parc national de Belezma'],
  Biskra: ['les palmeraies des Zibans', 'les sources thermales de Hammam Salihine', 'les dattes Deglet Nour'],
  'Tizi Ouzou': ['le massif du Djurdjura', 'la côte de Tigzirt et Azeffoun', 'les villages de Kabylie'],
  Skikda: ['les plages de Stora', 'la corniche', 'le port de pêche'],
  Blida: ['la station de montagne de Chréa', 'les gorges de la Chiffa', 'la ville des roses'],
  'Boumerdès': ['les plages de Zemmouri et Corso', 'la proximité d’Alger', 'les résidences balnéaires'],
  Mostaganem: ['les plages de Sablettes', 'le vieux quartier de Tigditt', 'la côte des Dahra'],
  'El Oued': ['la « ville aux mille coupoles »', 'les dunes du Grand Erg oriental', 'les palmeraies en ghout'],
  Timimoun: ['l’« oasis rouge » et ses ksour', 'les foggaras', 'le Grand Erg occidental'],
  'Béchar': ['les dunes de Taghit', 'la palmeraie', 'les gravures rupestres'],
  'Bou Saâda': ['la « porte du désert » et son oasis', 'le musée Nasreddine Dinet', 'le moulin Ferrero et l’oued Bou Saâda'],
  Bouira: ['la station de Tikjda', 'le parc national du Djurdjura', 'les sources de Hammam Ksenna'],
};

const slugify = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function getWilayaInfo(name) {
  const index = WILAYAS.findIndex((w) => slugify(w) === slugify(name));
  if (index === -1) return null;
  const code = index + 1;
  const regionKey = LITTORAL.includes(code)
    ? 'littoral'
    : HAUTS_PLATEAUX.includes(code)
      ? 'hautsPlateaux'
      : SUD.includes(code)
        ? 'sud'
        : 'tell';
  return {
    name: WILAYAS[index],
    arabic: WILAYA_LIST[index].arabic,
    code,
    region: REGIONS[regionKey],
    highlights: HIGHLIGHTS[WILAYAS[index]] || [],
  };
}

/** Wilayas that share the same region, used for internal linking between destination pages. */
export function getNeighbourWilayas(name, count = 6) {
  const info = getWilayaInfo(name);
  if (!info) return [];
  return WILAYAS.filter((w) => w !== info.name && getWilayaInfo(w).region === info.region)
    .sort((a, b) => (HIGHLIGHTS[b] ? 1 : 0) - (HIGHLIGHTS[a] ? 1 : 0))
    .slice(0, count);
}

export const wilayaPath = (name) => `/destinations/${encodeURIComponent(name)}`;
