import Review, { SCORE_CATEGORIES } from '../models/Review.js';
import Booking from '../models/Booking.js';

/** Score out of 10 from the body: `score` (1–10), or a legacy `rating` (1–5, ×2). */
const readScore = (body) => {
  const score = Number(body.score);
  if (Number.isFinite(score) && score >= 1 && score <= 10) return Math.round(score * 10) / 10;
  const rating = Number(body.rating);
  if (Number.isFinite(rating) && rating >= 1 && rating <= 5) return rating * 2;
  return null;
};
const readCategories = (input) => {
  const out = {};
  for (const c of SCORE_CATEGORIES) {
    const v = Number(input?.[c]);
    if (Number.isFinite(v) && v >= 1 && v <= 10) out[c] = Math.round(v);
  }
  return out;
};

/**
 * POST /hotels/:hotelId/reviews  and  POST /houses/:houseId/reviews
 * Only a guest who really stayed (paid on site, or confirmed and finished) can review, once per booking.
 */
export const addReview = async (req, res, next) => {
  try {
    const kind = req.params.houseId ? 'house' : 'hotel';
    const propertyId = req.params.houseId || req.params.hotelId;
    const { comment, bookingId } = req.body;

    const score = readScore(req.body);
    if (!score) return res.status(400).json({ success: false, message: 'Score must be between 1 and 10' });

    const booking = await Booking.findOne({ _id: bookingId, [kind]: propertyId, customer: req.user._id });
    if (!booking) {
      return res.status(403).json({ success: false, message: kind === 'house' ? 'You can only review houses you have booked' : 'You can only review hotels you have booked' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot review a cancelled booking' });
    }
    // A booking request costs nothing to create, so only a real stay unlocks reviews:
    // paid on site, or confirmed by the owner and already finished
    const stayed = booking.paymentStatus === 'paid' || (booking.status === 'confirmed' && new Date(booking.checkOut) < new Date());
    if (!stayed) {
      return res.status(403).json({ success: false, message: 'You can only review a stay you have completed' });
    }

    const exists = await Review.findOne({ booking: bookingId });
    if (exists) {
      return res.status(409).json({ success: false, message: 'You already reviewed this booking' });
    }

    const review = await Review.create({
      [kind]: propertyId,
      customer: req.user._id,
      booking: bookingId,
      score,
      categories: readCategories(req.body.categories),
      comment: String(comment || '').slice(0, 2000),
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    next(err);
  }
};

/** GET /hotels/:hotelId/reviews  and  GET /houses/:houseId/reviews */
export const getReviews = async (req, res, next) => {
  try {
    const filter = req.params.houseId ? { house: req.params.houseId } : { hotel: req.params.hotelId };
    const reviews = await Review.find(filter).populate('customer', 'fullName avatar').sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    next(err);
  }
};
export const getHotelReviews = getReviews;

/** GET /reviews/mine — the logged-in guest's reviews (to know which stays are already reviewed) */
export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ customer: req.user._id }).select('booking score hotel house createdAt');
    res.json({ success: true, reviews });
  } catch (err) {
    next(err);
  }
};

// DELETE /reviews/:id  (author or admin)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (review.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};
