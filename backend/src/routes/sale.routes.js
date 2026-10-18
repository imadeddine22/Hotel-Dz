import { Router } from 'express';
import { getListings, getListing } from '../controllers/sale.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', getListings);
router.get('/:id', optionalAuth, getListing);

export default router;
