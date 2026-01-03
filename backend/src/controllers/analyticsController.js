const analyticsService = require('../services/analyticsService');

// @desc    Predict weight trajectory
// @route   POST /api/analytics/predict-weight
// @access  Private
exports.predictWeightTrajectory = async (req, res, next) => {
  try {
    const { targetDate } = req.body;

    if (!targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Target date is required'
      });
    }

    // Validate date format
    const date = new Date(targetDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    const prediction = await analyticsService.predictWeightTrajectory(
      req.user.id,
      targetDate
    );

    res.status(200).json({
      success: true,
      data: prediction
    });
  } catch (error) {
    next(error);
  }
};

