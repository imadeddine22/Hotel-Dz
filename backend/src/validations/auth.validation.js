import Joi from 'joi';

export const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().allow('').max(20),
  // On registration only customer or owner can be chosen (never admin)
  role: Joi.string().valid('customer', 'owner', 'seller').default('customer'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(80),
  phone: Joi.string().allow('').max(20),
  password: Joi.string().min(6).max(128),
}).min(1);
