import { Router } from 'express';
import {
  getOrCreateForBooking,
  getMyConversations,
  getUnreadCount,
  getConversation,
  sendMessage,
} from '../controllers/conversation.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

// Guest ↔ owner messages, one conversation per booking (only the two parties; admins can read)
const router = Router();
router.use(protect);

router.get('/', getMyConversations);
router.get('/unread', getUnreadCount);
router.get('/booking/:bookingId', getOrCreateForBooking);
router.get('/:id', getConversation);
router.post('/:id/messages', sendMessage);

export default router;
