import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import cloudinary from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base uploads directory (local-disk fallback)
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

// Allowed image types → file extension
const EXT_MAP = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

/**
 * Cloudinary is used when all three credentials are set; otherwise images go to
 * the local disk (local dev, `npm run dev:local`, e2e suite).
 * Render's disk is ephemeral, so production MUST have the Cloudinary vars set.
 */
export const isCloudinaryEnabled = () =>
  Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

if (!isCloudinaryEnabled() && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  Cloudinary env vars missing — uploads go to the local disk and will be lost on redeploy.');
}

/**
 * Ensure the target folder exists.
 */
function ensureDir(folder) {
  const dir = path.join(UPLOADS_DIR, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

const uniqueName = () => `${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

/**
 * Write a buffer to local storage. Returns { url, publicId } with a /uploads/... url.
 */
const uploadToDisk = (buffer, folder, mimetype) => {
  const dir = ensureDir(folder);
  const ext = EXT_MAP[mimetype] || '.jpg';
  const fileName = `${uniqueName()}${ext}`;
  fs.writeFileSync(path.join(dir, fileName), buffer);

  return { url: `/uploads/${folder}/${fileName}`, publicId: `${folder}/${fileName}` };
};

/**
 * Stream a buffer to Cloudinary. Returns { url, publicId } with an https url.
 */
const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: uniqueName(),
        resource_type: 'image',
        allowed_formats: ALLOWED_FORMATS,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });

/**
 * Upload a single in-memory file buffer (Cloudinary, or local disk as fallback).
 * Returns { url, publicId }.
 */
export const uploadBuffer = async (buffer, folder = 'dzhotels', mimetype = 'image/jpeg') =>
  isCloudinaryEnabled() ? uploadToCloudinary(buffer, folder) : uploadToDisk(buffer, folder, mimetype);

/**
 * Upload many files (req.files from multer) in parallel.
 */
export const uploadMany = (files = [], folder = 'dzhotels') =>
  Promise.all(files.map((f) => uploadBuffer(f.buffer, folder, f.mimetype)));

/**
 * Local-disk public ids keep their file extension (e.g. "dzhotels/hotels/123_ab.jpg");
 * Cloudinary public ids don't (e.g. "dzhotels/hotels/123_ab").
 */
const isLocalPublicId = (publicId) => Object.values(EXT_MAP).some((ext) => publicId.endsWith(ext)) || publicId.endsWith('.jpeg');

/**
 * Remove an image by public id (best-effort): from Cloudinary or from local storage.
 */
export const destroyImage = async (publicId) => {
  if (!publicId) return;
  try {
    if (!isLocalPublicId(publicId)) {
      if (isCloudinaryEnabled()) await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      return;
    }
    const filePath = path.join(UPLOADS_DIR, publicId);
    if (filePath.startsWith(UPLOADS_DIR) && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // ignore — image may already be gone
  }
};
