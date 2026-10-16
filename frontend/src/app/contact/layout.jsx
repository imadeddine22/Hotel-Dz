export const metadata = {
  title: { default: 'Contact et aide', template: '%s | HotelsDZ' },
  description: "Une question sur une réservation, un paiement ou une annonce ? Contactez l'équipe HotelsDZ par e-mail, téléphone ou formulaire.",
  alternates: { canonical: '/contact' },
};

export default function Layout({ children }) {
  return children;
}
