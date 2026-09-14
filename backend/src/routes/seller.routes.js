import { Router } from 'express';
import { getSellerStats, getMyListings, createListing, updateListing, deleteListing } from '../controllers/seller.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

// All seller routes require authentication and 'seller' or 'admin' role
router.use(protect);
router.use(authorize('seller', 'admin'));

router.get('/stats', getSellerStats);
router.get('/listings', getMyListings);
router.post('/listings', upload.array('images', 10), createListing);
router.put('/listings/:id', upload.array('images', 10), updateListing);
router.delete('/listings/:id', deleteListing);

export default router;
