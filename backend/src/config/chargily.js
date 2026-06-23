import { ChargilyClient } from '@chargily/chargily-pay';

/**
 * Chargily Pay client for DZD payments (CIB / EDAHABIA).
 * Uses CHARGILY_SECRET_KEY and CHARGILY_MODE ("test" | "live").
 */
const chargilyClient = new ChargilyClient({
  api_key: process.env.CHARGILY_SECRET_KEY,
  mode: process.env.CHARGILY_MODE || 'test',
});

export default chargilyClient;
