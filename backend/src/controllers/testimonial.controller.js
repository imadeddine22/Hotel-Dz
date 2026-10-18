import Testimonial from '../models/Testimonial.js';

const PUBLIC_FIELDS = 'name title rating comment translations sourceLang createdAt user';

// GET /testimonials — approved testimonials, newest first (public)
export const getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ status: 'approved' })
      .select(PUBLIC_FIELDS)
      .populate('user', 'avatar')
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();
    res.json({ success: true, testimonials });
  } catch (err) {
    next(err);
  }
};

// GET /testimonials/mine — the logged-in user's own testimonial (any status)
export const getMyTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findOne({ user: req.user._id });
    res.json({ success: true, testimonial });
  } catch (err) {
    next(err);
  }
};

// POST /testimonials — create or replace the user's testimonial; it goes back to moderation
export const submitTestimonial = async (req, res, next) => {
  try {
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || '').trim();
    const title = String(req.body.title || '').trim().slice(0, 80);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    if (comment.length < 10 || comment.length > 600) {
      return res.status(400).json({ success: false, message: 'Your review must be between 10 and 600 characters' });
    }

    let testimonial = await Testimonial.findOne({ user: req.user._id });
    if (!testimonial) testimonial = new Testimonial({ user: req.user._id });
    Object.assign(testimonial, { name: req.user.fullName, title, rating, comment, status: 'pending' });
    await testimonial.save();

    res.status(201).json({ success: true, message: 'Thank you! Your review will be published once approved', testimonial });
  } catch (err) {
    next(err);
  }
};

// GET /testimonials/admin?status=pending|approved — moderation list (admin)
export const getAllTestimonials = async (req, res, next) => {
  try {
    const filter = ['pending', 'approved'].includes(req.query.status) ? { status: req.query.status } : {};
    const testimonials = await Testimonial.find(filter).populate('user', 'email avatar').sort({ createdAt: -1 });
    const pending = await Testimonial.countDocuments({ status: 'pending' });
    res.json({ success: true, pending, testimonials });
  } catch (err) {
    next(err);
  }
};

// PUT /testimonials/:id/approve — publish (admin)
export const approveTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    testimonial.status = 'approved';
    await testimonial.save();
    res.json({ success: true, testimonial });
  } catch (err) {
    next(err);
  }
};

// DELETE /testimonials/:id — reject or remove (admin)
export const deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (err) {
    next(err);
  }
};
