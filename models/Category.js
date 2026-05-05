const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  subtitle:  { type: String, trim: true, default: '' },
  image: {
    url:      { type: String, default: '' },
    publicId: { type: String, default: '' }
  },
  order:     { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
