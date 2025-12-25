const achievementService = require('../services/achievementService');

// @desc    Get user achievements
// @route   GET /api/achievements
// @access  Private
exports.getAchievements = async (req, res, next) => {
  try {
    const achievements = await achievementService.getUserAchievements(req.user.id);
    res.status(200).json({
      success: true,
      data: achievements
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get achievement statistics
// @route   GET /api/achievements/stats
// @access  Private
exports.getAchievementStats = async (req, res, next) => {
  try {
    const stats = await achievementService.getAchievementStats(req.user.id);
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get workout streak
// @route   GET /api/achievements/streak
// @access  Private
exports.getStreak = async (req, res, next) => {
  try {
    const streak = await achievementService.calculateWorkoutStreak(req.user.id);
    res.status(200).json({
      success: true,
      data: { streak }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check and unlock new achievements
// @route   POST /api/achievements/check
// @access  Private
exports.checkAchievements = async (req, res, next) => {
  try {
    const newAchievements = await achievementService.checkAchievements(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        newAchievements,
        count: newAchievements.length
      }
    });
  } catch (error) {
    next(error);
  }
};

