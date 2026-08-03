/**
 * Seed script — populates the database with demo data so the admin
 * dashboard, owner dashboard and search pages have something to show.
 *
 * Run with:  npm run seed
 * WARNING: this wipes the existing collections below before inserting.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Hotel from './models/Hotel.js';
import House from './models/House.js';
import Room from './models/Room.js';
import Booking from './models/Booking.js';
import Payment from './models/Payment.js';
import Review from './models/Review.js';
import Message from './models/Message.js';

const img = (id) => ({
  url: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`,
  publicId: `seed/${id}`,
});

const HOTELS = [
  { name: 'Sofitel Algiers Hamma', wilaya: 'Alger', city: 'Alger', type: 'Luxe', starRating: 5, photo: '1566073771259-6a8506099945', lat: 36.7460, lng: 3.0626 },
  { name: 'Le Méridien Oran', wilaya: 'Oran', city: 'Oran', type: 'Affaires', starRating: 5, photo: '1571896349842-33c89424de2d', lat: 35.6969, lng: -0.6331 },
  { name: 'Marriott Constantine', wilaya: 'Constantine', city: 'Constantine', type: 'Affaires', starRating: 5, photo: '1582719508461-905c673771fd', lat: 36.3650, lng: 6.6147 },
  { name: 'Riad El Kahina', wilaya: 'Tlemcen', city: 'Tlemcen', type: 'Riad', starRating: 4, photo: '1578683010236-d716f9a3f461', lat: 34.8828, lng: -1.3167 },
  { name: 'Sheraton Club des Pins', wilaya: 'Alger', city: 'Staoueli', type: 'Balnéaire', starRating: 5, photo: '1520250497591-112f2f40a3f4', lat: 36.7500, lng: 2.8833 },
  { name: 'Gourara Timimoun', wilaya: 'Timimoun', city: 'Timimoun', type: 'Désert', starRating: 3, photo: '1469474968028-56623f02e42e', lat: 29.2639, lng: 0.2306 },
];

const ROOM_TYPES = [
  { type: 'single', title: 'Chambre Simple', pricePerNight: 8500, capacity: 1, bedsCount: 1, quantity: 5 },
  { type: 'double', title: 'Chambre Double', pricePerNight: 14000, capacity: 2, bedsCount: 2, quantity: 8 },
  { type: 'suite', title: 'Suite Exécutive', pricePerNight: 28000, capacity: 3, bedsCount: 2, quantity: 3 },
  { type: 'family', title: 'Chambre Familiale', pricePerNight: 22000, capacity: 6, bedsCount: 3, quantity: 4 },
];

const HOUSES = [
  { name: 'Villa Yasmine', wilaya: 'Alger', city: 'Alger', type: 'Villa', rooms: 4, bathrooms: 2, capacity: 8, pricePerNight: 15000, photo: '1564013799919-ab600027ffc6', lat: 36.7372, lng: 3.0866 },
  { name: 'Chalet Tikjda', wilaya: 'Bouira', city: 'Bouira', type: 'Chalet', rooms: 3, bathrooms: 1, capacity: 6, pricePerNight: 9000, photo: '1518780664697-55e3ad937233', lat: 36.3750, lng: 3.9000 },
  { name: 'Appartement Vue Mer', wilaya: 'Béjaïa', city: 'Béjaïa', type: 'Appartement', rooms: 2, bathrooms: 1, capacity: 4, pricePerNight: 6000, photo: '1502672260266-1c1ef2d93688', lat: 36.7500, lng: 5.0667 },
  { name: 'Riad Tlemcen', wilaya: 'Tlemcen', city: 'Tlemcen', type: 'Riad', rooms: 3, bathrooms: 2, capacity: 6, pricePerNight: 11000, photo: '1582719478250-c89cae4dc85b', lat: 34.8828, lng: -1.3167 },
  { name: 'Villa Piscine Tipaza', wilaya: 'Tipaza', city: 'Tipaza', type: 'Villa', rooms: 5, bathrooms: 3, capacity: 10, pricePerNight: 22000, photo: '1499793983690-e29da59ef1c2', lat: 36.5894, lng: 2.4433 },
  { name: 'Studio Moderne Oran', wilaya: 'Oran', city: 'Oran', type: 'Studio', rooms: 1, bathrooms: 1, capacity: 2, pricePerNight: 4500, photo: '1522708323590-d24dbb6b0267', lat: 35.6969, lng: -0.6331 },
];

const MESSAGES = [
  { name: 'Mohamed Salah', email: 'mohamed@example.com', subject: 'Inscrire mon hôtel', content: 'Bonjour, je possède un hôtel à Annaba et je souhaite le référencer sur votre plateforme. Quelles sont les étapes ?' },
  { name: 'Amel Khelifi', email: 'amel@example.com', subject: 'Question sur une réservation', content: 'Bonjour, est-il possible de modifier les dates de ma réservation après confirmation ? Merci.' },
  { name: 'Reda Bouzid', email: 'reda@example.com', subject: 'Partenariat', content: 'Nous sommes une agence de voyage et aimerions discuter d\'un partenariat. Pouvez-vous me recontacter ?' },
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const daysFromNow = (d) => { const x = new Date(); x.setDate(x.getDate() + d); x.setHours(12, 0, 0, 0); return x; };

// Seeds the currently-connected database. Caller is responsible for the
// connection lifecycle (so it can run against Atlas or an in-memory Mongo).
export const seedDatabase = async () => {
  console.log('🌱 Seeding database...');

  // Wipe
  await Promise.all([
    User.deleteMany({}), Hotel.deleteMany({}), House.deleteMany({}), Room.deleteMany({}),
    Booking.deleteMany({}), Payment.deleteMany({}), Review.deleteMany({}), Message.deleteMany({}),
  ]);

  // --- Users ---
  const admin = await User.create({
    fullName: 'Admin HotelsDZ', email: 'admin@hotelsdz.dz', password: 'admin123',
    phone: '0550000000', role: 'admin', isVerified: true,
  });
  const owner = await User.create({
    fullName: 'Karim Hôtelier', email: 'owner@hotelsdz.dz', password: 'owner123',
    phone: '0551111111', role: 'owner', isVerified: true,
  });
  const customers = await User.create([
    { fullName: 'Sara Benali', email: 'sara@example.com', password: 'pass123', phone: '0560000001', role: 'customer' },
    { fullName: 'Yacine Meziane', email: 'yacine@example.com', password: 'pass123', phone: '0560000002', role: 'customer' },
    { fullName: 'Lina Haddad', email: 'lina@example.com', password: 'pass123', phone: '0560000003', role: 'customer' },
  ]);
  console.log(`👤 Users: 1 admin, 1 owner, ${customers.length} customers`);

  // --- Hotels + Rooms ---
  const allRooms = [];
  for (let i = 0; i < HOTELS.length; i++) {
    const h = HOTELS[i];
    const hotel = await Hotel.create({
      owner: owner._id,
      name: h.name,
      description: `${h.name} — un établissement ${h.type.toLowerCase()} de ${h.starRating} étoiles à ${h.city}.`,
      wilaya: h.wilaya, city: h.city, address: `${h.city}, Algérie`,
      coordinates: { lat: h.lat, lng: h.lng },
      images: [img(h.photo)], amenities: ['Wifi', 'Parking', 'Climatisation', 'Restaurant'],
      starRating: h.starRating, type: h.type,
      // first 4 approved, last 2 pending (so admin has approvals to review)
      status: i < 4 ? 'approved' : 'pending',
    });
    for (const rt of ROOM_TYPES) {
      const room = await Room.create({ ...rt, hotel: hotel._id, images: [img(h.photo)], amenities: ['Wifi', 'TV'] });
      if (hotel.status === 'approved') allRooms.push({ room, hotel });
    }
  }
  console.log(`🏨 Hotels: ${HOTELS.length} (4 approved, 2 pending), ${allRooms.length} rooms`);

  // --- Houses (4 approved, 2 pending) ---
  const createdHouses = [];
  for (let i = 0; i < HOUSES.length; i++) {
    const h = HOUSES[i];
    const house = await House.create({
      owner: owner._id,
      name: h.name,
      description: `${h.name} — un(e) ${h.type.toLowerCase()} de ${h.rooms} chambres pouvant accueillir ${h.capacity} personnes à ${h.city}.`,
      wilaya: h.wilaya, city: h.city, address: `${h.city}, Algérie`,
      coordinates: { lat: h.lat, lng: h.lng },
      images: [img(h.photo)], amenities: ['Wifi', 'Climatisation', 'Parking', 'Cuisine équipée'],
      type: h.type, rooms: h.rooms, bathrooms: h.bathrooms, capacity: h.capacity,
      pricePerNight: h.pricePerNight,
      status: i < 4 ? 'approved' : 'pending',
    });
    createdHouses.push(house);
  }
  console.log(`🏠 Houses: ${HOUSES.length} (4 approved, 2 pending)`);

  // --- Contact messages ---
  await Message.create(MESSAGES);
  console.log(`✉️  Messages: ${MESSAGES.length}`);

  // --- A few favorites for the first customer ---
  const fav = customers[0];
  const approvedHotels = await Hotel.find({ status: 'approved' }).limit(2);
  const approvedHouses = createdHouses.filter((h) => h.status === 'approved').slice(0, 2);
  fav.favoriteHotels = approvedHotels.map((h) => h._id);
  fav.favoriteHouses = approvedHouses.map((h) => h._id);
  await fav.save();
  console.log(`❤️  Favorites: ${fav.favoriteHotels.length} hotels + ${fav.favoriteHouses.length} houses for ${fav.email}`);

  // --- Bookings + Payments spread over the last 6 months ---
  const statuses = ['confirmed', 'confirmed', 'confirmed', 'completed', 'pending', 'cancelled'];
  let bookingCount = 0;
  for (let m = 5; m >= 0; m--) {
    const perMonth = 4 + Math.floor(Math.random() * 6);
    for (let b = 0; b < perMonth; b++) {
      const { room, hotel } = rand(allRooms);
      const customer = rand(customers);
      const created = new Date();
      created.setMonth(created.getMonth() - m);
      created.setDate(1 + Math.floor(Math.random() * 25));
      created.setHours(9 + Math.floor(Math.random() * 9), 0, 0, 0);
      // Never put a creation date in the future (current month can overshoot today)
      if (created.getTime() > Date.now()) {
        created.setTime(Date.now() - Math.floor(Math.random() * 5 + 1) * 86400000);
      }
      const checkIn = daysFromNow(10 + Math.floor(Math.random() * 40) - m * 30);
      const nights = 1 + Math.floor(Math.random() * 5);
      const checkOut = new Date(checkIn); checkOut.setDate(checkOut.getDate() + nights);
      const status = rand(statuses);
      const totalPrice = nights * room.pricePerNight;
      const paid = status === 'confirmed' || status === 'completed';

      const booking = await Booking.create({
        customer: customer._id, hotel: hotel._id, room: room._id,
        checkIn, checkOut, nights, guests: 1 + Math.floor(Math.random() * 2),
        totalPrice, status, paymentStatus: paid ? 'paid' : 'unpaid',
      });
      const payment = await Payment.create({
        booking: booking._id, customer: customer._id, amount: totalPrice,
        currency: 'dzd', method: rand(['cib', 'edahabia']),
        status: paid ? 'paid' : 'pending',
      });
      // Force the historical createdAt via the raw driver — Mongoose marks
      // the timestamps `createdAt` as immutable, so $set through the model
      // is dropped. The native collection bypasses that, so the charts populate.
      await Booking.collection.updateOne({ _id: booking._id }, { $set: { createdAt: created } });
      await Payment.collection.updateOne({ _id: payment._id }, { $set: { createdAt: created } });
      bookingCount++;
    }
  }
  console.log(`📅 Bookings + payments: ${bookingCount}`);

  console.log('\n✅ Seed complete!\n');
  console.log('   Admin   →  admin@hotelsdz.dz  /  admin123');
  console.log('   Hôtelier→  owner@hotelsdz.dz  /  owner123');
  console.log('   Client  →  sara@example.com   /  pass123\n');
};

// CLI entry: `npm run seed` connects to the configured DB, seeds, disconnects.
const isDirectRun = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('src/seed.js');
if (isDirectRun) {
  (async () => {
    await connectDB();
    await seedDatabase();
    await mongoose.disconnect();
    process.exit(0);
  })().catch((e) => { console.error('Seed failed:', e); process.exit(1); });
}
