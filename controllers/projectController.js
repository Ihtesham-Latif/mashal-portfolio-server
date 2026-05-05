const Project    = require('../models/Project');
const cloudinary  = require('../config/cloudinary');
const path        = require('path');

const getImageData = (file) => {
  if (!file) return null;
  if (file.path && file.filename) return { url: file.path, publicId: file.filename };
  const url = `/uploads/${file.filename || path.basename(file.path)}`;
  return { url, publicId: file.filename || path.basename(file.path) };
};

const parseTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(t => t.trim()).filter(Boolean);
  return tags.split(',').map(t => t.trim()).filter(Boolean);
};

/* GET /api/projects  (public — paginated, filterable) */
exports.getAll = async (req, res) => {
  try {
    const filter = { isVisible: true };
    if (req.query.category)       filter.category = req.query.category;
    if (req.query.featured === 'true') filter.isFeatured = true;
    if (req.query.search)         filter.$text = { $search: req.query.search };

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('category', 'name subtitle image')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter)
    ]);

    res.json({
      success: true, count: projects.length, total,
      page, pages: Math.ceil(total / limit), data: projects
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* GET /api/projects/admin  (admin — all projects) */
exports.getAllAdmin = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('category', 'name image')
      .sort('-createdAt');
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* GET /api/projects/:id */
exports.getOne = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('category');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* POST /api/projects  (admin) */
exports.create = async (req, res) => {
  try {
    const { title, description, category, tags, isFeatured, order, client, year } = req.body;
    const data = { title, description, category, isFeatured, order, client, year, tags: parseTags(tags) };
    if (req.file) data.image = getImageData(req.file);
    const project = await (await Project.create(data)).populate('category', 'name image');
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* PUT /api/projects/:id  (admin) */
exports.update = async (req, res) => {
  try {
    const { title, description, category, tags, isFeatured, isVisible, order, client, year } = req.body;
    const update = { title, description, category, isFeatured, isVisible, order, client, year };
    if (tags !== undefined) update.tags = parseTags(tags);
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);

    if (req.file) {
      const old = await Project.findById(req.params.id);
      if (old?.image?.publicId) {
        try { await cloudinary.uploader.destroy(old.image.publicId); } catch {}
      }
      update.image = getImageData(req.file);
    }

    const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
      .populate('category', 'name image');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* DELETE /api/projects/:id  (admin) */
exports.remove = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.image?.publicId) {
      try { await cloudinary.uploader.destroy(project.image.publicId); } catch {}
    }
    await project.deleteOne();
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
