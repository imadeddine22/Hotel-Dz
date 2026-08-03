import mongoose from 'mongoose';
import Wilaya from '../models/Wilaya.js';
import { WILAYAS } from '../utils/wilayas.js';

const seedWilayas = async () => {
  try {
    const count = await Wilaya.countDocuments();
    if (count === 0) {
      await Wilaya.insertMany(WILAYAS);
      console.log('✅ Wilayas seeded successfully');
    }
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
    await seedWilayas();
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
