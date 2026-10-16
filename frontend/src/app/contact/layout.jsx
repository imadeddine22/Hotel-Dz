export const metadata = {
  title: { default: 'Contact et aide', template: '%s | Meskan dz' },
  description: "Une question sur une réservation, un paiement ou une annonce ? Contactez l'équipe Meskan dz par e-mail, téléphone ou formulaire.",
  alternates: { canonical: '/contact' },
};

export default function Layout({ children }) {
  return children;
}
