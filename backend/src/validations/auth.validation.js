import Joi from 'joi';

export const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().allow('').max(20),
  // On registration admin can never be chosen
  role: Joi.string().valid('customer', 'owner', 'seller', 'investor').default('customer'),
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

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  lang: Joi.string().valid('fr', 'ar', 'en').default('fr'),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().hex().length(64).required(),
  password: Joi.string().min(6).max(128).required(),
});

export const googleAuthSchema = Joi.object({
  credential: Joi.string().max(4096).required(),
  role: Joi.string().valid('customer', 'owner', 'seller', 'investor').default('customer'),
});
