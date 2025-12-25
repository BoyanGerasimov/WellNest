const express = require('express');
const router = express.Router();
const { getHealthScore } = require('../controllers/healthScoreController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.get('/', getHealthScore);

module.exports = router;

