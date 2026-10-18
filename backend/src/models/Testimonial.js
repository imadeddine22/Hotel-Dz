import mongoose from 'mongoose';
import { autoTranslate } from '../utils/autoTranslate.js';

/**
 * A visitor's review of the platform itself (home page "Satisfied clients" section).
 * One per user; it only goes public once an admin approves it.
 */
const testimonialSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    // optional "who am I" line, e.g. "Hotel owner, Oran"
    title: { type: String, trim: true, maxlength: 80, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, minlength: 10, maxlength: 600 },
    status: { type: String, enum: ['pending', 'approved'], default: 'pending', index: true },
  },
  { timestamps: true }
);

export const TRANSLATED_FIELDS = ['title', 'comment'];
autoTranslate(testimonialSchema, TRANSLATED_FIELDS);

export default mongoose.model('Testimonial', testimonialSchema);
