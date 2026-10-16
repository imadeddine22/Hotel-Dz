import mongoose from 'mongoose';
import Wilaya from '../models/Wilaya.js';
import { WILAYAS } from '../utils/wilayas.js';

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
  } catch (error) {
    console.error('❌ Error seeding wilayas:', error.message);
  }
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
