import { Router } from 'express';
import { deleteReview } from '../controllers/review.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Hotel-scoped review endpoints (add / list) live on /hotels/:hotelId/reviews
// (see hotel.routes.js). This router handles standalone review operations.
router.delete('/:id', protect, deleteReview);

export default router;
