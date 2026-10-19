import rateLimit from 'express-rate-limit';

const tooMany = { success: false, message: 'Too many attempts, please try again later' };
const base = { standardHeaders: true, legacyHeaders: false, message: tooMany };

/**
 * Login: only FAILED attempts count, per IP and email — stops password guessing on one account
 * without locking out many people sharing one mobile-carrier IP (CGNAT is common in Algeria).
 */
export const loginLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${req.ip}|${String(req.body?.email || '').toLowerCase()}`,
});

/** Sign-ups per IP (fake account farming). */
export const registerLimiter = rateLimit({ ...base, windowMs: 60 * 60 * 1000, max: 50 });

/** Password reset emails / token tries per IP (mail bombing, token guessing). */
export const resetLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, max: 10 });

/** Public contact form per IP (spam). */
export const contactLimiter = rateLimit({ ...base, windowMs: 60 * 60 * 1000, max: 10 });

/** Investor "I'm interested" requests per IP (spam towards land owners). */
export const interestLimiter = rateLimit({ ...base, windowMs: 60 * 60 * 1000, max: 20 });
