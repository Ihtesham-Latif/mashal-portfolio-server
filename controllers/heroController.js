const Hero = require('../models/Hero');

/* GET /api/hero */
exports.get = async (req, res) => {
  try {
    let hero = await Hero.findOne();
    if (!hero) hero = await Hero.create({});
    res.json({ success: true, data: hero });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* PUT /api/hero */
exports.update = async (req, res) => {
  try {
    const fields = ['designerName','designerRole','eyebrow','title','tagsLine',
                    'ctaPrimary','ctaSecondary','aboutTitle','aboutText','skills','socialLinks'];
    let hero = await Hero.findOne();
    if (!hero) hero = new Hero();

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        if (f === 'skills' && typeof req.body[f] === 'string')
          hero[f] = req.body[f].split(',').map(s => s.trim()).filter(Boolean);
        else if (f === 'socialLinks')
          hero[f] = { ...hero[f]?.toObject?.() || {}, ...req.body[f] };
        else
          hero[f] = req.body[f];
      }
    });

    await hero.save();
    res.json({ success: true, data: hero });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
