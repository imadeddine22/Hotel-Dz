import { discountPlugin } from '../utils/pricing.js';
import mongoose from 'mongoose';
import { autoTranslate } from '../utils/autoTranslate.js';

const roomSchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
    type: {
      type: String,
      enum: ['single', 'double', 'suite', 'family'],
      required: true,
    },
    title: { type: String, required: [true, 'Room title is required'], trim: true },
    description: { type: String, default: '' },
    pricePerNight: { type: Number, required: [true, 'Price is required'], min: 0 }, // DZD
    capacity: { type: Number, default: 2, min: 1 },
    bedsCount: { type: Number, default: 1, min: 1 },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    amenities: [{ type: String }],
    quantity: { type: Number, default: 1, min: 1 }, // how many rooms of this type
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Name/description/amenities are machine-translated into the other site languages after each save
export const TRANSLATED_FIELDS = ['title', 'description', 'amenities'];
discountPlugin(roomSchema);
autoTranslate(roomSchema, TRANSLATED_FIELDS);

const Room = mongoose.model('Room', roomSchema);
export default Room;
