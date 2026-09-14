import { Router } from 'express';
import {
  createBooking,
  createHouseBooking,
  getMyBookings,
  getOwnerBookings,
  cancelBooking,
} from '../controllers/booking.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', protect, authorize('customer', 'owner', 'seller'), createBooking);
router.post('/house', protect, authorize('customer', 'owner', 'seller'), createHouseBooking);
router.get('/my', protect, getMyBookings);
router.get('/owner', protect, authorize('owner', 'admin'), getOwnerBookings);
router.put('/:id/cancel', protect, cancelBooking);

export default router;
