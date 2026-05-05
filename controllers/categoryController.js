const Category  = require('../models/Category');
const cloudinary = require('../config/cloudinary');
const path       = require('path');

const getImageData = (file) => {
  /* Cloudinary gives path + filename; local disk gives path */
  if (!file) return null;
  if (file.path && file.filename) return { url: file.path, publicId: file.filename };
  /* local disk */
  const url = `/uploads/${file.filename || path.basename(file.path)}`;
  return { url, publicId: file.filename || path.basename(file.path) };
};

/* GET /api/categories  (public) */
exports.getAll = async (req, res) => {
  try {
    const cats = await Category.find({ isVisible: true }).sort('order');
    res.json({ success: true, count: cats.length, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* GET /api/categories/admin  (admin) */
exports.getAllAdmin = async (req, res) => {
  try {
    const cats = await Category.find().sort('order');
    res.json({ success: true, count: cats.length, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* GET /api/categories/:id */
exports.getOne = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* POST /api/categories  (admin) */
exports.create = async (req, res) => {
  try {
    const { name, subtitle, order, isVisible } = req.body;
    const data = { name, subtitle, order, isVisible };
    if (req.file) data.image = getImageData(req.file);
    const cat = await Category.create(data);
    res.status(201).json({ success: true, data: cat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* PUT /api/categories/:id  (admin) */
exports.update = async (req, res) => {
  try {
    const { name, subtitle, order, isVisible } = req.body;
    const update = { name, subtitle, order, isVisible };
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);

    if (req.file) {
      const old = await Category.findById(req.params.id);
      if (old?.image?.publicId) {
        try { await cloudinary.uploader.destroy(old.image.publicId); } catch {}
      }
      update.image = getImageData(req.file);
    }

    const cat = await Category.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: cat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* DELETE /api/categories/:id  (admin) */
exports.remove = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    if (cat.image?.publicId) {
      try { await cloudinary.uploader.destroy(cat.image.publicId); } catch {}
    }
    await cat.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
