const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const { validateWeightEntry } = require('../middleware/validator');
const { getWeights, createWeight } = require('../controllers/weightController');

router.use(protect);

router.get('/', getWeights);
router.post('/', validateWeightEntry, createWeight);

module.exports = router;


