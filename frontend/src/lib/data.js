// Mock data for the homepage. Will be replaced by API calls (Phase: search/booking).

const img = (id, w = 800, h = 600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// Quick-pick neighbourhoods / areas shown under the hero search bar
export const QUICK_AREAS = [
  'Alger Centre',
  'Hydra',
  'Bab Ezzouar',
  'Oran',
  'Constantine',
  'Annaba',
  'Sétif',
  'Béjaïa',
];

// Hotel "types" used as category filter circles
export const CATEGORIES = [
  { name: 'Tous', img: img('1564501049412-61c2a3083791') },
  { name: 'Luxe', img: img('1566073771259-6a8506099945') },
  { name: 'Affaires', img: img('1551882547-ff40c63fe5fa') },
  { name: 'Balnéaire', img: img('1520250497591-112f2f40a3f4') },
  { name: 'Riad', img: img('1582719478250-c89cae4dc85b') },
  { name: 'Boutique', img: img('1611892440504-42a792e24d32') },
  { name: 'Montagne', img: img('1455587734955-081b22074882') },
  { name: 'Désert', img: img('1469474968028-56623f02e42e') },
  { name: 'Appart-hôtel', img: img('1502672260266-1c1ef2d93688') },
  { name: 'Économique', img: img('1445019980597-93fa8acb246c') },
];

// Cities with hotel counts (Découvrez par ville)
export const CITIES = [
  { name: 'Alger', count: 362, img: img('1583422409516-2895a77efded') },
  { name: 'Oran', count: 118, img: img('1590490360182-c33d57733427') },
  { name: 'Constantine', count: 64, img: img('1539037116277-4db20889f2d4') },
  { name: 'Sétif', count: 37, img: img('1502602898657-3e91760cbb34') },
  { name: 'Annaba', count: 28, img: img('1512453979798-5ea266f8880c') },
  { name: 'Tlemcen', count: 21, img: img('1518684079-3c830dcef090') },
];

// Featured hotels (En Vedette)
export const FEATURED = [
  {
    id: 'h1',
    name: 'Sofitel Algiers Hamma',
    city: 'Alger',
    img: img('1566073771259-6a8506099945'),
  },
  {
    id: 'h2',
    name: 'Le Méridien Oran',
    city: 'Oran',
    img: img('1571896349842-33c89424de2d'),
  },
  {
    id: 'h3',
    name: 'Marriott Constantine',
    city: 'Constantine',
    img: img('1582719508461-905c673771fd'),
  },
  {
    id: 'h4',
    name: 'Riad El Kahina',
    city: 'Tlemcen',
    img: img('1578683010236-d716f9a3f461'),
  },
  {
    id: 'h5',
    name: 'Hôtel Saint George',
    city: 'Alger',
    img: img('1564501049412-61c2a3083791'),
  },
];

// Hotel list grid
export const HOTELS = [
  {
    id: 'h1',
    name: 'Sofitel Algiers Hamma',
    city: 'Alger',
    type: 'Luxe',
    price: 24500,
    stars: 5,
    rating: 4.6,
    reviews: 412,
    img: img('1566073771259-6a8506099945'),
  },
  {
    id: 'h2',
    name: 'Le Méridien Oran',
    city: 'Oran',
    type: 'Affaires',
    price: 19800,
    stars: 5,
    rating: 4.4,
    reviews: 285,
    img: img('1571896349842-33c89424de2d'),
  },
  {
    id: 'h3',
    name: 'Marriott Constantine',
    city: 'Constantine',
    type: 'Affaires',
    price: 17500,
    stars: 5,
    rating: 4.3,
    reviews: 198,
    img: img('1582719508461-905c673771fd'),
  },
  {
    id: 'h4',
    name: 'Riad El Kahina',
    city: 'Tlemcen',
    type: 'Riad',
    price: 9800,
    stars: 4,
    rating: 4.1,
    reviews: 96,
    img: img('1578683010236-d716f9a3f461'),
  },
  {
    id: 'h5',
    name: 'Hôtel Saint George',
    city: 'Alger',
    type: 'Boutique',
    price: 14200,
    stars: 4,
    rating: 4.5,
    reviews: 320,
    img: img('1564501049412-61c2a3083791'),
  },
  {
    id: 'h6',
    name: 'Sheraton Club des Pins',
    city: 'Alger',
    type: 'Balnéaire',
    price: 21000,
    stars: 5,
    rating: 4.2,
    reviews: 510,
    img: img('1520250497591-112f2f40a3f4'),
  },
  {
    id: 'h7',
    name: 'Gourara Timimoun',
    city: 'Timimoun',
    type: 'Désert',
    price: 8600,
    stars: 3,
    rating: 4.0,
    reviews: 64,
    img: img('1469474968028-56623f02e42e'),
  },
  {
    id: 'h8',
    name: 'Tikjda Resort',
    city: 'Bouira',
    type: 'Montagne',
    price: 7200,
    stars: 3,
    rating: 3.9,
    reviews: 47,
    img: img('1455587734955-081b22074882'),
  },
];

export const formatDZD = (n) =>
  new Intl.NumberFormat('fr-DZ').format(n) + ' DZD';
