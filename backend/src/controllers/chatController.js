const { PrismaClient } = require('@prisma/client');
const openaiService = require('../services/openaiService');

// Use a single PrismaClient instance (lazy initialization)
let prisma;
try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (error) {
  console.error('❌ Error creating PrismaClient in chatController:', error.message);
  throw error;
}

// @desc    Chat with AI coach
// @route   POST /api/chat
// @access  Private
exports.chatWithCoach = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get user context
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        currentWeight: true,
        goalWeight: true,
        activityLevel: true,
        dailyCalorieGoal: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent workouts and meals for context
    const [recentWorkouts, recentMeals] = await Promise.all([
      prisma.workout.findMany({
        where: { userId: req.user.id },
        orderBy: { date: 'desc' },
        take: 5,
        select: {
          name: true,
          caloriesBurned: true,
          date: true
        }
      }),
      prisma.meal.findMany({
        where: { userId: req.user.id },
        orderBy: { date: 'desc' },
        take: 5,
        select: {
          name: true,
          totalCalories: true,
          date: true
        }
      })
    ]);

    const context = {
      user,
      recentWorkouts,
      recentMeals
    };

    const response = await openaiService.chatWithCoach(req.user.id, message.trim(), context);

    // Save chat history
    await prisma.chatMessage.create({
      data: {
        userId: req.user.id,
        message: message.trim(),
        response,
        timestamp: new Date()
      }
    });

    res.status(200).json({
      success: true,
      response
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat history
// @route   GET /api/chat/history
// @access  Private
exports.getChatHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const messages = await prisma.chatMessage.findMany({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        id: true,
        message: true,
        response: true,
        timestamp: true
      }
    });

    res.status(200).json({
      success: true,
      data: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear chat history
// @route   DELETE /api/chat/history
// @access  Private
exports.clearChatHistory = async (req, res, next) => {
  try {
    await prisma.chatMessage.deleteMany({
      where: { userId: req.user.id }
    });

    res.status(200).json({
      success: true,
      message: 'Chat history cleared'
    });
  } catch (error) {
    next(error);
  }
};

