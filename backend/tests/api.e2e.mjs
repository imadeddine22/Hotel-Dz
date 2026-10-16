/**
 * End-to-end API tests for every role: visitor, customer, hotel/house owner, seller, admin.
 *
 * Run against the in-memory demo server (never against production — it creates and deletes data):
 *   SMTP_HOST= npm run dev:local        # terminal 1
 *   node tests/api.e2e.mjs              # terminal 2   (API_URL defaults to http://localhost:5000/api/v1)
 *
 */
const API = process.env.API_URL || 'http://localhost:5000/api/v1';
if (/onrender\.com|vercel\.app/.test(API)) {
  console.error('Refusing to run destructive e2e tests against a deployed API.');
  process.exit(1);
}

let passed = 0;
const failures = [];
let section = '';

const describe = (name) => {
  section = name;
  console.log(`\n▸ ${name}`);
};

function check(name, ok, detail = '') {
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failures.push(`[${section}] ${name}${detail ? ` — ${detail}` : ''}`);
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function req(method, path, { token, body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) {
    payload = new FormData();
    for (const [k, v] of Object.entries(form)) {
      if (k === 'images') v.forEach((blob, i) => payload.append('images', blob, `img${i}.png`));
      else payload.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
    }
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${API}${path}`, { method, headers, body: payload });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON */
  }
  return { status: res.status, data: data || {} };
}

const expectStatus = (name, r, status) =>
  check(name, r.status === status, `expected ${status}, got ${r.status} ${r.data?.message || ''}`);

// 1×1 transparent PNG
const PNG = new Blob(
  [Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')],
  { type: 'image/png' }
);

const day = (offset) => {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
};
const uid = Date.now().toString(36);

async function login(email, password) {
  const r = await req('POST', '/auth/login', { body: { email, password } });
  return r.data.token;
}

async function register(role, extra = {}) {
  const email = `${role}.${uid}.${Math.random().toString(36).slice(2, 6)}@test.dz`;
  const r = await req('POST', '/auth/register', {
    body: { fullName: `Test ${role}`, email, password: 'secret123', phone: '0555000000', role, ...extra },
  });
  return { email, token: r.data.token, user: r.data.user, status: r.status };
}

// ───────────────────────────────────────────────────────────────
describe('Visitor (public pages)');
{
  expectStatus('health check', await req('GET', '/health'), 200);

  const hotels = await req('GET', '/hotels?limit=50');
  expectStatus('list hotels', hotels, 200);
  check('only approved hotels are listed', hotels.data.hotels?.every((h) => h.status === 'approved'));

  const houses = await req('GET', '/houses?limit=50');
  check('only approved houses are listed', houses.data.houses?.every((h) => h.status === 'approved'));

  const w = await req('GET', '/wilayas');
  check('69 official wilayas are available', (w.data.wilayas || []).filter((x) => x.code >= 1 && x.code <= 69).length === 69, `got ${w.data.wilayas?.length}`);
  check('wilayas have Arabic names', w.data.wilayas?.find((x) => x.code === 6)?.arabic === 'بجاية');

  const communes = await req('GET', '/wilayas/16/communes');
  check('communes of Alger', communes.data.count === 57, `got ${communes.data.count}`);

  const accent = await req('GET', `/hotels?wilaya=${encodeURIComponent('Bejaia')}`);
  const accented = await req('GET', `/hotels?wilaya=${encodeURIComponent('Béjaïa')}`);
  check('wilaya filter ignores accents', accent.data.total === accented.data.total);

  expectStatus('pricing settings are public', await req('GET', '/pricing/prices'), 200);
  expectStatus('invalid hotel id → 404/400, not 500', { status: [400, 404].includes((await req('GET', '/hotels/not-an-id')).status) ? 404 : 500, data: {} }, 404);
  expectStatus('regex metacharacters in search do not crash', await req('GET', `/hotels?q=${encodeURIComponent('(*[')}`), 200);

  expectStatus('contact form', await req('POST', '/messages', { body: { name: 'Test', email: 'v@test.dz', subject: 'Question', content: 'Bonjour' } }), 201);
  expectStatus('contact form validates fields', await req('POST', '/messages', { body: { name: 'Test' } }), 400);
}

// ───────────────────────────────────────────────────────────────
describe('Authentication');
const customer = await register('customer');
const customer2 = await register('customer');
{
  check('register customer', customer.status === 201 && customer.user?.role === 'customer');
  const dup = await req('POST', '/auth/register', { body: { fullName: 'Dup', email: customer.email, password: 'secret123' } });
  expectStatus('duplicate email rejected', dup, 409);
  const dupCase = await req('POST', '/auth/register', { body: { fullName: 'Dup', email: customer.email.toUpperCase(), password: 'secret123' } });
  expectStatus('duplicate email rejected regardless of case', dupCase, 409);
  const admin = await req('POST', '/auth/register', { body: { fullName: 'Hacker', email: `h.${uid}@test.dz`, password: 'secret123', role: 'admin' } });
  expectStatus('cannot self-register as admin', admin, 400);
  expectStatus('wrong password', await req('POST', '/auth/login', { body: { email: customer.email, password: 'nope' } }), 401);
  check('login works with upper-case email', Boolean(await login(customer.email.toUpperCase(), 'secret123')));
  const me = await req('GET', '/auth/me', { token: customer.token });
  check('GET /auth/me', me.data.user?.email === customer.email);
  check('password hash never returned', me.data.user?.password === undefined);
  expectStatus('no token → 401', await req('GET', '/auth/me'), 401);
  expectStatus('forged token → 401', await req('GET', '/auth/me', { token: 'abc.def.ghi' }), 401);
  const upd = await req('PUT', '/auth/update-profile', { token: customer.token, body: { fullName: 'Client Testé' } });
  check('update profile', upd.data.user?.fullName === 'Client Testé');
  const role = await req('PUT', '/auth/update-profile', { token: customer.token, body: { role: 'admin' } });
  check('cannot change own role via profile', role.status === 400 || role.data.user?.role === 'customer');
}

// ───────────────────────────────────────────────────────────────
describe('Customer — hotel booking');
const adminToken = await login('admin@hotelsdz.dz', 'admin123');
const ownerToken = await login('owner@hotelsdz.dz', 'owner123');
const sara = await login('sara@example.com', 'pass123');
check('demo accounts log in', Boolean(adminToken && ownerToken && sara));

const approvedHotel = (await req('GET', '/hotels?limit=50')).data.hotels[0];
const detail = await req('GET', `/hotels/${approvedHotel._id}`);
const room = detail.data.rooms?.[0];
check('hotel detail returns rooms', Boolean(room));

let hotelBookingId;
{
  const avail = await req('POST', `/rooms/${room._id}/availability`, { body: { checkIn: day(40), checkOut: day(42) } });
  check('room availability', avail.data.available === true);

  expectStatus('anonymous cannot book', await req('POST', '/bookings', { body: { roomId: room._id, checkIn: day(40), checkOut: day(42) } }), 401);
  expectStatus('past check-in rejected', await req('POST', '/bookings', { token: customer.token, body: { roomId: room._id, checkIn: day(-3), checkOut: day(-1) } }), 400);
  expectStatus('check-out before check-in rejected', await req('POST', '/bookings', { token: customer.token, body: { roomId: room._id, checkIn: day(42), checkOut: day(40) } }), 400);
  expectStatus('too many guests rejected', await req('POST', '/bookings', { token: customer.token, body: { roomId: room._id, checkIn: day(40), checkOut: day(42), guests: room.capacity + 5 } }), 400);
  expectStatus('zero guests rejected', await req('POST', '/bookings', { token: customer.token, body: { roomId: room._id, checkIn: day(40), checkOut: day(42), guests: 0 } }), 400);
  expectStatus('garbage dates rejected', await req('POST', '/bookings', { token: customer.token, body: { roomId: room._id, checkIn: 'xx', checkOut: 'yy' } }), 400);

  const b = await req('POST', '/bookings', { token: customer.token, body: { roomId: room._id, checkIn: day(40), checkOut: day(43), guests: 1 } });
  expectStatus('book a room', b, 201);
  hotelBookingId = b.data.booking?._id;
  check('total price = nights × price', b.data.booking?.totalPrice === 3 * room.pricePerNight, `${b.data.booking?.totalPrice} vs ${3 * room.pricePerNight}`);
  check('new booking is pending/unpaid', b.data.booking?.status === 'pending' && b.data.booking?.paymentStatus === 'unpaid');

  const mine = await req('GET', '/bookings/my', { token: customer.token });
  check('booking appears in my bookings', mine.data.bookings?.some((x) => x._id === hotelBookingId));
  const other = await req('GET', '/bookings/my', { token: customer2.token });
  check("other customer can't see it", !other.data.bookings?.some((x) => x._id === hotelBookingId));

  expectStatus("other customer can't cancel it", await req('PUT', `/bookings/${hotelBookingId}/cancel`, { token: customer2.token }), 403);
  expectStatus('customer cannot confirm a booking', await req('PUT', `/bookings/${hotelBookingId}/confirm`, { token: customer.token }), 403);
  expectStatus('customer cannot mark a booking paid', await req('PUT', `/bookings/${hotelBookingId}/paid`, { token: customer.token }), 403);
  expectStatus('online payment API is gone', await req('POST', '/payments/checkout', { token: customer.token, body: { bookingId: hotelBookingId } }), 404);

  // Unpaid booking must not allow a review
  const rev = await req('POST', `/hotels/${approvedHotel._id}/reviews`, { token: customer.token, body: { bookingId: hotelBookingId, rating: 5, comment: 'Top' } });
  check('cannot review an unpaid booking', rev.status === 400 || rev.status === 403, `got ${rev.status}`);

  // Fully booked room → 409
  const tiny = (detail.data.rooms || []).reduce((a, r) => (r.quantity < a.quantity ? r : a), room);
  const statuses = [];
  for (let i = 0; i < tiny.quantity + 1; i++) {
    const r = await req('POST', '/bookings', { token: customer2.token, body: { roomId: tiny._id, checkIn: day(60), checkOut: day(61) } });
    statuses.push(r.status);
  }
  check('overbooking prevented (409 once all units are taken)', statuses.at(-1) === 409, statuses.join(','));

  const cancel = await req('PUT', `/bookings/${hotelBookingId}/cancel`, { token: customer.token });
  check('cancel own booking', cancel.data.booking?.status === 'cancelled');
  expectStatus('cancel twice → 400', await req('PUT', `/bookings/${hotelBookingId}/cancel`, { token: customer.token }), 400);
  expectStatus('owner cannot confirm a cancelled booking', await req('PUT', `/bookings/${hotelBookingId}/confirm`, { token: ownerToken }), 400);

  // Seeded customer has stays in the past: those can no longer be cancelled (and marked refunded)
  const saraBookings = (await req('GET', '/bookings/my', { token: sara })).data.bookings || [];
  const past = saraBookings.find((x) => x.status === 'confirmed' && new Date(x.checkIn) < new Date());
  if (past) {
    expectStatus('cannot cancel a stay that already started', await req('PUT', `/bookings/${past._id}/cancel`, { token: sara }), 400);
  } else {
    check('seed has a past confirmed stay to test cancellation', false);
  }
}

// ───────────────────────────────────────────────────────────────
describe('Customer — house booking, favorites');
{
  const house = (await req('GET', '/houses?limit=50')).data.houses[0];
  const hd = await req('GET', `/houses/${house._id}`);
  expectStatus('house detail', hd, 200);
  const b1 = await req('POST', '/bookings/house', { token: customer.token, body: { houseId: house._id, checkIn: day(50), checkOut: day(53), guests: 2 } });
  expectStatus('book a house', b1, 201);
  check('house total = nights × price', b1.data.booking?.totalPrice === 3 * house.pricePerNight);
  const b2 = await req('POST', '/bookings/house', { token: customer2.token, body: { houseId: house._id, checkIn: day(52), checkOut: day(55) } });
  expectStatus('overlapping house booking rejected', b2, 409);
  const b3 = await req('POST', '/bookings/house', { token: customer2.token, body: { houseId: house._id, checkIn: day(53), checkOut: day(55) } });
  expectStatus('back-to-back house booking allowed (check-out day = check-in day)', b3, 201);

  const fav = await req('POST', `/favorites/hotels/${approvedHotel._id}`, { token: customer.token });
  check('add hotel to favorites', fav.status === 200 || fav.status === 201);
  const favH = await req('POST', `/favorites/houses/${house._id}`, { token: customer.token });
  check('add house to favorites', favH.status === 200 || favH.status === 201);
  const favs = await req('GET', '/favorites', { token: customer.token });
  const favHotels = favs.data.hotels || favs.data.favorites?.hotels || favs.data.favoriteHotels || [];
  check('favorites list contains the hotel', JSON.stringify(favs.data).includes(approvedHotel._id), JSON.stringify(favs.data).slice(0, 120));
  await req('POST', `/favorites/hotels/${approvedHotel._id}`, { token: customer.token });
  const favs2 = await req('GET', '/favorites', { token: customer.token });
  check('toggle removes the favorite', !JSON.stringify(favs2.data).includes(approvedHotel._id) || favHotels.length === 0);

  expectStatus('customer blocked from admin API', await req('GET', '/admin/stats', { token: customer.token }), 403);
  expectStatus('customer blocked from owner API', await req('GET', '/owner/stats', { token: customer.token }), 403);
  expectStatus('customer blocked from seller API', await req('GET', '/seller/listings', { token: customer.token }), 403);
  expectStatus('customer cannot create a hotel', await req('POST', '/hotels', { token: customer.token, form: { name: 'X', wilaya: 'Alger', city: 'Alger' } }), 403);
}

// ───────────────────────────────────────────────────────────────
describe('Hotel owner');
const owner2 = await register('owner');
let newHotelId;
{
  check('register owner', owner2.user?.role === 'owner');
  const create = await req('POST', '/hotels', {
    token: owner2.token,
    form: {
      name: `Hôtel Test ${uid}`, description: 'Hôtel de test', wilaya: 'Béjaïa', city: 'Tichy', address: 'Rue 1',
      starRating: 4, type: 'Balnéaire', amenities: ['WiFi', 'Parking'], lat: 36.75, lng: 5.08,
      avgRating: 5, reviewsCount: 999, status: 'approved', images: [PNG],
    },
  });
  expectStatus('create hotel with image', create, 201);
  newHotelId = create.data.hotel?._id;
  check('new hotel is pending review', create.data.hotel?.status === 'pending');
  check('rating cannot be spoofed on create', create.data.hotel?.avgRating === 0 && create.data.hotel?.reviewsCount === 0, `avg=${create.data.hotel?.avgRating} count=${create.data.hotel?.reviewsCount}`);
  check('image stored', create.data.hotel?.images?.length === 1);
  check('amenities parsed', create.data.hotel?.amenities?.length === 2);

  const pub = await req('GET', '/hotels?limit=50');
  check('pending hotel hidden from public list', !pub.data.hotels.some((h) => h._id === newHotelId));
  expectStatus('pending hotel detail hidden from public', await req('GET', `/hotels/${newHotelId}`), 404);
  expectStatus('owner can still open own pending hotel', await req('GET', `/hotels/${newHotelId}`, { token: owner2.token }), 200);

  const mine = await req('GET', '/hotels/my/list', { token: owner2.token });
  check('hotel in my hotels', mine.data.hotels?.some((h) => h._id === newHotelId));

  const roomR = await req('POST', `/hotels/${newHotelId}/rooms`, {
    token: owner2.token,
    form: { type: 'double', title: 'Chambre vue mer', pricePerNight: 7500, capacity: 2, bedsCount: 1, quantity: 3, images: [PNG] },
  });
  expectStatus('add room to own hotel', roomR, 201);
  expectStatus("owner can't add rooms to someone else's hotel", await req('POST', `/hotels/${approvedHotel._id}/rooms`, { token: owner2.token, form: { type: 'double', title: 'X', pricePerNight: 1, capacity: 1, quantity: 1 } }), 403);
  expectStatus("owner can't edit someone else's hotel", await req('PUT', `/hotels/${approvedHotel._id}`, { token: owner2.token, form: { name: 'Pwned' } }), 403);
  expectStatus("owner can't delete someone else's hotel", await req('DELETE', `/hotels/${approvedHotel._id}`, { token: owner2.token }), 403);
  expectStatus("owner can't edit someone else's room", await req('PUT', `/rooms/${room._id}`, { token: owner2.token, form: { pricePerNight: 1 } }), 403);

  const upd = await req('PUT', `/rooms/${roomR.data.room?._id}`, { token: owner2.token, form: { pricePerNight: 8000 } });
  check('update own room price', upd.data.room?.pricePerNight === 8000);
  expectStatus('booking a room of a pending hotel is refused', await req('POST', '/bookings', { token: customer.token, body: { roomId: roomR.data.room?._id, checkIn: day(30), checkOut: day(31) } }), 400);

  const editH = await req('PUT', `/hotels/${newHotelId}`, { token: owner2.token, form: { description: 'Nouvelle description' } });
  check('edit own hotel', editH.data.hotel?.description === 'Nouvelle description');

  // Booking requests: the property owner accepts/refuses them and records on-site payment
  const reqA = await req('POST', '/bookings', { token: customer.token, body: { roomId: room._id, checkIn: day(80), checkOut: day(82) } });
  const idA = reqA.data.booking?._id;
  expectStatus("another owner can't confirm the request", await req('PUT', `/bookings/${idA}/confirm`, { token: owner2.token }), 403);
  expectStatus("another owner can't refuse the request", await req('PUT', `/bookings/${idA}/reject`, { token: owner2.token, body: { reason: 'x' } }), 403);
  expectStatus('cannot mark a pending request as paid', await req('PUT', `/bookings/${idA}/paid`, { token: ownerToken }), 400);
  const rej = await req('PUT', `/bookings/${idA}/reject`, { token: ownerToken, body: { reason: 'Complet à ces dates' } });
  check('owner refuses a request with a reason', rej.data.booking?.status === 'cancelled' && rej.data.booking?.rejectionReason === 'Complet à ces dates');
  check('customer sees the refusal reason', (await req('GET', '/bookings/my', { token: customer.token })).data.bookings?.find((x) => x._id === idA)?.rejectionReason === 'Complet à ces dates');

  const reqB = await req('POST', '/bookings', { token: customer.token, body: { roomId: room._id, checkIn: day(84), checkOut: day(86) } });
  const idB = reqB.data.booking?._id;
  const conf = await req('PUT', `/bookings/${idB}/confirm`, { token: ownerToken });
  check('owner accepts a request', conf.data.booking?.status === 'confirmed' && conf.data.booking?.paymentStatus === 'unpaid');
  expectStatus('cannot accept twice', await req('PUT', `/bookings/${idB}/confirm`, { token: ownerToken }), 400);
  expectStatus('cannot refuse an accepted booking', await req('PUT', `/bookings/${idB}/reject`, { token: ownerToken, body: { reason: 'x' } }), 400);
  const paid = await req('PUT', `/bookings/${idB}/paid`, { token: ownerToken });
  check('owner marks the stay as paid on site', paid.data.booking?.paymentStatus === 'paid' && Boolean(paid.data.booking?.paidAt));
  expectStatus('cannot mark paid twice', await req('PUT', `/bookings/${idB}/paid`, { token: ownerToken }), 400);
  expectStatus('paid stay unlocks a review', await req('POST', `/hotels/${approvedHotel._id}/reviews`, { token: customer.token, body: { bookingId: idB, rating: 4, comment: 'Très bien' } }), 201);
  expectStatus('admin can also confirm requests', await req('PUT', `/bookings/${(await req('POST', '/bookings', { token: customer.token, body: { roomId: room._id, checkIn: day(88), checkOut: day(89) } })).data.booking?._id}/confirm`, { token: adminToken }), 200);

  // Demo owner: stats & bookings
  const stats = await req('GET', '/owner/stats', { token: ownerToken });
  expectStatus('owner stats', stats, 200);
  const ob = await req('GET', '/bookings/owner', { token: ownerToken });
  const paidRevenue = (ob.data.bookings || []).filter((b) => b.paymentStatus === 'paid' && b.status !== 'cancelled').reduce((s, b) => s + b.totalPrice, 0);
  check('owner revenue counts only paid bookings', stats.data.totalRevenue === paidRevenue, `stats=${stats.data.totalRevenue} paid=${paidRevenue}`);
  check('owner bookings include customer contact', ob.data.bookings?.[0]?.customer?.email !== undefined);
  const ob2 = await req('GET', '/bookings/owner', { token: owner2.token });
  check("owner doesn't see other owners' bookings", (ob2.data.bookings || []).length === 0);
}

describe('House owner');
{
  const h = await req('POST', '/houses', {
    token: owner2.token,
    form: { name: `Villa ${uid}`, description: 'Villa test', wilaya: 'Tipaza', city: 'Cherchell', type: 'Villa', rooms: 3, bathrooms: 2, capacity: 6, pricePerNight: 12000, avgRating: 5, images: [PNG] },
  });
  expectStatus('create house', h, 201);
  const id = h.data.house?._id;
  check('new house pending', h.data.house?.status === 'pending');
  check('house rating cannot be spoofed', h.data.house?.avgRating === 0);
  expectStatus('pending house hidden from public', await req('GET', `/houses/${id}`), 404);
  const u = await req('PUT', `/houses/${id}`, { token: owner2.token, form: { pricePerNight: 13000 } });
  check('update own house', u.data.house?.pricePerNight === 13000);
  expectStatus("other owner can't edit it", await req('PUT', `/houses/${id}`, { token: ownerToken, form: { pricePerNight: 1 } }), 403);
  expectStatus('booking a pending house refused', await req('POST', '/bookings/house', { token: customer.token, body: { houseId: id, checkIn: day(30), checkOut: day(31) } }), 400);
  expectStatus('delete own house', await req('DELETE', `/houses/${id}`, { token: owner2.token }), 200);
}

// ───────────────────────────────────────────────────────────────
describe('Home seller');
const seller = await register('seller');
const seller2 = await register('seller');
let listingId;
{
  check('register seller', seller.user?.role === 'seller');
  const c = await req('POST', '/seller/listings', {
    token: seller.token,
    form: {
      title: `F3 Hydra ${uid}`, description: 'Bel appartement', wilaya: 'Alger', city: 'Hydra', type: 'Appartement',
      price: 25000000, area: 95, rooms: 3, bathrooms: 1, views: 100000, reference: 'REF-HACKED1', status: 'approved', images: [PNG],
    },
  });
  expectStatus('create sale listing', c, 201);
  listingId = c.data.listing?._id;
  check('listing pending review', c.data.listing?.status === 'pending');
  check('views cannot be spoofed', c.data.listing?.views === 0, `views=${c.data.listing?.views}`);
  check('reference is generated, not user-supplied', c.data.listing?.reference?.startsWith('REF-') && c.data.listing?.reference !== 'REF-HACKED1', c.data.listing?.reference);
  check('contact defaults to seller', c.data.listing?.contactEmail === seller.email);

  const pub = await req('GET', '/sales?limit=50');
  check('pending listing hidden from public list', !pub.data.listings?.some((l) => l._id === listingId));
  expectStatus('pending listing detail hidden from public', await req('GET', `/sales/${listingId}`), 404);
  expectStatus("other seller can't edit", await req('PUT', `/seller/listings/${listingId}`, { token: seller2.token, form: { price: 1 } }), 403);
  expectStatus("other seller can't delete", await req('DELETE', `/seller/listings/${listingId}`, { token: seller2.token }), 403);
  expectStatus('owner role blocked from seller API', await req('GET', '/seller/listings', { token: ownerToken }), 403);
  const u = await req('PUT', `/seller/listings/${listingId}`, { token: seller.token, form: { price: 24000000 } });
  check('edit own listing', u.data.listing?.price === 24000000);
  const s = await req('GET', '/seller/stats', { token: seller.token });
  check('seller stats', s.data.totalListings === 1 && s.data.pendingListings === 1);
  const invalid = await req('POST', '/seller/listings', { token: seller.token, form: { title: 'X', wilaya: 'Alger', city: 'Alger', price: -5 } });
  expectStatus('negative price rejected', invalid, 400);
}

// ───────────────────────────────────────────────────────────────
describe('Admin');
{
  const stats = await req('GET', '/admin/stats', { token: adminToken });
  expectStatus('admin stats', stats, 200);
  expectStatus('recent activity', await req('GET', '/admin/recent-activity', { token: adminToken }), 200);

  const pending = await req('GET', '/admin/hotels/pending', { token: adminToken });
  check('new hotel in pending queue', pending.data.hotels?.some((h) => h._id === newHotelId));
  const ap = await req('PUT', `/admin/hotels/${newHotelId}/approve`, { token: adminToken });
  check('approve hotel', ap.data.hotel?.status === 'approved');
  expectStatus('approved hotel now public', await req('GET', `/hotels/${newHotelId}`), 200);
  const rj = await req('PUT', `/admin/hotels/${newHotelId}/reject`, { token: adminToken, body: { reason: 'Photos floues' } });
  check('reject hotel with reason', rj.data.hotel?.status === 'rejected' && rj.data.hotel?.rejectionReason === 'Photos floues');
  await req('PUT', `/admin/hotels/${newHotelId}/approve`, { token: adminToken });
  check('approval clears the rejection reason', (await req('GET', `/hotels/${newHotelId}`)).data.hotel?.rejectionReason === '');

  const sa = await req('PUT', `/admin/sales/${listingId}/approve`, { token: adminToken });
  check('approve sale', sa.data.sale?.status === 'approved');
  const v1 = (await req('GET', `/sales/${listingId}`)).data.listing?.views;
  const v2 = (await req('GET', `/sales/${listingId}`)).data.listing?.views;
  const v3 = (await req('GET', `/sales/${listingId}?noview=1`)).data.listing?.views;
  check('public view increments views; noview does not', v2 === v1 + 1 && v3 === v2, `${v1},${v2},${v3}`);
  check('listing searchable by reference', (await req('GET', `/sales?reference=${sa.data.sale?.reference}`)).data.total === 1);

  const users = await req('GET', '/admin/users', { token: adminToken });
  check('list users', users.data.users?.length >= 5);
  check('user list has no password hashes', !JSON.stringify(users.data).includes('"password"'));
  const block = await req('PUT', `/admin/users/${customer2.user._id}/block`, { token: adminToken });
  check('block user', block.data.user?.isBlocked === true);
  expectStatus('blocked user cannot log in', await req('POST', '/auth/login', { body: { email: customer2.email, password: 'secret123' } }), 403);
  expectStatus("blocked user's token stops working", await req('GET', '/auth/me', { token: customer2.token }), 403);
  await req('PUT', `/admin/users/${customer2.user._id}/block`, { token: adminToken });
  check('unblock user', Boolean(await login(customer2.email, 'secret123')));
  const adminId = users.data.users.find((u) => u.role === 'admin')._id;
  expectStatus('cannot block an admin', await req('PUT', `/admin/users/${adminId}/block`, { token: adminToken }), 400);

  const bookings = await req('GET', '/admin/bookings', { token: adminToken });
  check('admin sees all bookings', (bookings.data.bookings || []).length > 0);
  const msgs = await req('GET', '/messages', { token: adminToken });
  const msg = msgs.data.messages?.[0];
  check('admin sees contact messages', Boolean(msg));
  check('mark message read', (await req('PUT', `/messages/${msg._id}/read`, { token: adminToken })).data.message?.isRead === true);
  expectStatus('delete message', await req('DELETE', `/messages/${msg._id}`, { token: adminToken }), 200);
  expectStatus('owner cannot read messages', await req('GET', '/messages', { token: ownerToken }), 403);

  expectStatus('duplicate wilaya rejected', await req('POST', '/admin/wilayas', { token: adminToken, body: { name: 'alger' } }), 400);

  const pr = await req('PUT', '/pricing/prices', { token: adminToken, body: { growthMonthlyPrice: 3100 } });
  expectStatus('admin updates pricing', pr, 200);
  check('new price is public', (await req('GET', '/pricing/prices')).data.settings?.growthMonthlyPrice === 3100);
  expectStatus('owner cannot update pricing', await req('PUT', '/pricing/prices', { token: ownerToken, body: { growthMonthlyPrice: 1 } }), 403);

  // Deleting a hotel must also remove its rooms (otherwise booking an orphan room crashes)
  const hotelRooms = (await req('GET', `/hotels/${newHotelId}/rooms`)).data.rooms || [];
  expectStatus('admin deletes hotel', await req('DELETE', `/admin/hotels/${newHotelId}`, { token: adminToken }), 200);
  const orphan = await req('POST', '/bookings', { token: customer.token, body: { roomId: hotelRooms[0]?._id, checkIn: day(70), checkOut: day(71) } });
  check('rooms of a deleted hotel are not bookable (no 500)', orphan.status === 404, `got ${orphan.status}`);

  expectStatus('admin deletes sale', await req('DELETE', `/admin/sales/${listingId}`, { token: adminToken }), 200);
  expectStatus('admin deletes user', await req('DELETE', `/admin/users/${customer2.user._id}`, { token: adminToken }), 200);
}

describe('No online payment');
{
  const r = await fetch(`${API}/payments/webhook`, { method: 'POST', body: '{}' });
  check('payment webhook endpoint removed', r.status === 404);
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log('\nFailures:');
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
}
