const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getMeals,
  getMeal,
  createMeal,
  updateMeal,
  deleteMeal,
  searchFood,
  getNutrition,
  lookupBarcode,
  getMealStats,
  scanMeal
} = require('../controllers/mealController');
const { protect } = require('../middleware/auth');
const { validateMeal } = require('../middleware/validator');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.use(protect); // All routes require authentication

router.get('/stats', getMealStats);
router.post('/search-food', searchFood);
router.post('/nutrition', getNutrition);
router.post('/barcode', lookupBarcode);
router.post('/scan', upload.single('image'), scanMeal);
router.get('/', getMeals);
router.get('/:id', getMeal);
router.post('/', validateMeal, createMeal);
router.put('/:id', validateMeal, updateMeal);
router.delete('/:id', deleteMeal);

module.exports = router;

