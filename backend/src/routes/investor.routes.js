import { Router } from 'express';
import Joi from 'joi';
import { getDashboard, getMyRequests, getSaved, saveProject, unsaveProject, updatePreferences } from '../controllers/investor.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { ASSET_TYPES, PROJECT_TYPES } from '../models/InvestmentProject.js';

const router = Router();

// The investor's space: requests sent, saved projects, preferences
router.use(protect, authorize('investor', 'admin'));

const prefsSchema = Joi.object({
  wilayas: Joi.array().items(Joi.string().trim().max(60)).max(69),
  assetTypes: Joi.array().items(Joi.string().valid(...ASSET_TYPES)).max(ASSET_TYPES.length),
  projectTypes: Joi.array().items(Joi.string().valid(...PROJECT_TYPES)).max(PROJECT_TYPES.length),
  maxBudget: Joi.number().min(0).max(1e13).allow(''),
});

router.get('/dashboard', getDashboard);
router.get('/requests', getMyRequests);
router.get('/saved', getSaved);
router.post('/saved/:id', saveProject);
router.delete('/saved/:id', unsaveProject);
router.put('/preferences', validate(prefsSchema), updatePreferences);

export default router;
