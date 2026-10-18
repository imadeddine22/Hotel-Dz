import { Router } from 'express';
import { getWilayas, getPopularWilayas, getWilayaCommunes } from '../controllers/wilaya.controller.js';

const router = Router();

router.get('/', getWilayas);
router.get('/popular', getPopularWilayas);
router.get('/:wilaya/communes', getWilayaCommunes);

export default router;
