import { Router } from 'express';
import {
  getPendingHotels,
  approveHotel,
  rejectHotel,
  getUsers,
  toggleBlockUser,
  getStats,
  getBookings,
  getAllHotels,
  getRecentActivity,
  deleteUser,
  deleteHotel,
  createHotelByAdmin,
  updateHotelByAdmin,
  getAllHouses,
  createHouseByAdmin,
  updateHouseByAdmin,
  approveHouse,
  rejectHouse,
  deleteHouse,
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

// Every admin route requires an authenticated admin
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/recent-activity', getRecentActivity);

// Hotels
router.get('/hotels/pending', getPendingHotels);
router.get('/hotels/all', getAllHotels);
router.post('/hotels', upload.array('images', 10), createHotelByAdmin);
router.put('/hotels/:id', upload.array('images', 10), updateHotelByAdmin);
router.put('/hotels/:id/approve', approveHotel);
router.put('/hotels/:id/reject', rejectHotel);
router.delete('/hotels/:id', deleteHotel);

// Houses
router.get('/houses/all', getAllHouses);
router.post('/houses', upload.array('images', 10), createHouseByAdmin);
router.put('/houses/:id', upload.array('images', 10), updateHouseByAdmin);
router.put('/houses/:id/approve', approveHouse);
router.put('/houses/:id/reject', rejectHouse);
router.delete('/houses/:id', deleteHouse);

// Users
router.get('/users', getUsers);
router.put('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);

// Bookings
router.get('/bookings', getBookings);

export default router;
