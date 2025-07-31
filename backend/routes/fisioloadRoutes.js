const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createWellnessEntry, getWellnessEntriesForUser } = require('../src/controllers/fisioloadController');

// Proteger todas las rutas de este archivo
router.use(protect);

router.route('/')
    .post(createWellnessEntry)
    .get(getWellnessEntriesForUser);

module.exports = router;
