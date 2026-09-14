import { Router } from 'express';
import { getListings, getListing } from '../controllers/sale.controller.js';

const router = Router();

// Public routes
router.get('/', getListings);
router.get('/:id', getListing);

export default router;
