import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base uploads directory
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

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

/**
 * Upload a single in-memory file buffer to local storage.
 * Returns { url, publicId }.
 */
export const uploadBuffer = (buffer, folder = 'dzhotels', mimetype = 'image/jpeg') => {
  const dir = ensureDir(folder);
  const uniqueName = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
  const extMap = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
  const ext = extMap[mimetype] || '.jpg';
  const fileName = `${uniqueName}${ext}`;
  const filePath = path.join(dir, fileName);

  fs.writeFileSync(filePath, buffer);

  // Return a URL relative to the server
  const url = `/uploads/${folder}/${fileName}`;
  const publicId = `${folder}/${fileName}`;

  return { url, publicId };
};

/**
 * Upload many files (req.files from multer) in parallel.
 */
export const uploadMany = (files = [], folder = 'dzhotels') =>
  Promise.all(files.map((f) => uploadBuffer(f.buffer, folder, f.mimetype)));

/**
 * Remove an image from local storage by public id (best-effort).
 */
export const destroyImage = async (publicId) => {
  if (!publicId) return;
  try {
    const filePath = path.join(UPLOADS_DIR, publicId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // ignore — file may already be gone
  }
};
