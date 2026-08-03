/**
 * Local development server backed by an IN-MEMORY MongoDB.
 *
 * Use this when the Atlas connection is blocked (TLS interception by an
 * antivirus/VPN/firewall, IP not whitelisted, or simply offline). It spins up a
 * throwaway MongoDB inside this process — no Atlas, no TLS, no internet — seeds
 * it with demo data, then starts the API exactly like server.js.
 *
 *   npm run dev:local
 *
 * Data is reset every restart (and re-seeded), so the demo accounts always work:
 *   admin@hotelsdz.dz / admin123   ·   owner@hotelsdz.dz / owner123   ·   sara@example.com / pass123
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const PORT = process.env.PORT || 5000;

const start = async () => {
  console.log('🧪 Starting in-memory MongoDB (no Atlas / TLS / internet needed)...');
  console.log('   (first run downloads a ~200 MB MongoDB binary once, then it is cached)');
  const mongod = await MongoMemoryServer.create({
    binary: { version: process.env.MONGOMS_VERSION || '7.0.14' },
  });
  const uri = mongod.getUri('dzhotels');
  process.env.MONGO_URI = uri;

  await mongoose.connect(uri);
  console.log('✅ Connected to in-memory MongoDB');

  // Seed demo data (the models are registered on the active connection).
  const { seedDatabase } = await import('./src/seed.js');
  await seedDatabase();

  const app = (await import('./src/app.js')).default;
  app.listen(PORT, () => {
    console.log(`🚀 DzHotels API (LOCAL in-memory DB) on port ${PORT}`);
    console.log('   Login → admin@hotelsdz.dz / admin123');
  });

  const shutdown = async () => {
    await mongoose.disconnect().catch(() => {});
    await mongod.stop().catch(() => {});
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

start().catch((e) => {
  console.error('Local dev start failed:', e.message);
  process.exit(1);
});
