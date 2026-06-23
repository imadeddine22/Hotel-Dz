import Review from '../models/Review.js';
import Booking from '../models/Booking.js';

// POST /hotels/:hotelId/reviews  (customer who booked)
export const addReview = async (req, res, next) => {
  try {
    const { hotelId } = req.params;
    const { rating, comment, bookingId } = req.body;

    // Only a customer who actually booked this hotel can review
    const booking = await Booking.findOne({
      _id: bookingId,
      hotel: hotelId,
      customer: req.user._id,
    });
    if (!booking) {
      return res.status(403).json({ success: false, message: 'You can only review hotels you have booked' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot review a cancelled booking' });
    }

    const exists = await Review.findOne({ booking: bookingId });
    if (exists) {
      return res.status(409).json({ success: false, message: 'You already reviewed this booking' });
    }

    const review = await Review.create({
      hotel: hotelId,
      customer: req.user._id,
      booking: bookingId,
      rating,
      comment,
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    next(err);
  }
};

// GET /hotels/:hotelId/reviews
export const getHotelReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ hotel: req.params.hotelId })
      .populate('customer', 'fullName avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
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
