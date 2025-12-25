const suggestionService = require('../services/suggestionService');

// @desc    Get workout suggestions
// @route   GET /api/suggestions/workout
// @access  Private
exports.getWorkoutSuggestions = async (req, res, next) => {
  try {
    const suggestions = await suggestionService.getWorkoutSuggestions(req.user.id);
    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nutrition suggestions
// @route   GET /api/suggestions/nutrition
// @access  Private
exports.getNutritionSuggestions = async (req, res, next) => {
  try {
    const suggestions = await suggestionService.getNutritionSuggestions(req.user.id);
    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all suggestions
// @route   GET /api/suggestions
// @access  Private
exports.getAllSuggestions = async (req, res, next) => {
  try {
    const suggestions = await suggestionService.getAllSuggestions(req.user.id);
    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};

