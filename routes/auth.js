const express = require('express');
const r = express.Router();
const { login, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

r.post('/login',           login);
r.get('/me',   protect,    getMe);
r.put('/change-password', protect, changePassword);

module.exports = r;
