// House rules & booking policies of a hotel or house (Booking.com style).

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export const DEFAULT_POLICIES = {
  checkInFrom: '14:00',
  checkOutUntil: '12:00',
  freeCancellationDays: 2, // free cancellation until N days before arrival (0 = no free cancellation)
  childrenAllowed: true,
  petsAllowed: false,
  smokingAllowed: false,
  instantBooking: false, // true: bookings are confirmed at once, no owner approval
  customRules: [], // owner's own rules, e.g. "Familles uniquement" (max 10 × 80 chars)
};

/** Adds `policies` to a listing schema. */
export function policiesPlugin(schema) {
  schema.add({
    policies: {
      checkInFrom: { type: String, default: DEFAULT_POLICIES.checkInFrom, match: TIME },
      checkOutUntil: { type: String, default: DEFAULT_POLICIES.checkOutUntil, match: TIME },
      freeCancellationDays: { type: Number, default: DEFAULT_POLICIES.freeCancellationDays, min: 0, max: 60 },
      childrenAllowed: { type: Boolean, default: DEFAULT_POLICIES.childrenAllowed },
      petsAllowed: { type: Boolean, default: DEFAULT_POLICIES.petsAllowed },
      smokingAllowed: { type: Boolean, default: DEFAULT_POLICIES.smokingAllowed },
      instantBooking: { type: Boolean, default: DEFAULT_POLICIES.instantBooking },
      customRules: { type: [String], default: [] },
    },
  });
}

const bool = (v) => v === true || v === 'true' || v === '1' || v === 1 || v === 'on';

/**
 * Policies from a request body (object, or JSON string when sent as multipart form data),
 * merged over the current ones. Unknown keys are dropped; invalid values keep the current value.
 * Returns undefined when the body has no policies.
 */
export function parsePolicies(input, current = {}) {
  if (input === undefined || input === null || input === '') return undefined;
  let p = input;
  if (typeof p === 'string') {
    try {
      p = JSON.parse(p);
    } catch {
      return undefined;
    }
  }
  if (typeof p !== 'object') return undefined;
  const base = { ...DEFAULT_POLICIES, ...(current?.toObject ? current.toObject() : current) };
  const out = { ...base };
  if (TIME.test(p.checkInFrom)) out.checkInFrom = p.checkInFrom;
  if (TIME.test(p.checkOutUntil)) out.checkOutUntil = p.checkOutUntil;
  const days = Number(p.freeCancellationDays);
  if (p.freeCancellationDays !== undefined && Number.isInteger(days) && days >= 0 && days <= 60) out.freeCancellationDays = days;
  for (const k of ['childrenAllowed', 'petsAllowed', 'smokingAllowed', 'instantBooking']) {
    if (p[k] !== undefined) out[k] = bool(p[k]);
  }
  if (Array.isArray(p.customRules)) {
    // free text from the owner: trimmed, no duplicates, at most 10 rules of 80 characters
    const seen = new Set();
    out.customRules = p.customRules
      .map((r) => String(r ?? '').replace(/\s+/g, ' ').trim().slice(0, 80))
      .filter((r) => r && !seen.has(r.toLowerCase()) && seen.add(r.toLowerCase()))
      .slice(0, 10);
  }
  return out;
}

/** Last moment a booking can be cancelled for free (start of the day N days before arrival). */
export function freeCancellationDeadline(checkIn, days) {
  if (!days) return null;
  const d = new Date(checkIn);
  d.setDate(d.getDate() - days);
  return d;
}
