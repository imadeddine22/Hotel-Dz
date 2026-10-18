import { Router } from 'express';
import { getReels, uploadReel, deleteReel } from '../controllers/reel.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { reelUpload } from '../middlewares/upload.middleware.js';

const router = Router();

// Public feed (Reels page) and the owners' upload / removal of their listing's video
router.get('/', getReels);
router.put('/:kind/:id', protect, authorize('owner', 'seller', 'admin'), reelUpload, uploadReel);
router.delete('/:kind/:id', protect, authorize('owner', 'seller', 'admin'), deleteReel);

export default router;
