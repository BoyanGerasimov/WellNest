const express = require('express');
const router = express.Router();
const {
  getAchievements,
  getAchievementStats,
  getStreak,
  checkAchievements
} = require('../controllers/achievementController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.get('/', getAchievements);
router.get('/stats', getAchievementStats);
router.get('/streak', getStreak);
router.post('/check', checkAchievements);

module.exports = router;

