const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const nutritionService = require('../services/nutritionService');
const barcodeService = require('../services/barcodeService');
const achievementService = require('../services/achievementService');
const openaiService = require('../services/openaiService');

// Use a single PrismaClient instance (lazy initialization)
let prisma;
try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (error) {
  console.error('❌ Error creating PrismaClient in mealController:', error.message);
  throw error;
}

// @desc    Get all meals for user
// @route   GET /api/meals
// @access  Private
exports.getMeals = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId: req.user.id
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (type) {
      where.type = type;
    }

    const [meals, total] = await Promise.all([
      prisma.meal.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.meal.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: meals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single meal
// @route   GET /api/meals/:id
// @access  Private
exports.getMeal = async (req, res, next) => {
  try {
    const meal = await prisma.meal.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: meal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create meal
// @route   POST /api/meals
// @access  Private
exports.createMeal = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, type, date, foodItems, notes } = req.body;

    // Calculate totals from foodItems
    const totals = (foodItems || []).reduce((acc, item) => {
      acc.totalCalories += parseFloat(item.calories || 0);
      acc.totalProtein += parseFloat(item.protein || 0);
      acc.totalCarbs += parseFloat(item.carbs || 0);
      acc.totalFats += parseFloat(item.fats || 0);
      return acc;
    }, { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 });

    const meal = await prisma.meal.create({
      data: {
        userId: req.user.id,
        name: name || 'Meal',
        type: type || 'snack',
        date: date ? new Date(date) : new Date(),
        foodItems: foodItems || [],
        totalCalories: totals.totalCalories,
        totalProtein: totals.totalProtein,
        totalCarbs: totals.totalCarbs,
        totalFats: totals.totalFats,
        notes: notes || ''
      }
    });

    // Check for new achievements (fire and forget)
    achievementService.checkAchievements(req.user.id).catch(err => {
      console.error('Error checking achievements:', err);
    });

    res.status(201).json({
      success: true,
      data: meal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update meal
// @route   PUT /api/meals/:id
// @access  Private
exports.updateMeal = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let meal = await prisma.meal.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    const { name, type, date, foodItems, notes } = req.body;

    // Recalculate totals if foodItems are provided
    let totals = {
      totalCalories: meal.totalCalories,
      totalProtein: meal.totalProtein,
      totalCarbs: meal.totalCarbs,
      totalFats: meal.totalFats
    };

    if (foodItems !== undefined) {
      totals = (foodItems || []).reduce((acc, item) => {
        acc.totalCalories += parseFloat(item.calories || 0);
        acc.totalProtein += parseFloat(item.protein || 0);
        acc.totalCarbs += parseFloat(item.carbs || 0);
        acc.totalFats += parseFloat(item.fats || 0);
        return acc;
      }, { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 });
    }

    meal = await prisma.meal.update({
      where: { id: req.params.id },
      data: {
        name: name !== undefined ? name : meal.name,
        type: type !== undefined ? type : meal.type,
        date: date !== undefined ? new Date(date) : meal.date,
        foodItems: foodItems !== undefined ? foodItems : meal.foodItems,
        totalCalories: totals.totalCalories,
        totalProtein: totals.totalProtein,
        totalCarbs: totals.totalCarbs,
        totalFats: totals.totalFats,
        notes: notes !== undefined ? notes : meal.notes
      }
    });

    res.status(200).json({
      success: true,
      data: meal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Private
exports.deleteMeal = async (req, res, next) => {
  try {
    const meal = await prisma.meal.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    await prisma.meal.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search food using USDA FoodData Central
// @route   POST /api/meals/search-food
// @access  Private
exports.searchFood = async (req, res, next) => {
  try {
    const { query, pageNumber = 1, pageSize = 20 } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required and must be a non-empty string'
      });
    }

    const results = await nutritionService.searchFood(query, pageNumber, pageSize);
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nutrition data for food by FDC ID
// @route   POST /api/meals/nutrition
// @access  Private
exports.getNutrition = async (req, res, next) => {
  try {
    const { fdcId } = req.body;

    if (!fdcId || isNaN(parseInt(fdcId))) {
      return res.status(400).json({
        success: false,
        message: 'Valid FDC ID is required'
      });
    }

    const nutritionData = await nutritionService.getNutritionData(parseInt(fdcId));
    
    res.status(200).json({
      success: true,
      data: nutritionData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lookup product by barcode
// @route   POST /api/meals/barcode
// @access  Private
exports.lookupBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.body;

    if (!barcode || typeof barcode !== 'string' || barcode.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Barcode is required'
      });
    }

    const product = await barcodeService.lookupBarcode(barcode.trim());
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get meal statistics
// @route   GET /api/meals/stats
// @access  Private
exports.getMealStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {
      userId: req.user.id
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [totalMeals, totalCalories, totalProtein, totalCarbs, totalFats, meals] = await Promise.all([
      prisma.meal.count({ where }),
      prisma.meal.aggregate({
        where,
        _sum: { totalCalories: true }
      }),
      prisma.meal.aggregate({
        where,
        _sum: { totalProtein: true }
      }),
      prisma.meal.aggregate({
        where,
        _sum: { totalCarbs: true }
      }),
      prisma.meal.aggregate({
        where,
        _sum: { totalFats: true }
      }),
      prisma.meal.findMany({
        where,
        select: {
          date: true,
          totalCalories: true,
          totalProtein: true,
          totalCarbs: true,
          totalFats: true
        },
        orderBy: { date: 'asc' }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalMeals,
        totalCalories: totalCalories._sum.totalCalories || 0,
        totalProtein: totalProtein._sum.totalProtein || 0,
        totalCarbs: totalCarbs._sum.totalCarbs || 0,
        totalFats: totalFats._sum.totalFats || 0,
        meals
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Scan meal image and identify meal with nutrition
// @route   POST /api/meals/scan
// @access  Private
exports.scanMeal = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    const mealData = await openaiService.analyzeMealImage(req.file.buffer);

    res.status(200).json({
      success: true,
      data: mealData
    });
  } catch (error) {
    next(error);
  }
};

