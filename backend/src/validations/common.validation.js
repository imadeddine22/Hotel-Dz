import Joi from 'joi';

/** Phone number typed by a visitor: +213 555 12 34 56, 0555-12-34-56, (021) 00 00 00… — 8 to 15 digits. */
export const phoneRule = () =>
  Joi.string()
    .trim()
    .pattern(/^\+?[\d\s().-]{8,22}$/)
    .custom((v, h) => (/^\d{8,15}$/.test(v.replace(/\D/g, '')) ? v : h.error('string.pattern.base')))
    .messages({ 'string.pattern.base': 'Invalid phone number', 'string.empty': 'Phone number is required', 'any.required': 'Phone number is required' });
