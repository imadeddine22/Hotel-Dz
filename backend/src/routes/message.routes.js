import { Router } from 'express';
import { sendMessage, getMessages, markAsRead, deleteMessage } from '../controllers/message.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Public route to send a message
router.post('/', sendMessage);

// Admin only routes
router.get('/', protect, authorize('admin'), getMessages);
router.put('/:id/read', protect, authorize('admin'), markAsRead);
router.delete('/:id', protect, authorize('admin'), deleteMessage);

export default router;
