import { Router } from 'express';
import {
  createCheckout,
  handleWebhook,
  getPaymentStatus,
} from '../controllers/payment.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Webhook is public (verified by signature). Raw body parsing is set in app.js.
router.post('/webhook', handleWebhook);

router.post('/checkout', protect, authorize('customer'), createCheckout);
router.get('/:bookingId', protect, getPaymentStatus);

export default router;
