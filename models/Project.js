const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  description:{ type: String, trim: true, default: '' },
  category:   { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  image: {
    url:      { type: String, default: '' },
    publicId: { type: String, default: '' }
  },
  tags:       [{ type: String, trim: true }],
  isFeatured: { type: Boolean, default: false },
  isVisible:  { type: Boolean, default: true },
  order:      { type: Number, default: 0 },
  client:     { type: String, default: '' },
  year:       { type: Number, default: () => new Date().getFullYear() }
}, { timestamps: true });

projectSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Project', projectSchema);
