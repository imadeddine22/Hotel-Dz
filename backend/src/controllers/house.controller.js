import House from '../models/House.js';
import { uploadMany, destroyImage } from '../utils/cloudinaryUpload.js';
import { parseCoordinates } from '../utils/parseCoordinates.js';

// GET /houses — public list of APPROVED houses with filters
export const getHouses = async (req, res, next) => {
  try {
    const { wilaya, city, type, minPrice, maxPrice, q, sort, page = 1, limit = 12 } = req.query;

    const filter = { status: 'approved' };
    if (wilaya) filter.wilaya = wilaya;
    if (city) filter.city = new RegExp(city, 'i');
    if (type) filter.type = type;
    if (q) filter.name = new RegExp(q, 'i');
    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    }

    let query = House.find(filter);

    if (sort === 'price_asc') query = query.sort({ pricePerNight: 1 });
    else if (sort === 'price_desc') query = query.sort({ pricePerNight: -1 });
    else if (sort === 'newest') query = query.sort({ createdAt: -1 });
    else query = query.sort({ avgRating: -1, createdAt: -1 });

    const pageNum = Math.max(1, Number(page));
    const lim = Math.min(50, Number(limit));
    const total = await House.countDocuments(filter);

    const houses = await query
      .skip((pageNum - 1) * lim)
      .limit(lim)
      .lean();

    res.json({
      success: true,
      count: houses.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / lim),
      houses,
    });
  } catch (err) {
    next(err);
  }
};

// GET /houses/:id — public details
export const getHouse = async (req, res, next) => {
  try {
    const house = await House.findById(req.params.id).populate('owner', 'fullName email phone');
    if (!house) return res.status(404).json({ success: false, message: 'House not found' });
    res.json({ success: true, house });
  } catch (err) {
    next(err);
  }
};

// GET /houses/my/list — owner's own houses
export const getMyHouses = async (req, res, next) => {
  try {
    const houses = await House.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: houses.length, houses });
  } catch (err) {
    next(err);
  }
};

// POST /houses — owner creates a house (status: pending)
export const createHouse = async (req, res, next) => {
  try {
    const images = req.files?.length ? await uploadMany(req.files, 'dzhotels/houses') : [];

    const coordinates = parseCoordinates(req.body);
    const house = await House.create({
      ...req.body,
      amenities: parseArray(req.body.amenities),
      ...(coordinates && { coordinates }),
      owner: req.user._id,
      images,
      status: 'pending',
    });

    res.status(201).json({ success: true, house });
  } catch (err) {
    next(err);
  }
};

// PUT /houses/:id — owner edits own house
export const updateHouse = async (req, res, next) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) return res.status(404).json({ success: false, message: 'House not found' });
    if (!isOwnerOrAdmin(req, house)) {
      return res.status(403).json({ success: false, message: 'Not your house' });
    }

    const fields = ['name', 'description', 'wilaya', 'city', 'address', 'type', 'rooms', 'bathrooms', 'capacity', 'pricePerNight'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) house[f] = req.body[f];
    });
    if (req.body.amenities !== undefined) house.amenities = parseArray(req.body.amenities);
    const coordinates = parseCoordinates(req.body);
    if (coordinates) house.coordinates = coordinates;

    if (req.files?.length) {
      const uploaded = await uploadMany(req.files, 'dzhotels/houses');
      house.images.push(...uploaded);
    }

    if (house.status === 'approved') house.status = 'pending';

    await house.save();
    res.json({ success: true, house });
  } catch (err) {
    next(err);
  }
};

// DELETE /houses/:id — owner deletes own house
export const deleteHouse = async (req, res, next) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) return res.status(404).json({ success: false, message: 'House not found' });
    if (!isOwnerOrAdmin(req, house)) {
      return res.status(403).json({ success: false, message: 'Not your house' });
    }

    await Promise.all(house.images.map((img) => destroyImage(img.publicId)));
    await house.deleteOne();

    res.json({ success: true, message: 'House deleted' });
  } catch (err) {
    next(err);
  }
};

// --- helpers ---
function isOwnerOrAdmin(req, house) {
  return req.user.role === 'admin' || house.owner.toString() === req.user._id.toString();
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
