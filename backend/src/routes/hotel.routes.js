import { Router } from 'express';
import {
  getHotels,
  getHotel,
  getMyHotels,
  createHotel,
  updateHotel,
  deleteHotel,
} from '../controllers/hotel.controller.js';
import { getRoomsByHotel, createRoom } from '../controllers/room.controller.js';
import { addReview, getHotelReviews } from '../controllers/review.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

// Public
router.get('/', getHotels);

// Owner: own hotels (must be before /:id)
router.get('/my/list', protect, authorize('owner', 'admin'), getMyHotels);

// Hotel-scoped rooms
router.get('/:hotelId/rooms', getRoomsByHotel);
router.post(
  '/:hotelId/rooms',
  protect,
  authorize('owner', 'admin'),
  upload.array('images', 8),
  createRoom
);

// Hotel-scoped reviews
router.get('/:hotelId/reviews', getHotelReviews);
router.post('/:hotelId/reviews', protect, authorize('customer'), addReview);

router.get('/:id', getHotel);

// Owner CRUD
router.post('/', protect, authorize('owner', 'admin'), upload.array('images', 10), createHotel);
router.put('/:id', protect, authorize('owner', 'admin'), upload.array('images', 10), updateHotel);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteHotel);

export default router;
