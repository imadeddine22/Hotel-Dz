import { Router } from 'express';
import { getHouses, getHouse, getMyHouses, createHouse, updateHouse, deleteHouse } from '../controllers/house.controller.js';
import { protect, authorize, optionalAuth } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { addReview, getReviews } from '../controllers/review.controller.js';

const router = Router();

// Public
router.get('/', getHouses);

// Owner: own houses (must be before /:id)
router.get('/my/list', protect, authorize('owner', 'admin'), getMyHouses);

// House reviews (guests who stayed)
router.get('/:houseId/reviews', getReviews);
router.post('/:houseId/reviews', protect, authorize('customer', 'owner', 'seller', 'investor'), addReview);

// Detail
router.get('/:id', optionalAuth, getHouse);

// Owner CRUD
router.post('/', protect, authorize('owner', 'admin'), upload.array('images', 10), createHouse);
router.put('/:id', protect, authorize('owner', 'admin'), upload.array('images', 10), updateHouse);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteHouse);

export default router;
