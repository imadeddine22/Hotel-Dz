import mongoose from 'mongoose';
import Hotel from '../models/Hotel.js';
import House from '../models/House.js';
import HouseForSale from '../models/HouseForSale.js';
import { uploadVideo, destroyVideo } from '../utils/cloudinaryUpload.js';
import { MAX_REEL_SECONDS, MIN_REEL_SECONDS, reelFormatError } from '../utils/reelPlugin.js';
import { sendEmail } from '../utils/sendEmail.js';
import { escapeHtml } from '../utils/escapeHtml.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const OWNER_PAGE = { hotel: '/owner/my-hotels', house: '/owner/my-houses', sale: '/seller/my-listings' };
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

    // Reels format only: the browser measures the video (duration and displayed size, rotation included)
    // and sends it along; Cloudinary's duration wins after upload. Admins still watch every reel.
    const claimed = Number(req.body.duration);
    if (Number.isFinite(claimed) && claimed > MAX_REEL_SECONDS + 1) {
      return res.status(400).json({ success: false, message: `Video too long (${MAX_REEL_SECONDS} seconds max)` });
    }
    if (Number.isFinite(claimed) && claimed > 0 && claimed < MIN_REEL_SECONDS) {
      return res.status(400).json({ success: false, message: `Video too short (${MIN_REEL_SECONDS} seconds min)` });
    }
    const formatError = reelFormatError(req.body.width, req.body.height);
    if (formatError) return res.status(400).json({ success: false, message: formatError });
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
      width: Math.round(Number(req.body.width)),
      height: Math.round(Number(req.body.height)),
      // admins publish directly; owners' reels wait for moderation
      status: req.user.role === 'admin' ? 'approved' : 'pending',
      rejectionReason: '',
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
    await def.Model.updateOne({ _id: listing._id }, { $set: { reel: { url: '', publicId: '', poster: '', duration: 0, width: 0, height: 0, status: 'none', rejectionReason: '' } } });
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
    const status = ['approved', 'rejected'].includes(req.query.status) ? req.query.status : 'pending';
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
    const r = await def.Model.updateOne(
      { _id: req.params.id, 'reel.status': { $in: ['pending', 'rejected'] } },
      { $set: { 'reel.status': 'approved', 'reel.rejectionReason': '' } }
    );
    if (!r.matchedCount) return res.status(404).json({ success: false, message: 'No reel waiting for approval' });
    notifyOwner(req.params.kind, req.params.id, true);
    res.json({ success: true, message: 'Reel approved' });
  } catch (err) {
    next(err);
  }
};

// PUT /admin/reels/:kind/:id/reject { reason } — the owner sees the reason and can upload another video
export const rejectReel = async (req, res, next) => {
  try {
    const def = KINDS[req.params.kind];
    if (!def || !mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, message: 'Listing not found' });
    const reason = String(req.body?.reason || '').replace(/\s+/g, ' ').trim().slice(0, 300);
    if (reason.length < 3) return res.status(400).json({ success: false, message: 'Give the reason for the rejection' });
    const r = await def.Model.updateOne(
      { _id: req.params.id, 'reel.status': { $in: ['pending', 'approved'] } },
      { $set: { 'reel.status': 'rejected', 'reel.rejectionReason': reason } }
    );
    if (!r.matchedCount) return res.status(404).json({ success: false, message: 'No reel to reject' });
    notifyOwner(req.params.kind, req.params.id, false, reason);
    res.json({ success: true, message: 'Reel rejected' });
  } catch (err) {
    next(err);
  }
};

/** Email the listing's owner about the admin's decision (best effort, never blocks the answer). */
async function notifyOwner(kind, id, approved, reason = '') {
  try {
    const def = KINDS[kind];
    const doc = await def.Model.findById(id).select(`name title ${def.owner}`).populate(def.owner, 'email fullName');
    const owner = doc?.[def.owner];
    if (!owner?.email) return;
    const name = escapeHtml(doc.name || doc.title);
    const link = `${CLIENT_URL}${OWNER_PAGE[kind]}`;
    await sendEmail({
      to: owner.email,
      subject: approved ? `🎬 Votre vidéo est publiée — ${doc.name || doc.title}` : `Votre vidéo n'a pas été acceptée — ${doc.name || doc.title}`,
      html: approved
        ? `<p>Bonjour ${escapeHtml(owner.fullName)},</p><p>La vidéo de <strong>${name}</strong> est publiée : elle apparaît sur l'annonce et dans les Reels de Meskan.</p>`
        : `<p>Bonjour ${escapeHtml(owner.fullName)},</p><p>La vidéo de <strong>${name}</strong> n'a pas été acceptée.</p><p>Motif : <em>${escapeHtml(reason)}</em></p><p><a href="${link}">Envoyer une autre vidéo</a> (format vertical 9:16, 3 à 90 secondes).</p>`,
    });
  } catch (e) {
    console.error('Reel email failed:', e.message);
  }
}
