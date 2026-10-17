// Rooms sent together with a new hotel ("what the hotel offers"): one row per room type.

const TYPES = ['single', 'double', 'suite', 'family'];
const DEFAULT_TITLE = { single: 'Chambre simple', double: 'Chambre double', suite: 'Suite', family: 'Chambre familiale' };
const DEFAULT_CAPACITY = { single: 1, double: 2, suite: 3, family: 4 };

const int = (v, min, max, fallback) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
};

/**
 * Rooms from a request body (array, or JSON string in multipart form data).
 * Returns { rooms } (possibly empty) or { error } describing the first invalid row.
 * Only known fields are kept (no hotel/owner/status injection).
 */
export function parseRoomList(input) {
  if (input === undefined || input === null || input === '') return { rooms: [] };
  let list = input;
  if (typeof list === 'string') {
    try {
      list = JSON.parse(list);
    } catch {
      return { error: 'Invalid room list' };
    }
  }
  if (!Array.isArray(list)) return { error: 'Invalid room list' };
  if (list.length > 20) return { error: 'Too many room types (20 max)' };

  const rooms = [];
  for (const [i, r] of list.entries()) {
    if (!r || typeof r !== 'object') return { error: `Room ${i + 1}: invalid` };
    const type = TYPES.includes(r.type) ? r.type : null;
    if (!type) return { error: `Room ${i + 1}: unknown room type` };
    const price = Number(r.pricePerNight);
    if (!Number.isFinite(price) || price <= 0) return { error: `Room ${i + 1}: price per night is required` };
    const capacity = int(r.capacity, 1, 20, DEFAULT_CAPACITY[type]);
    rooms.push({
      type,
      title: String(r.title || '').trim().slice(0, 80) || DEFAULT_TITLE[type],
      pricePerNight: Math.round(price),
      capacity,
      bedsCount: int(r.bedsCount, 1, 10, Math.max(1, Math.min(capacity, 3))),
      quantity: int(r.quantity, 1, 500, 1),
    });
  }
  return { rooms };
}
