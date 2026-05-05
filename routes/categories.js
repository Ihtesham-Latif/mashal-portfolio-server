const express = require('express');
const r = express.Router();
const ctrl = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

r.get('/',        ctrl.getAll);
r.get('/admin',   protect, adminOnly, ctrl.getAllAdmin);
r.get('/:id',     ctrl.getOne);
r.post('/',       protect, adminOnly, upload.single('image'), ctrl.create);
r.put('/:id',     protect, adminOnly, upload.single('image'), ctrl.update);
r.delete('/:id',  protect, adminOnly, ctrl.remove);

module.exports = r;
