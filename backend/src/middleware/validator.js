const { body } = require('express-validator');

// Register validation
exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// Login validation
exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Update profile validation
exports.validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('height')
    .optional()
    .isFloat({ min: 0, max: 300 })
    .withMessage('Height must be between 0 and 300 cm'),
  
  body('currentWeight')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Current weight must be between 0 and 1000 kg'),
  
  body('goalWeight')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Goal weight must be between 0 and 1000 kg'),
  
  body('activityLevel')
    .optional()
    .isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'])
    .withMessage('Invalid activity level'),
  
  body('dailyCalorieGoal')
    .optional()
    .isInt({ min: 0, max: 10000 })
    .withMessage('Daily calorie goal must be between 0 and 10000')
];

// Update password validation
exports.validateUpdatePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
];

