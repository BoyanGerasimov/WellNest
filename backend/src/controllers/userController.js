const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Use a single PrismaClient instance (lazy initialization)
let prisma;
try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (error) {
  console.error('❌ Error creating PrismaClient in userController:', error.message);
  throw error;
}

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        height: true,
        startingWeight: true,
        currentWeight: true,
        goalWeight: true,
        activityLevel: true,
        dailyCalorieGoal: true,
        role: true,
        isEmailVerified: true,
        lastLogin: true,
        lastWeightCheckinAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      dateOfBirth,
      gender,
      height,
      currentWeight,
      goalWeight,
      activityLevel,
      dailyCalorieGoal
    } = req.body;

    // Prevent name changes (immutable)
    if (req.body.name !== undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be changed'
      });
    }

    const updateData = {};
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender) updateData.gender = gender;
    if (height !== undefined) updateData.height = parseFloat(height);
    if (goalWeight !== undefined) updateData.goalWeight = parseFloat(goalWeight);
    if (activityLevel) updateData.activityLevel = activityLevel;
    if (dailyCalorieGoal !== undefined) updateData.dailyCalorieGoal = parseInt(dailyCalorieGoal);

    // Weight handling:
    // - Allow setting initial weight only once during onboarding (sets startingWeight + creates first weight entry)
    // - After onboarding, weight changes must go through /api/weights (weekly check-ins)
    if (currentWeight !== undefined) {
      const existingUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          startingWeight: true
        }
      });

      const parsedWeight = parseFloat(currentWeight);

      if (!existingUser?.startingWeight) {
        const now = new Date();
        updateData.startingWeight = parsedWeight;
        updateData.currentWeight = parsedWeight;
        updateData.lastWeightCheckinAt = now;

        // Create initial weight entry for history/chart
        try {
          await prisma.weightEntry.create({
            data: {
              userId: req.user.id,
              weight: parsedWeight,
              recordedAt: now,
            }
          });
        } catch (e) {
          // Non-fatal: user update should still succeed even if entry creation fails
          console.warn('⚠️ Failed to create initial weight entry:', e.message);
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Weight cannot be edited from profile. Please use the weekly weight check-in.'
        });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        height: true,
        startingWeight: true,
        currentWeight: true,
        goalWeight: true,
        activityLevel: true,
        dailyCalorieGoal: true,
        role: true,
        lastWeightCheckinAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/users/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user || !user.password) {
      return res.status(400).json({
        success: false,
        message: 'Password cannot be updated for OAuth users'
      });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

