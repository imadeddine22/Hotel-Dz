/**
 * A short vertical video ("reel") on a hotel, house or property for sale.
 * Owners upload it; it is public once an admin approved it (status 'approved').
 */
export const REEL_STATUSES = ['none', 'pending', 'approved', 'rejected'];
export const MAX_REEL_SECONDS = 90;
export const MAX_REEL_BYTES = 50 * 1024 * 1024;
export const MIN_REEL_SECONDS = 3;
// Reels format: vertical, about 9:16 (from 9:19.5 phone screens up to 2:3), at least 480×854
export const REEL_RATIO = { min: 0.45, max: 0.67 };
export const MIN_REEL_WIDTH = 480;
export const MIN_REEL_HEIGHT = 854;

/** Error message when width × height is not a reel (vertical ~9:16, minimum size), else null. */
export function reelFormatError(width, height) {
  const w = Number(width);
  const h = Number(height);
  if (!(w > 0 && h > 0)) return 'Video dimensions are required';
  const ratio = w / h;
  if (ratio < REEL_RATIO.min || ratio > REEL_RATIO.max) return 'Reels must be vertical videos (9:16 format)';
  if (w < MIN_REEL_WIDTH || h < MIN_REEL_HEIGHT) return 'Video resolution too low (480×854 minimum)';
  return null;
}

export function reelPlugin(schema) {
  schema.add({
    reel: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      poster: { type: String, default: '' }, // still image shown before playing (Cloudinary builds it)
      duration: { type: Number, default: 0 }, // seconds
      status: { type: String, enum: REEL_STATUSES, default: 'none' },
      rejectionReason: { type: String, default: '' }, // shown to the owner when status is 'rejected'
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      uploadedAt: { type: Date },
    },
  });
  schema.index({ 'reel.status': 1, 'reel.uploadedAt': -1 });
}

export default reelPlugin;
