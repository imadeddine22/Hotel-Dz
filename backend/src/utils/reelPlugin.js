/**
 * A short vertical video ("reel") on a hotel, house or property for sale.
 * Owners upload it; it is public once an admin approved it (status 'approved').
 */
export const REEL_STATUSES = ['none', 'pending', 'approved'];
export const MAX_REEL_SECONDS = 90;
export const MAX_REEL_BYTES = 50 * 1024 * 1024;

export function reelPlugin(schema) {
  schema.add({
    reel: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      poster: { type: String, default: '' }, // still image shown before playing (Cloudinary builds it)
      duration: { type: Number, default: 0 }, // seconds
      status: { type: String, enum: REEL_STATUSES, default: 'none' },
      uploadedAt: { type: Date },
    },
  });
  schema.index({ 'reel.status': 1, 'reel.uploadedAt': -1 });
}

export default reelPlugin;
