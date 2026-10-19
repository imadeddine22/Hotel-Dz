import { Router } from 'express';
import Joi from 'joi';
import {
  getProjects,
  getProject,
  getMyProjects,
  createProject,
  updateProject,
  deleteProject,
  expressInterest,
  getProjectInterests,
} from '../controllers/project.controller.js';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { interestLimiter } from '../middlewares/rateLimits.middleware.js';
import { phoneRule } from '../validations/common.validation.js';
import { ASSET_TYPES, PROJECT_TYPES, PARTNERSHIP_TYPES, LAND_DOCUMENTS } from '../models/InvestmentProject.js';

const router = Router();

// Property + project, sent as multipart form data (numbers arrive as strings: Joi converts them)
const fields = {
  title: Joi.string().trim().min(5).max(120),
  description: Joi.string().trim().allow('').max(5000),
  assetType: Joi.string().valid(...ASSET_TYPES),
  projectType: Joi.string().valid(...PROJECT_TYPES),
  partnership: Joi.string().valid(...PARTNERSHIP_TYPES),
  country: Joi.string().trim().max(2),
  wilaya: Joi.string().trim().max(60),
  city: Joi.string().trim().max(80),
  address: Joi.string().trim().allow('').max(200),
  area: Joi.number().min(1).max(100000000),
  landDocument: Joi.string().valid(...LAND_DOCUMENTS),
  budget: Joi.number().min(0).max(1e13).allow(''),
  ownerShare: Joi.number().min(0).max(100).allow(''),
  contactPhone: phoneRule().allow(''),
  contactEmail: Joi.string().trim().email().allow('').max(120),
  lat: Joi.number().min(-90).max(90).allow(''),
  lng: Joi.number().min(-180).max(180).allow(''),
  keepImages: Joi.string().max(5000), // JSON list of the photos kept when editing
};
const createSchema = Joi.object({ ...fields, title: fields.title.required(), wilaya: fields.wilaya.required(), city: fields.city.required(), area: fields.area.required() });
const updateSchema = Joi.object(fields);
const interestSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  phone: phoneRule().required(),
  email: Joi.string().trim().email().allow('').max(120),
  amount: Joi.number().min(0).max(1e13).allow(''),
  message: Joi.string().trim().min(10).max(2000).required(),
});

router.get('/', getProjects);
router.get('/mine', protect, getMyProjects); // before /:id
router.get('/:id', optionalAuth, getProject);
router.post('/', protect, upload.array('images', 10), validate(createSchema), createProject);
router.put('/:id', protect, upload.array('images', 10), validate(updateSchema), updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/:id/interest', interestLimiter, optionalAuth, validate(interestSchema), expressInterest);
router.get('/:id/interests', protect, getProjectInterests);

export default router;
