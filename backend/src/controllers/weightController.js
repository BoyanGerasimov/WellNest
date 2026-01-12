const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

// Use a single PrismaClient instance (lazy initialization)
let prisma;
try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (error) {
  console.error('❌ Error creating PrismaClient in weightController:', error.message);
  throw error;
}

// @desc    Get weight entries (optionally filtered)
// @route   GET /api/weights
// @access  Private
exports.getWeights = async (req, res, next) => {
  try {
    const { startDate, endDate, limit } = req.query;

    const where = { userId: req.user.id };
    if (startDate || endDate) {
      where.recordedAt = {};
      if (startDate) where.recordedAt.gte = new Date(startDate);
      if (endDate) where.recordedAt.lte = new Date(endDate);
    }

    const entries = await prisma.weightEntry.findMany({
      where,
      orderBy: { recordedAt: 'asc' },
      take: limit ? Math.min(parseInt(limit, 10), 365) : undefined,
      select: {
        id: true,
        weight: true,
        recordedAt: true,
        createdAt: true,
      }
    });

    res.status(200).json({
      success: true,
      data: entries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create weight entry (weekly check-in)
// @route   POST /api/weights
// @access  Private
exports.createWeight = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { weight } = req.body;
    const parsedWeight = parseFloat(weight);

    const now = new Date();

    const entry = await prisma.weightEntry.create({
      data: {
        userId: req.user.id,
        weight: parsedWeight,
        recordedAt: now,
      },
      select: {
        id: true,
        weight: true,
        recordedAt: true,
        createdAt: true,
      }
    });

    // Also keep user.currentWeight in sync, and set startingWeight if it wasn't set yet
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        currentWeight: parsedWeight,
        lastWeightCheckinAt: now,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        height: true,
        startingWeight: true,
        currentWeight: true,
        goalWeight: true,
        activityLevel: true,
        dailyCalorieGoal: true,
        lastWeightCheckinAt: true,
        updatedAt: true,
      }
    });

    // If startingWeight is still null, set it now (first ever weight entry)
    let finalUser = updatedUser;
    if (updatedUser.startingWeight == null) {
      finalUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { startingWeight: parsedWeight },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          dateOfBirth: true,
          gender: true,
          height: true,
          startingWeight: true,
          currentWeight: true,
          goalWeight: true,
          activityLevel: true,
          dailyCalorieGoal: true,
          lastWeightCheckinAt: true,
          updatedAt: true,
        }
      });
    }

    res.status(201).json({
      success: true,
      data: entry,
      user: finalUser
    });
  } catch (error) {
    next(error);
  }
};


