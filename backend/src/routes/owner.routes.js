import express from 'express';
import { getOwnerStats } from '../controllers/owner.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All owner routes require authentication and 'owner' or 'admin' role
router.use(protect);
router.use(authorize('owner', 'admin'));

router.get('/stats', getOwnerStats);

export default router;
