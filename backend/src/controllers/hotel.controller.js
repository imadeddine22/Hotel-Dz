import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import { uploadMany, destroyImage } from '../utils/cloudinaryUpload.js';
import { parseCoordinates } from '../utils/parseCoordinates.js';

// GET /hotels  — public list of APPROVED hotels with filters
export const getHotels = async (req, res, next) => {
  try {
    const { wilaya, city, type, minStars, minPrice, maxPrice, q, sort, page = 1, limit = 12 } = req.query;

    const filter = { status: 'approved' };
    if (wilaya) filter.wilaya = new RegExp(wilaya.replace(/[-\s]/g, '[-s]'), 'i');
    if (city) filter.city = new RegExp(city, 'i');
    if (type) filter.type = type;
    if (minStars) filter.starRating = { $gte: Number(minStars) };
    if (q) filter.name = new RegExp(q, 'i');

    let query = Hotel.find(filter);

    // Sorting
    if (sort === 'rating') query = query.sort({ avgRating: -1 });
    else if (sort === 'newest') query = query.sort({ createdAt: -1 });
    else query = query.sort({ avgRating: -1, createdAt: -1 });

    const pageNum = Math.max(1, Number(page));
    const lim = Math.min(50, Number(limit));
    const total = await Hotel.countDocuments(filter);

    const hotels = await query
      .skip((pageNum - 1) * lim)
      .limit(lim)
      .lean();

    res.json({
      success: true,
      count: hotels.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / lim),
      hotels,
    });
  } catch (err) {
    next(err);
  }
};

// GET /hotels/:id — public details (approved) or owner/admin can see own
export const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('owner', 'fullName email phone');
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

    const rooms = await Room.find({ hotel: hotel._id, isActive: true });
    res.json({ success: true, hotel, rooms });
  } catch (err) {
    next(err);
  }
};

// GET /hotels/my/list — owner's own hotels
export const getMyHotels = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = { owner: req.user._id };
    if (type) filter.type = type;
    const hotels = await Hotel.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: hotels.length, hotels });
  } catch (err) {
    next(err);
  }
};

// POST /hotels — owner creates a hotel (status: pending)
export const createHotel = async (req, res, next) => {
  try {
    const images = req.files?.length ? await uploadMany(req.files, 'dzhotels/hotels') : [];

    const coordinates = parseCoordinates(req.body);
    const hotel = await Hotel.create({
      ...req.body,
      amenities: parseArray(req.body.amenities),
      suitableFor: parseArray(req.body.suitableFor),
      ...(coordinates && { coordinates }),
      owner: req.user._id,
      images,
      status: 'pending',
    });

    res.status(201).json({ success: true, hotel });
  } catch (err) {
    next(err);
  }
};

// PUT /hotels/:id — owner edits own hotel
export const updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
    if (!isOwnerOrAdmin(req, hotel)) {
      return res.status(403).json({ success: false, message: 'Not your hotel' });
    }

    const fields = ['name', 'description', 'wilaya', 'city', 'address', 'starRating', 'type'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) hotel[f] = req.body[f];
    });
    if (req.body.amenities !== undefined) hotel.amenities = parseArray(req.body.amenities);
    if (req.body.suitableFor !== undefined) hotel.suitableFor = parseArray(req.body.suitableFor);
    const coordinates = parseCoordinates(req.body);
    if (coordinates) hotel.coordinates = coordinates;

    // Append newly uploaded images
    if (req.files?.length) {
      const uploaded = await uploadMany(req.files, 'dzhotels/hotels');
      hotel.images.push(...uploaded);
    }

    // Editing puts an approved hotel back to pending for re-review
    if (hotel.status === 'approved') hotel.status = 'pending';

    await hotel.save();
    res.json({ success: true, hotel });
  } catch (err) {
    next(err);
  }
};

// DELETE /hotels/:id — owner deletes own hotel (+ its rooms & images)
export const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
    if (!isOwnerOrAdmin(req, hotel)) {
      return res.status(403).json({ success: false, message: 'Not your hotel' });
    }

    await Promise.all(hotel.images.map((img) => destroyImage(img.publicId)));
    await Room.deleteMany({ hotel: hotel._id });
    await hotel.deleteOne();

    res.json({ success: true, message: 'Hotel deleted' });
  } catch (err) {
    next(err);
  }
};

// --- helpers ---
function isOwnerOrAdmin(req, hotel) {
  return req.user.role === 'admin' || hotel.owner.toString() === req.user._id.toString();
}

function parseArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value];
  } catch {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
}
