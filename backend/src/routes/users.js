const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updatePassword
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validateUpdateProfile, validateUpdatePassword } = require('../middleware/validator');

router.use(protect); // All routes require authentication

router.get('/profile', getProfile);
router.put('/profile', validateUpdateProfile, updateProfile);
router.put('/password', validateUpdatePassword, updatePassword);

module.exports = router;

