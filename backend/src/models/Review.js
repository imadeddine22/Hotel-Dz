import mongoose from 'mongoose';
import Hotel from './Hotel.js';

const reviewSchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

// One review per booking
reviewSchema.index({ booking: 1 }, { unique: true });

/**
 * Recompute the hotel's avgRating and reviewsCount.
 */
reviewSchema.statics.recalcHotel = async function (hotelId) {
  const stats = await this.aggregate([
    { $match: { hotel: hotelId } },
    { $group: { _id: '$hotel', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Hotel.findByIdAndUpdate(hotelId, {
    avgRating: Math.round(avg * 10) / 10,
    reviewsCount: count,
  });
};

reviewSchema.post('save', function () {
  this.constructor.recalcHotel(this.hotel);
});
reviewSchema.post('deleteOne', { document: true, query: false }, function () {
  this.constructor.recalcHotel(this.hotel);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
