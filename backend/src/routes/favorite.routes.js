import { Router } from 'express';
import { toggleFavoriteHotel, toggleFavoriteHouse, getMyFavorites } from '../controllers/favorite.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// All favorites routes require authentication
router.use(protect);

router.get('/', getMyFavorites);
router.post('/hotels/:id', toggleFavoriteHotel);
router.post('/houses/:id', toggleFavoriteHouse);

export default router;
