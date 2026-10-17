import mongoose from 'mongoose';
import Wilaya from '../models/Wilaya.js';
import { WILAYAS } from '../utils/wilayas.js';
import Hotel from '../models/Hotel.js';
import House from '../models/House.js';
import HouseForSale from '../models/HouseForSale.js';
import Booking from '../models/Booking.js';

// Upsert the official wilayas on every start so new divisions (e.g. 58 → 69) and
// Arabic names reach existing databases. Admin-added wilayas are left untouched.
export const syncWilayas = async () => {
  try {
    const res = await Wilaya.bulkWrite(
      WILAYAS.map((w) => ({
        updateOne: {
          filter: { name: w.name },
          update: { $set: { code: w.code, arabic: w.arabic, ascii: w.ascii } },
          upsert: true,
        },
      }))
    );
    if (res.upsertedCount) console.log(`✅ ${res.upsertedCount} wilaya(s) added`);
    await backfillCountries();
  } catch (error) {
    console.error('❌ Error seeding wilayas:', error.message);
  }
};

// Listings and bookings created before multi-country support are Algerian, in DZD.
const backfillCountries = async () => {
  const missing = { country: { $exists: false } };
  const done = await Promise.all([Hotel, House, HouseForSale].map((M) => M.updateMany(missing, { $set: { country: 'DZ', currency: 'DZD' } })));
  await Booking.updateMany({ currency: { $exists: false } }, { $set: { currency: 'DZD' } });
  const n = done.reduce((sum, r) => sum + (r.modifiedCount || 0), 0);
  if (n) console.log(`🌍 ${n} listing(s) set to Algeria (DZD)`);
};

/**
 * Connect to MongoDB using the MONGO_URI environment variable.
 * Exits the process on failure so the app doesn't run without a database.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    await syncWilayas();
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
