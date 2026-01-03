const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  scanRecipe,
  upload
} = require('../controllers/recipeController');

// All routes require authentication
router.use(protect);

// Use multer middleware for file upload
router.post('/scan', upload, scanRecipe);

module.exports = router;

