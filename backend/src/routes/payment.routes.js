import { Router } from 'express';
import {
  createCheckout,
  handleWebhook,
  getPaymentStatus,
  retryCheckout,
} from '../controllers/payment.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Webhook is public (verified by HMAC signature). Raw body parsing is set in app.js.
router.post('/webhook', handleWebhook);

// Customer routes
router.post('/checkout',               protect, authorize('customer', 'owner', 'seller'), createCheckout);
router.post('/retry/:bookingId',        protect, authorize('customer', 'owner', 'seller'), retryCheckout);
router.get('/:bookingId',               protect, getPaymentStatus);

export default router;
