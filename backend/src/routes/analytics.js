const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  predictWeightTrajectory
} = require('../controllers/analyticsController');

// All routes require authentication
router.use(protect);

router.post('/predict-weight', predictWeightTrajectory);

module.exports = router;

