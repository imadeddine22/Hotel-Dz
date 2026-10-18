import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  googleAuth,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginLimiter, registerLimiter, resetLimiter } from '../middlewares/rateLimits.middleware.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema,
} from '../validations/auth.validation.js';

const router = Router();

router.post('/register', registerLimiter, validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/forgot-password', resetLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', resetLimiter, validate(resetPasswordSchema), resetPassword);
router.post('/google', loginLimiter, validate(googleAuthSchema), googleAuth);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, validate(updateProfileSchema), updateProfile);

export default router;
