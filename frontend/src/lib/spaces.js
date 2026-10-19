import { Luggage, Hotel, Tag, Landmark } from 'lucide-react';

// One account, several spaces: everyone signs up as a traveller and switches freely from the account menu.
// The role on the account is the space currently open; listings stay attached to the account.
export const SPACES = [
  { role: 'customer', label: 'Espace voyageur', desc: 'Réserver et louer', href: '/my-bookings', icon: Luggage },
  { role: 'owner', label: 'Hôtels et locations', desc: 'Louer mon hôtel ou ma maison', href: '/owner/dashboard', icon: Hotel },
  { role: 'seller', label: 'Vendre des biens', desc: 'Publier un bien à vendre', href: '/seller/dashboard', icon: Tag },
  { role: 'investor', label: 'Investisseur', desc: 'Trouver un projet où investir', href: '/investor/dashboard', icon: Landmark },
];

export const SPACE_ROLES = SPACES.map((s) => s.role);

/** Home page of the account's current space. */
export const spaceHome = (role) => (role === 'admin' ? '/admin' : SPACES.find((s) => s.role === role)?.href || '/my-bookings');
