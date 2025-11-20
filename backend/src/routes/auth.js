console.log('     → Loading express and router...');
const express = require('express');
const router = express.Router();
console.log('     → Loading authController...');
const {
  register,
  login,
  getMe,
  logout
} = require('../controllers/authController');
console.log('     → Loading auth middleware...');
const { protect } = require('../middleware/auth');
console.log('     → Loading validator middleware...');
const { validateRegister, validateLogin } = require('../middleware/validator');
console.log('     → All auth route dependencies loaded');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;

