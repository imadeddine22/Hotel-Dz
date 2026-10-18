import multer from 'multer';

// Keep files in memory so we can stream the buffer straight to Cloudinary.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per image
});

/**
 * One profile photo (field "avatar", 2 MB). Multer errors (too big, wrong type) become 400s
 * with a readable message instead of 500s.
 */
const avatarMulter = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024, files: 1 } }).single('avatar');
export const avatarUpload = (req, res, next) =>
  avatarMulter(req, res, (err) => {
    if (!err) return next();
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image too large (2 MB max)' : err.message === 'Only image files are allowed' ? err.message : 'Invalid image';
    res.status(400).json({ success: false, message });
  });

export default upload;
