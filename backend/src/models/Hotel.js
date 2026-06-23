import mongoose from 'mongoose';
import { WILAYA_NAMES } from '../utils/wilayas.js';

const hotelSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: [true, 'Hotel name is required'], trim: true },
    description: { type: String, default: '' },
    wilaya: {
      type: String,
      required: [true, 'Wilaya is required'],
      enum: { values: WILAYA_NAMES, message: '{VALUE} is not a valid wilaya' },
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
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    avgRating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

hotelSchema.index({ wilaya: 1, status: 1 });

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;
