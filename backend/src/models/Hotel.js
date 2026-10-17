import mongoose from 'mongoose';
import { autoTranslate } from '../utils/autoTranslate.js';
import { countryPlugin } from '../utils/countryPlugin.js';

const hotelSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: [true, 'Hotel name is required'], trim: true },
    description: { type: String, default: '' },
    wilaya: {
      type: String,
      required: [true, 'Wilaya is required'],
    },
    city: { type: String, required: [true, 'City is required'], trim: true },
    address: { type: String, default: '' },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    amenities: [{ type: String }],
    starRating: { type: Number, min: 1, max: 5, default: 3 },
    type: {
      type: String,
      enum: ['Luxe', 'Affaires', 'Balnéaire', 'Riad', 'Boutique', 'Montagne', 'Désert', 'Appart-hôtel', 'Économique'],
      default: 'Économique',
    },
    suitableFor: [{ 
      type: String, 
      enum: ['Familles', 'Amis', 'Couples', 'Solo', 'Affaires'] 
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String, default: '' },
    avgRating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

hotelSchema.index({ wilaya: 1, status: 1 });

// Name/description/amenities are machine-translated into the other site languages after each save
export const TRANSLATED_FIELDS = ['name', 'description', 'amenities'];
countryPlugin(hotelSchema);
autoTranslate(hotelSchema, TRANSLATED_FIELDS);

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;
