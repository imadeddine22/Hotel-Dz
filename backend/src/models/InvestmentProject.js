import mongoose from 'mongoose';
import { autoTranslate } from '../utils/autoTranslate.js';
import { countryPlugin } from '../utils/countryPlugin.js';

// A property (land, shop, building…) whose owner does not want to sell it but looks for an investor / partner for a project.
export const ASSET_TYPES = ['Terrain', 'Local commercial', 'Bâtiment / immeuble', 'Maison / villa', 'Hangar / entrepôt', 'Ferme', 'Hôtel / établissement existant', 'Autre bien'];
export const PROJECT_TYPES = ['Résidentiel', 'Hôtel et tourisme', 'Commercial', 'Bureaux', 'Industriel', 'Agricole', 'Santé et éducation', 'Mixte', 'Autre'];
export const PARTNERSHIP_TYPES = ['Partenariat (parts du projet)', 'Construction contre logements', 'Location longue durée', 'Financement contre bénéfices', 'Exploitation en commun', 'À discuter'];
export const LAND_DOCUMENTS = ['Acte notarié', 'Livret foncier', 'Acte administratif', 'En cours de régularisation', 'Autre'];

const investmentProjectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 5000 }, // the project the owner has in mind
    assetType: { type: String, enum: ASSET_TYPES, default: 'Terrain', index: true }, // what the owner brings
    projectType: { type: String, enum: PROJECT_TYPES, default: 'Résidentiel' },
    partnership: { type: String, enum: PARTNERSHIP_TYPES, default: 'À discuter' },
    wilaya: { type: String, required: [true, 'Wilaya is required'] },
    city: { type: String, required: [true, 'City is required'], trim: true },
    address: { type: String, default: '' },
    coordinates: { lat: { type: Number }, lng: { type: Number } },
    area: { type: Number, required: [true, 'Area is required'], min: 1 }, // m²
    landDocument: { type: String, enum: LAND_DOCUMENTS, default: 'Acte notarié' },
    budget: { type: Number, default: 0, min: 0 }, // estimated investment needed (0 = to be defined)
    ownerShare: { type: Number, min: 0, max: 100 }, // share of the project the property owner proposes to keep (%)
    images: [{ url: { type: String, required: true }, publicId: { type: String, required: true } }],
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    rejectionReason: { type: String, default: '' },
    views: { type: Number, default: 0 },
    interestsCount: { type: Number, default: 0 },
    reference: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

investmentProjectSchema.pre('save', async function (next) {
  if (this.reference) return next();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref;
  do {
    ref = 'PRJ-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (await mongoose.model('InvestmentProject').exists({ reference: ref }));
  this.reference = ref;
  next();
});

investmentProjectSchema.index({ status: 1, wilaya: 1, createdAt: -1 });

export const TRANSLATED_FIELDS = ['title', 'description'];
countryPlugin(investmentProjectSchema);
autoTranslate(investmentProjectSchema, TRANSLATED_FIELDS);

const InvestmentProject = mongoose.model('InvestmentProject', investmentProjectSchema);
export default InvestmentProject;
