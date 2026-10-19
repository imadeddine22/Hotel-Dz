import { Router } from 'express';
import { getMetaCatalog } from '../controllers/feed.controller.js';

const router = Router();

// Public: only published listings, the same data as the site's pages
router.get('/meta-catalog.csv', getMetaCatalog);

export default router;
