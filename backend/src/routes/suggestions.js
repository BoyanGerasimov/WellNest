const express = require('express');
const router = express.Router();
const {
  getWorkoutSuggestions,
  getNutritionSuggestions,
  getAllSuggestions
} = require('../controllers/suggestionController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.get('/', getAllSuggestions);
router.get('/workout', getWorkoutSuggestions);
router.get('/nutrition', getNutritionSuggestions);

module.exports = router;

