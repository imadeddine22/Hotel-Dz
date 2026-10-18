import mongoose from 'mongoose';
import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';
import { MAX_FEATURED } from './hotel.controller.js';

const PERIODS = [7, 30, 90, 365, 0]; // days; 0 = since the beginning

// GET /admin/hotels/demand?days=90 — approved hotels ranked by booking requests over the period,
// with the current home page selection, so the admin can feature the most wanted ones
export const getHotelDemand = async (req, res, next) => {
  try {
    const days = PERIODS.includes(Number(req.query.days)) ? Number(req.query.days) : 90;
    const match = { propertyType: 'hotel' };
    if (days) match.createdAt = { $gte: new Date(Date.now() - days * 86400000) };

    const [stats, hotels] = await Promise.all([
      Booking.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$hotel',
            requests: { $sum: 1 },
            confirmed: { $sum: { $cond: [{ $in: ['$status', ['confirmed', 'completed']] }, 1, 0] } },
            nights: { $sum: { $cond: [{ $in: ['$status', ['confirmed', 'completed']] }, '$nights', 0] } },
          },
        },
      ]),
      Hotel.find({ status: 'approved' })
        .select('name wilaya city images starRating avgRating reviewsCount featured featuredRank')
        .lean(),
    ]);

    const byHotel = new Map(stats.map((s) => [String(s._id), s]));
    const rows = hotels
      .map((h) => {
        const s = byHotel.get(String(h._id));
        return { ...h, image: h.images?.[0]?.url || h.images?.[0] || '', images: undefined, requests: s?.requests || 0, confirmed: s?.confirmed || 0, nights: s?.nights || 0 };
      })
      .sort((a, b) => b.requests - a.requests || b.confirmed - a.confirmed || (b.avgRating || 0) - (a.avgRating || 0));

    const featured = rows.filter((h) => h.featured).sort((a, b) => a.featuredRank - b.featuredRank).map((h) => h._id);
    res.json({ success: true, days, max: MAX_FEATURED, featured, hotels: rows });
  } catch (err) {
    next(err);
  }
};

// PUT /admin/hotels/featured  { ids: [...] } — the whole home page selection, in display order
export const setFeaturedHotels = async (req, res, next) => {
  try {
    const raw = req.body?.ids;
    if (!Array.isArray(raw)) return res.status(400).json({ success: false, message: 'ids must be a list of hotels' });
    const ids = [...new Set(raw.map(String))];
    if (ids.length > MAX_FEATURED) {
      return res.status(400).json({ success: false, message: `At most ${MAX_FEATURED} featured hotels` });
    }
    if (!ids.every((id) => mongoose.isValidObjectId(id))) {
      return res.status(400).json({ success: false, message: 'Invalid hotel id' });
    }
    const approved = await Hotel.countDocuments({ _id: { $in: ids }, status: 'approved' });
    if (approved !== ids.length) {
      return res.status(400).json({ success: false, message: 'Only approved hotels can be featured' });
    }

    await Hotel.updateMany({ featured: true, _id: { $nin: ids } }, { $set: { featured: false, featuredRank: 0 } });
    if (ids.length) {
      await Hotel.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { featured: true, featuredRank: i } } } })));
    }
    res.json({ success: true, featured: ids });
  } catch (err) {
    next(err);
  }
};
