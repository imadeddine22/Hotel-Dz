/**
 * Account linking of "Sign in with Google" (no real Google token needed):
 *   node tests/google-link.check.mjs
 */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = await MongoMemoryServer.create({ binary: { version: process.env.MONGOMS_VERSION || '7.0.14' } });
await mongoose.connect(mongod.getUri('google-check'));
const { default: User } = await import('../src/models/User.js');
const { findOrCreateGoogleUser } = await import('../src/controllers/auth.controller.js');

let failed = 0;
const check = (name, ok) => {
  console.log(`  ${ok ? '✓' : '✗'} ${name}`);
  if (!ok) failed++;
};

const existing = await User.create({ fullName: 'Amina', email: 'amina@test.dz', password: 'secret123', role: 'owner' });
const profile = { googleId: 'g-1', email: 'amina@test.dz', emailVerified: true, fullName: 'Amina B', picture: 'https://lh3.googleusercontent.com/a' };

const a = await findOrCreateGoogleUser(profile, 'customer');
check('same email: existing account is linked, not duplicated', !a.created && String(a.user._id) === String(existing._id));
check('linked account keeps its role and password', a.user.role === 'owner' && (await (await User.findById(existing._id).select('+password')).matchPassword('secret123')));
check('linked account is verified, gets the Google photo', a.user.isVerified && a.user.avatar.url === profile.picture);

const b = await findOrCreateGoogleUser({ ...profile, email: 'new-email@test.dz' });
check('next time: found by Google id even if the email changed', !b.created && String(b.user._id) === String(existing._id));

const c = await findOrCreateGoogleUser({ googleId: 'g-2', email: 'karim@test.dz', emailVerified: true, fullName: 'Karim', picture: '' }, 'seller');
check('new Google user: account created with the chosen role', c.created && c.user.role === 'seller' && c.user.isVerified);
const d = await findOrCreateGoogleUser({ googleId: 'g-3', email: 'x@test.dz', emailVerified: true, fullName: 'X', picture: '' }, 'admin');
check('role "admin" can never be chosen', d.user.role === 'customer');
check('one account per email', (await User.countDocuments({ email: 'amina@test.dz' })) === 1);

await mongoose.disconnect();
await mongod.stop();
console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
