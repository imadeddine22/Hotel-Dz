import HouseForSale from '../models/HouseForSale.js';
import { searchRegex, wilayaRegex } from '../utils/searchRegex.js';

// GET /sales — public list of APPROVED sale listings with filters
export const getListings = async (req, res, next) => {
  try {
    const { wilaya, city, type, minPrice, maxPrice, priceRanges, reference, q, sort, order = 'desc', page = 1, limit = 12 } = req.query;

    const filter = { status: 'approved' };
    if (wilaya) filter.wilaya = wilayaRegex(wilaya);
    if (city) filter.city = searchRegex(city);
    if (type && type !== 'Tous') filter.type = type;
    if (reference) filter.reference = searchRegex(reference);
    if (q) {
      const rx = searchRegex(q);
      filter.$or = [{ title: rx }, { reference: rx }];
    }

    // Handle price range filters
    const priceConditions = [];
    if (minPrice || maxPrice) {
      const cond = {};
      if (minPrice) cond.$gte = Number(minPrice);
      if (maxPrice) cond.$lte = Number(maxPrice);
      priceConditions.push({ price: cond });
    }

    if (priceRanges) {
      const ranges = Array.isArray(priceRanges) ? priceRanges : priceRanges.split(',');
      ranges.forEach(r => {
        const parts = r.split('-');
        if (parts.length === 2) {
          const min = Number(parts[0].trim());
          const max = Number(parts[1].trim());
          if (!isNaN(min) && !isNaN(max)) {
            priceConditions.push({ price: { $gte: min, $lte: max } });
          }
        }
      });
    }

    if (priceConditions.length > 0) {
      filter.$and = filter.$and || [];
      filter.$and.push({ $or: priceConditions });
    }

    let sortObj = {};
    if (sort === 'price_asc') {
      sortObj = { price: 1 };
    } else if (sort === 'price_desc') {
      sortObj = { price: -1 };
    } else if (sort === 'newest') {
      sortObj = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (sort === 'updatedAt_asc') {
      sortObj = { updatedAt: 1 };
    } else if (sort === 'updatedAt_desc') {
      sortObj = { updatedAt: -1 };
    } else if (sort === 'updatedAt') {
      sortObj = { updatedAt: order === 'asc' ? 1 : -1 };
    } else if (sort === 'price') {
      sortObj = { price: order === 'asc' ? 1 : -1 };
    } else {
      sortObj = { updatedAt: -1 };
    }

    let query = HouseForSale.find(filter).sort(sortObj);

    const pageNum = Math.max(1, Number(page));
    const lim = Math.min(50, Number(limit));
    const total = await HouseForSale.countDocuments(filter);

    const listings = await query
      .skip((pageNum - 1) * lim)
      .limit(lim)
      .lean();

    res.json({
      success: true,
      count: listings.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / lim),
      listings,
    });
  } catch (err) {
    next(err);
  }
};

// GET /sales/:id — public details (increments view count)
export const getListing = async (req, res, next) => {
  try {
    const listing = await HouseForSale.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('seller', 'fullName email phone avatar');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    res.json({ success: true, listing });
  } catch (err) {
    next(err);
  }
};
