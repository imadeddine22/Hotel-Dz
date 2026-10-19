import { Router } from 'express';
import {
  createBooking,
  createHouseBooking,
  getMyBookings,
  getOwnerBookings,
  cancelBooking,
  confirmBooking,
  rejectBooking,
  markBookingPaid,
} from '../controllers/booking.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', protect, authorize('customer', 'owner', 'seller', 'investor'), createBooking);
router.post('/house', protect, authorize('customer', 'owner', 'seller', 'investor'), createHouseBooking);
router.get('/my', protect, getMyBookings);
router.get('/owner', protect, authorize('owner', 'admin'), getOwnerBookings);
router.put('/:id/cancel', protect, cancelBooking);

// Owner answers booking requests and records on-site payment
router.put('/:id/confirm', protect, authorize('owner', 'admin'), confirmBooking);
router.put('/:id/reject', protect, authorize('owner', 'admin'), rejectBooking);
router.put('/:id/paid', protect, authorize('owner', 'admin'), markBookingPaid);

export default router;
