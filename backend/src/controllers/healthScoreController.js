const healthScoreService = require('../services/healthScoreService');

// @desc    Get health score
// @route   GET /api/health-score
// @access  Private
exports.getHealthScore = async (req, res, next) => {
  try {
    const healthScore = await healthScoreService.calculateHealthScore(req.user.id);
    res.status(200).json({
      success: true,
      data: healthScore
    });
  } catch (error) {
    next(error);
  }
};

