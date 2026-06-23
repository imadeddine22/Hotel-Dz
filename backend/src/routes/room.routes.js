import { Router } from 'express';
import {
  getRoom,
  updateRoom,
  deleteRoom,
  checkRoomAvailability,
} from '../controllers/room.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.get('/:id', getRoom);
router.post('/:id/availability', checkRoomAvailability);
router.put('/:id', protect, authorize('owner', 'admin'), upload.array('images', 8), updateRoom);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteRoom);

export default router;
