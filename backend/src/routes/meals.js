const express = require('express');
const router = express.Router();
const {
  getMeals,
  getMeal,
  createMeal,
  updateMeal,
  deleteMeal,
  searchFood,
  getNutrition,
  getMealStats
} = require('../controllers/mealController');
const { protect } = require('../middleware/auth');
const { validateMeal } = require('../middleware/validator');

router.use(protect); // All routes require authentication

router.get('/stats', getMealStats);
router.post('/search-food', searchFood);
router.post('/nutrition', getNutrition);
router.get('/', getMeals);
router.get('/:id', getMeal);
router.post('/', validateMeal, createMeal);
router.put('/:id', validateMeal, updateMeal);
router.delete('/:id', deleteMeal);

module.exports = router;

