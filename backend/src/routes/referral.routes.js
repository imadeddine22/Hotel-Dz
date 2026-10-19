import { Router } from 'express';
import Joi from 'joi';
import { createReferral } from '../controllers/referral.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { referralLimiter } from '../middlewares/rateLimits.middleware.js';
import { REFERRAL_SOURCES } from '../models/Referral.js';

const router = Router();

const referralSchema = Joi.object({
  source: Joi.string().valid(...REFERRAL_SOURCES).required(),
  other: Joi.string().trim().allow('').max(120),
  lang: Joi.string().valid('fr', 'ar', 'en'),
  page: Joi.string().trim().allow('').max(200),
});

// Public: answers from the welcome notification (limited per IP)
router.post('/', referralLimiter, optionalAuth, validate(referralSchema), createReferral);

export default router;
