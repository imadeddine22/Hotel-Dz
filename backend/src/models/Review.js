import mongoose from 'mongoose';
import Hotel from './Hotel.js';
import House from './House.js';

// Booking.com-style scores: an overall score out of 10 + optional category scores
export const SCORE_CATEGORIES = ['cleanliness', 'location', 'value', 'staff', 'comfort'];
const score10 = { type: Number, min: 1, max: 10 };

const reviewSchema = new mongoose.Schema(
  {
    // A review is about a hotel OR a house (the property of the booking)
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', index: true },
    house: { type: mongoose.Schema.Types.ObjectId, ref: 'House', index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    score: { ...score10, required: true }, // overall, out of 10
    categories: Object.fromEntries(SCORE_CATEGORIES.map((c) => [c, score10])),
    // Legacy 1–5 rating (older reviews); kept for compatibility, score = rating × 2
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

// One review per booking
reviewSchema.index({ booking: 1 }, { unique: true });

reviewSchema.pre('validate', function (next) {
  if (!this.hotel === !this.house) this.invalidate('hotel', 'A review is about exactly one hotel or house');
  if (!this.score && this.rating) this.score = this.rating * 2;
  next();
});

/** Recompute the property's average score (/10), review count and category averages. */
reviewSchema.statics.recalc = async function ({ hotel, house }) {
  if (!hotel && !house) return;
  const key = hotel ? 'hotel' : 'house';
  const id = new mongoose.Types.ObjectId(String(hotel || house)); // $match needs an ObjectId, not a string
  const [s = {}] = await this.aggregate([
    { $match: { [key]: id } },
    {
      $group: {
        _id: null,
        avg: { $avg: '$score' },
        count: { $sum: 1 },
        ...Object.fromEntries(SCORE_CATEGORIES.map((c) => [c, { $avg: `$categories.${c}` }])),
      },
    },
  ]);
  const round = (v) => (v ? Math.round(v * 10) / 10 : 0);
  await (hotel ? Hotel : House).findByIdAndUpdate(id, {
    avgRating: round(s.avg),
    reviewsCount: s.count || 0,
    scores: Object.fromEntries(SCORE_CATEGORIES.map((c) => [c, round(s[c])])),
  });
};
// Kept for callers of the previous API
reviewSchema.statics.recalcHotel = function (hotelId) {
  return this.recalc({ hotel: hotelId });
};

reviewSchema.post('save', function () {
  this.constructor.recalc({ hotel: this.hotel, house: this.house });
});
reviewSchema.post('deleteOne', { document: true, query: false }, function () {
  this.constructor.recalc({ hotel: this.hotel, house: this.house });
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
