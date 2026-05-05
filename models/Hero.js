const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema({
  designerName:  { type: String, default: 'Mashal Fayyaz' },
  designerRole:  { type: String, default: 'Graphic Designer' },
  eyebrow:       { type: String, default: 'Welcome to my' },
  title:         { type: String, default: 'PORTFOLIO' },
  tagsLine:      { type: String, default: 'Logo | Branding | Social Media | Thumbnails' },
  ctaPrimary:    { type: String, default: 'View My Work' },
  ctaSecondary:  { type: String, default: 'Get In Touch' },
  aboutTitle:    { type: String, default: 'Creative Designer\nBased in Pakistan' },
  aboutText:     { type: String, default: '' },
  skills:        { type: [String], default: [] },
  socialLinks: {
    behance:   { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin:  { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Hero', heroSchema);
