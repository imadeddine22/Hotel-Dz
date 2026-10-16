import { Router } from 'express';
import { getWilayas, getWilayaCommunes } from '../controllers/wilaya.controller.js';

const router = Router();

router.get('/', getWilayas);
router.get('/:wilaya/communes', getWilayaCommunes);

export default router;
