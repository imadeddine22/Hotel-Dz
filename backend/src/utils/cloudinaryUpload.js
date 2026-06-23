import cloudinary from '../config/cloudinary.js';

/**
 * Upload a single in-memory file buffer to Cloudinary.
 * Returns { url, publicId }.
 */
export const uploadBuffer = (buffer, folder = 'dzhotels') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });

/**
 * Upload many files (req.files from multer) in parallel.
 */
export const uploadMany = (files = [], folder = 'dzhotels') =>
  Promise.all(files.map((f) => uploadBuffer(f.buffer, folder)));

/**
 * Remove an image from Cloudinary by public id (best-effort).
 */
export const destroyImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // ignore — image may already be gone
  }
};
