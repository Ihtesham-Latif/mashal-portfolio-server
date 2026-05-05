const express    = require('express');
const r          = express.Router();
const upload     = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const { protect, adminOnly } = require('../middleware/auth');

/* POST /api/upload/image */
r.post('/image', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const url = req.file.path || `/uploads/${req.file.filename}`;
  res.json({ success: true, url, publicId: req.file.filename });
});

/* DELETE /api/upload/:publicId */
r.delete('/:publicId', protect, adminOnly, async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ success: true, message: 'Image deleted from Cloudinary' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = r;
