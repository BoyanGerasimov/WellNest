const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();

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
        currentWeight: true,
        goalWeight: true,
        activityLevel: true,
        dailyCalorieGoal: true,
        role: true,
        isEmailVerified: true,
        lastLogin: true,
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
      name,
      dateOfBirth,
      gender,
      height,
      currentWeight,
      goalWeight,
      activityLevel,
      dailyCalorieGoal
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender) updateData.gender = gender;
    if (height !== undefined) updateData.height = parseFloat(height);
    if (currentWeight !== undefined) updateData.currentWeight = parseFloat(currentWeight);
    if (goalWeight !== undefined) updateData.goalWeight = parseFloat(goalWeight);
    if (activityLevel) updateData.activityLevel = activityLevel;
    if (dailyCalorieGoal !== undefined) updateData.dailyCalorieGoal = parseInt(dailyCalorieGoal);

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
        currentWeight: true,
        goalWeight: true,
        activityLevel: true,
        dailyCalorieGoal: true,
        role: true,
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

