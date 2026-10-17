import { isCountry } from '../utils/countries.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import { uploadMany, destroyImage } from '../utils/cloudinaryUpload.js';
import { parseCoordinates } from '../utils/parseCoordinates.js';
import { searchRegex, wilayaRegex, placeFilter } from '../utils/searchRegex.js';
import { canView } from '../middlewares/auth.middleware.js';

// Fields an owner may set. Status, ratings and owner are server-controlled.
const EDITABLE = ['name', 'description', 'country', 'wilaya', 'city', 'address', 'starRating', 'type'];
const pick = (body, keys) => Object.fromEntries(keys.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

// GET /hotels  — public list of APPROVED hotels with filters
export const getHotels = async (req, res, next) => {
  try {
    const { wilaya, city, place, type, minStars, minPrice, maxPrice, q, sort, page = 1, limit = 12 } = req.query;

    const filter = { status: 'approved' };
    if (isCountry(req.query.country)) filter.country = req.query.country;
    if (wilaya) filter.wilaya = wilayaRegex(wilaya);
    const where = place && placeFilter(place); // undefined for blank input
    if (where) (filter.$and = filter.$and || []).push(where);
    if (city) filter.city = searchRegex(city);
    if (type) filter.type = type;
    if (minStars) filter.starRating = { $gte: Number(minStars) };
    if (q) filter.name = searchRegex(q);

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

    // "À partir de" price = cheapest active room of each hotel (hotels have no price of their own)
    const minPrices = await Room.aggregate([
      { $match: { hotel: { $in: hotels.map((h) => h._id) }, isActive: true } },
      { $group: { _id: '$hotel', price: { $min: '$pricePerNight' } } },
    ]);
    const priceByHotel = new Map(minPrices.map((p) => [String(p._id), p.price]));
    hotels.forEach((h) => {
      h.price = priceByHotel.get(String(h._id)) ?? null;
    });

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
    // Pending/rejected hotels are only visible to their owner and admins
    if (!hotel || !canView(req, hotel)) return res.status(404).json({ success: false, message: 'Hotel not found' });

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
      ...pick(req.body, EDITABLE),
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

    EDITABLE.forEach((f) => {
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
