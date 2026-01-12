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
  // Name is immutable after registration/OAuth
  body('name')
    .custom((value) => {
      if (value !== undefined) {
        throw new Error('Name cannot be changed');
      }
      return true;
    }),
  
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

// Weight check-in validation
exports.validateWeightEntry = [
  body('weight')
    .notEmpty()
    .withMessage('Weight is required')
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg')
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

// Meal validation
exports.validateMeal = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Meal name cannot exceed 200 characters'),
  
  body('type')
    .optional()
    .isIn(['breakfast', 'lunch', 'dinner', 'snack'])
    .withMessage('Meal type must be breakfast, lunch, dinner, or snack'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('foodItems')
    .optional()
    .isArray()
    .withMessage('Food items must be an array'),
  
  body('foodItems.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Food item name is required'),
  
  body('foodItems.*.calories')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Calories must be a positive number'),
  
  body('foodItems.*.protein')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Protein must be a positive number'),
  
  body('foodItems.*.carbs')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Carbs must be a positive number'),
  
  body('foodItems.*.fats')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fats must be a positive number'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

// Workout validation
exports.validateWorkout = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Workout name is required')
    .isLength({ max: 200 })
    .withMessage('Workout name cannot exceed 200 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('exercises')
    .optional()
    .isArray()
    .withMessage('Exercises must be an array'),
  
  body('totalDuration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive integer'),
  
  body('caloriesBurned')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Calories burned must be a positive integer'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

// Forum post validation
exports.validateForumPost = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  
  body('category')
    .optional()
    .isIn(['workout', 'nutrition', 'motivation', 'questions', 'general'])
    .withMessage('Invalid category'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags.length > 5) {
        throw new Error('Maximum 5 tags allowed');
      }
      return true;
    })
];

// Forum comment validation
exports.validateForumComment = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
];

