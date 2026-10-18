import mongoose from 'mongoose';
import Hotel from '../models/Hotel.js';
import House from '../models/House.js';
import HouseForSale from '../models/HouseForSale.js';
import { uploadVideo, destroyVideo } from '../utils/cloudinaryUpload.js';
import { MAX_REEL_SECONDS } from '../utils/reelPlugin.js';
import { attachPrices } from './hotel.controller.js';
import { effectivePrice } from '../utils/pricing.js';

// kind (URL) → model, owner field, public path
const KINDS = {
  hotel: { Model: Hotel, owner: 'owner', type: 'hotels' },
  house: { Model: House, owner: 'owner', type: 'houses' },
  sale: { Model: HouseForSale, owner: 'seller', type: 'sales' },
};
const TYPE_TO_KIND = { hotels: 'hotel', houses: 'house', sales: 'sale' };

/** Listing of :kind/:id if the requester owns it (or is admin); otherwise sends the error. */
async function loadOwned(req, res) {
  const def = KINDS[req.params.kind];
  if (!def || !mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ success: false, message: 'Listing not found' });
    return null;
  }
  const listing = await def.Model.findById(req.params.id).select(`${def.owner} reel status`);
  if (!listing) {
    res.status(404).json({ success: false, message: 'Listing not found' });
    return null;
  }
  if (req.user.role !== 'admin' && String(listing[def.owner]) !== String(req.user._id)) {
    res.status(403).json({ success: false, message: 'Not authorized' });
    return null;
  }
  return { def, listing };
}

// PUT /reels/:kind/:id (multipart "video", optional "duration" measured by the browser)
export const uploadReel = async (req, res, next) => {
  try {
    const loaded = await loadOwned(req, res);
    if (!loaded) return;
    const { def, listing } = loaded;
    if (!req.file) return res.status(400).json({ success: false, message: 'Choose a video' });

    // the browser's measure is checked first (local storage can't read durations); Cloudinary's wins after upload
    const claimed = Number(req.body.duration);
    if (Number.isFinite(claimed) && claimed > MAX_REEL_SECONDS + 1) {
      return res.status(400).json({ success: false, message: `Video too long (${MAX_REEL_SECONDS} seconds max)` });
    }
    const video = await uploadVideo(req.file.buffer, `dzhotels/reels/${def.type}`, req.file.mimetype);
    const duration = video.duration || (Number.isFinite(claimed) && claimed > 0 ? Math.round(claimed) : 0);
    if (duration > MAX_REEL_SECONDS + 1) {
      destroyVideo(video.publicId);
      return res.status(400).json({ success: false, message: `Video too long (${MAX_REEL_SECONDS} seconds max)` });
    }

    const previous = listing.reel?.publicId;
    const reel = {
      url: video.url,
      publicId: video.publicId,
      poster: video.poster,
      duration,
      // admins publish directly; owners' reels wait for moderation
      status: req.user.role === 'admin' ? 'approved' : 'pending',
      uploadedAt: new Date(),
    };
    // updateOne: changing the video must not send the whole listing back to review
    await def.Model.updateOne({ _id: listing._id }, { $set: { reel } });
    if (previous && previous !== reel.publicId) destroyVideo(previous);
    res.json({ success: true, reel });
  } catch (err) {
    next(err);
  }
};

// DELETE /reels/:kind/:id — owner or admin
export const deleteReel = async (req, res, next) => {
  try {
    const loaded = await loadOwned(req, res);
    if (!loaded) return;
    const { def, listing } = loaded;
    if (listing.reel?.publicId) destroyVideo(listing.reel.publicId);
    await def.Model.updateOne({ _id: listing._id }, { $set: { reel: { url: '', publicId: '', poster: '', duration: 0, status: 'none' } } });
    res.json({ success: true, message: 'Reel deleted' });
  } catch (err) {
    next(err);
  }
};

/** Public card of a listing with its reel. */
const card = (kind, doc) => ({
  kind,
  _id: doc._id,
  title: doc.name || doc.title,
  translations: doc.translations, // the browser shows the visitor's language
  sourceLang: doc.sourceLang,
  city: doc.city,
  wilaya: doc.wilaya,
  type: doc.type,
  starRating: doc.starRating,
  price: kind === 'house' ? effectivePrice(doc).price : doc.price ?? null,
  perNight: kind !== 'sale',
  currency: doc.currency || 'DZD',
  image: doc.images?.[0]?.url || doc.images?.[0] || '',
  reel: { url: doc.reel.url, poster: doc.reel.poster, duration: doc.reel.duration, uploadedAt: doc.reel.uploadedAt },
});

// GET /reels?type=hotels|houses|sales&page=1&limit=8 — published reels of published listings, newest first
export const getReels = async (req, res, next) => {
  try {
    const only = TYPE_TO_KIND[req.query.type];
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 8));
    const filter = { status: 'approved', 'reel.status': 'approved' };
    const kinds = only ? [only] : Object.keys(KINDS);

    // newest `page × limit` of each kind, merged by date: simple and enough at this size
    const lists = await Promise.all(
      kinds.map(async (kind) => {
        const docs = await KINDS[kind].Model.find(filter).sort({ 'reel.uploadedAt': -1 }).limit(page * limit).lean();
        if (kind === 'hotel') await attachPrices(docs);
        return docs.map((d) => card(kind, d));
      })
    );
    const counts = await Promise.all(kinds.map((k) => KINDS[k].Model.countDocuments(filter)));
    const total = counts.reduce((a, b) => a + b, 0);
    const reels = lists
      .flat()
      .sort((a, b) => new Date(b.reel.uploadedAt) - new Date(a.reel.uploadedAt))
      .slice((page - 1) * limit, page * limit);
    res.json({ success: true, page, total, hasMore: page * limit < total, reels });
  } catch (err) {
    next(err);
  }
};

// GET /admin/reels?status=pending|approved — moderation queue
export const getReelQueue = async (req, res, next) => {
  try {
    const status = req.query.status === 'approved' ? 'approved' : 'pending';
    const lists = await Promise.all(
      Object.entries(KINDS).map(async ([kind, def]) => {
        const docs = await def.Model.find({ 'reel.status': status })
          .select(`name title city wilaya status reel ${def.owner}`)
          .populate(def.owner, 'fullName email')
          .sort({ 'reel.uploadedAt': -1 })
          .lean();
        return docs.map((d) => ({ kind, _id: d._id, title: d.name || d.title, city: d.city, wilaya: d.wilaya, listingStatus: d.status, owner: d[def.owner], reel: d.reel }));
      })
    );
    const reels = lists.flat().sort((a, b) => new Date(b.reel.uploadedAt) - new Date(a.reel.uploadedAt));
    const pending = status === 'pending' ? reels.length : (await Promise.all(Object.values(KINDS).map((d) => d.Model.countDocuments({ 'reel.status': 'pending' })))).reduce((a, b) => a + b, 0);
    res.json({ success: true, pending, reels });
  } catch (err) {
    next(err);
  }
};

// PUT /admin/reels/:kind/:id/approve
export const approveReel = async (req, res, next) => {
  try {
    const def = KINDS[req.params.kind];
    if (!def || !mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, message: 'Listing not found' });
    const r = await def.Model.updateOne({ _id: req.params.id, 'reel.status': 'pending' }, { $set: { 'reel.status': 'approved' } });
    if (!r.matchedCount) return res.status(404).json({ success: false, message: 'No reel waiting for approval' });
    res.json({ success: true, message: 'Reel approved' });
  } catch (err) {
    next(err);
  }
};
