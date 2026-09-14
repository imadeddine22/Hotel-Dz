import { Router } from 'express';
import { getPrices, updatePrices } from '../controllers/pricing.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Public route to get current prices
router.get('/prices', getPrices);

// Admin-only route to update prices
router.put('/prices', protect, authorize('admin'), updatePrices);

export default router;
