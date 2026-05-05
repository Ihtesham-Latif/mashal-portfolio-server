const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

/* ─── Try Cloudinary first; fall back to local disk if not configured ─── */
let storage;

const cloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (cloudinaryConfigured) {
  const cloudinary = require('../config/cloudinary');
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: req.uploadFolder || 'mashal-portfolio',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }],
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '-').replace(/\.[^/.]+$/, '')}`
    })
  });
} else {
  /* Local storage fallback for development without Cloudinary */
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    }
  });
}

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files allowed (jpg, jpeg, png, webp, gif)'), false);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});
