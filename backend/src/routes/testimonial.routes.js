import { Router } from 'express';
import {
  getTestimonials,
  getMyTestimonial,
  submitTestimonial,
  getAllTestimonials,
  approveTestimonial,
  deleteTestimonial,
} from '../controllers/testimonial.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getTestimonials);
router.get('/mine', protect, getMyTestimonial);
router.post('/', protect, submitTestimonial);

// Moderation
router.get('/admin', protect, authorize('admin'), getAllTestimonials);
router.put('/:id/approve', protect, authorize('admin'), approveTestimonial);
router.delete('/:id', protect, authorize('admin'), deleteTestimonial);

export default router;
