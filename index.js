require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes      = require('./routes/auth');
const heroRoutes      = require('./routes/hero');
const categoryRoutes  = require('./routes/categories');
const projectRoutes   = require('./routes/projects');
const uploadRoutes    = require('./routes/upload');

const app = express();

/* ─────────────────────────────
   TRUST PROXY (IMPORTANT for Render)
────────────────────────────── */
app.set('trust proxy', 1);

/* ─────────────────────────────
   MIDDLEWARE
────────────────────────────── */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

/* ─────────────────────────────
   STATIC FILES (uploads)
────────────────────────────── */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ─────────────────────────────
   ROUTES
────────────────────────────── */
app.use('/api/auth', authRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/upload', uploadRoutes);

/* ─────────────────────────────
   HEALTH CHECK
────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

/* ─────────────────────────────
   404 HANDLER
────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/* ─────────────────────────────
   GLOBAL ERROR HANDLER
────────────────────────────── */
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error'
  });
});

/* ─────────────────────────────
   DATABASE + SERVER START
────────────────────────────── */
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    await seedAdmin();
    await seedDefaultData();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });

/* ─────────────────────────────
   SEED ADMIN
────────────────────────────── */
async function seedAdmin() {
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');

  const exists = await User.findOne({ email: process.env.ADMIN_EMAIL });

  if (!exists) {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

    await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL,
      password: hashed,
      role: 'admin'
    });

    console.log('👤 Admin created:', process.env.ADMIN_EMAIL);
  }
}

/* ─────────────────────────────
   SEED HERO DATA
────────────────────────────── */
async function seedDefaultData() {
  const Hero = require('./models/Hero');

  const existing = await Hero.findOne();

  if (!existing) {
    await Hero.create({
      designerName: 'Mashal Fayyaz',
      designerRole: 'Graphic Designer',
      eyebrow: 'Welcome to my',
      title: 'PORTFOLIO',
      tagsLine: 'Logo | Branding | Social Media | Thumbnails',
      aboutTitle: 'Creative Designer Based in Pakistan',
      aboutText:
        "Hi! I'm Mashal Fayyaz, a passionate graphic designer specializing in branding and digital content.",
      skills: [
        'Adobe Illustrator',
        'Photoshop',
        'Figma',
        'Canva',
        'Brand Strategy'
      ],
      ctaPrimary: 'View My Work',
      ctaSecondary: 'Get In Touch'
    });

    console.log('🌱 Default hero seeded');
  }
}

module.exports = app;