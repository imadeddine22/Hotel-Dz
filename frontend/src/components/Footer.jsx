import Link from 'next/link';

export default function Footer() {
  const cols = [
    {
      title: 'HotelsDZ',
      items: [
        { label: 'À propos', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Blog', href: '#' },
        { label: 'Carrières', href: '#' },
      ],
    },
    {
      title: 'Voyageurs',
      items: [
        { label: 'Rechercher', href: '/hotels' },
        { label: 'Mes réservations', href: '/my-bookings' },
        { label: 'Mon profil', href: '/profile' },
        { label: 'Aide', href: '/contact' },
        { label: 'Annulation', href: '/my-bookings' },
      ],
    },
    {
      title: 'Hôteliers',
      items: [
        { label: 'Inscrire mon hôtel', href: '/register' },
        { label: 'Tableau de bord', href: '/owner/dashboard' },
        { label: 'Support', href: '/contact' },
      ],
    },
    {
      title: 'Légal',
      items: [
        { label: 'Conditions', href: '#' },
        { label: 'Confidentialité', href: '#' },
        { label: 'Cookies', href: '#' },
      ],
    },
  ];

  return (
    <footer className="mt-12 bg-ink text-gray-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-lg font-extrabold text-white">
              hotels<span className="text-brand-400">dz</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-400">
            Réservez les meilleurs hôtels dans les 58 wilayas d&apos;Algérie. Paiement en DZD.
          </p>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 font-semibold text-white">{col.title}</h4>
            <ul className="space-y-2 text-sm">
              {col.items.map((i) => (
                <li key={i.label}>
                  <Link href={i.href} className="hover:text-brand-400">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-5 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} HotelsDZ — Tous droits réservés.
      </div>
    </footer>
  );
}
