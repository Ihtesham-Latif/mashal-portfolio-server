const express = require('express');
const r = express.Router();
const { get, update } = require('../controllers/heroController');
const { protect, adminOnly } = require('../middleware/auth');

r.get('/',             get);
r.put('/', protect, adminOnly, update);

module.exports = r;
