import { Router } from 'express';
import Joi from 'joi';
import { sendMessage, getMessages, markAsRead, deleteMessage } from '../controllers/message.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { contactLimiter } from '../middlewares/rateLimits.middleware.js';

const router = Router();

const contactSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().email().max(120).required(),
  // +213 555 12 34 56, 0555-12-34-56, (021) 00 00 00… : 8 to 15 digits
  phone: Joi.string()
    .trim()
    .pattern(/^\+?[\d\s().-]{8,22}$/)
    .custom((v, h) => (/^\d{8,15}$/.test(v.replace(/\D/g, '')) ? v : h.error('string.pattern.base')))
    .required()
    .messages({ 'string.pattern.base': 'Invalid phone number', 'string.empty': 'Phone number is required', 'any.required': 'Phone number is required' }),
  subject: Joi.string().trim().min(2).max(150).required(),
  content: Joi.string().trim().min(5).max(5000).required(),
});

// Public route to send a message
router.post('/', contactLimiter, validate(contactSchema), sendMessage);

// Admin only routes
router.get('/', protect, authorize('admin'), getMessages);
router.put('/:id/read', protect, authorize('admin'), markAsRead);
router.delete('/:id', protect, authorize('admin'), deleteMessage);

export default router;
