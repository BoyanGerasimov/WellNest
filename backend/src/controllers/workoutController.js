const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

// Use a single PrismaClient instance (lazy initialization)
let prisma;
try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (error) {
  console.error('❌ Error creating PrismaClient in workoutController:', error.message);
  throw error;
}

// @desc    Get all workouts for user
// @route   GET /api/workouts
// @access  Private
exports.getWorkouts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId: req.user.id
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [workouts, total] = await Promise.all([
      prisma.workout.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.workout.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: workouts,
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

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
exports.getWorkout = async (req, res, next) => {
  try {
    const workout = await prisma.workout.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create workout
// @route   POST /api/workouts
// @access  Private
exports.createWorkout = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, date, exercises, totalDuration, caloriesBurned, notes, tags } = req.body;

    const workout = await prisma.workout.create({
      data: {
        userId: req.user.id,
        name,
        date: date ? new Date(date) : new Date(),
        exercises: exercises || [],
        totalDuration: totalDuration || 0,
        caloriesBurned: caloriesBurned || 0,
        notes: notes || '',
        tags: tags || []
      }
    });

    res.status(201).json({
      success: true,
      data: workout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
exports.updateWorkout = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let workout = await prisma.workout.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    const { name, date, exercises, totalDuration, caloriesBurned, notes, tags } = req.body;

    workout = await prisma.workout.update({
      where: { id: req.params.id },
      data: {
        name: name !== undefined ? name : workout.name,
        date: date !== undefined ? new Date(date) : workout.date,
        exercises: exercises !== undefined ? exercises : workout.exercises,
        totalDuration: totalDuration !== undefined ? totalDuration : workout.totalDuration,
        caloriesBurned: caloriesBurned !== undefined ? caloriesBurned : workout.caloriesBurned,
        notes: notes !== undefined ? notes : workout.notes,
        tags: tags !== undefined ? tags : workout.tags
      }
    });

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
exports.deleteWorkout = async (req, res, next) => {
  try {
    const workout = await prisma.workout.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    await prisma.workout.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Workout deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get workout statistics
// @route   GET /api/workouts/stats
// @access  Private
exports.getWorkoutStats = async (req, res, next) => {
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

    const [totalWorkouts, totalCalories, totalDuration, workouts] = await Promise.all([
      prisma.workout.count({ where }),
      prisma.workout.aggregate({
        where,
        _sum: { caloriesBurned: true }
      }),
      prisma.workout.aggregate({
        where,
        _sum: { totalDuration: true }
      }),
      prisma.workout.findMany({
        where,
        select: {
          date: true,
          caloriesBurned: true,
          totalDuration: true
        },
        orderBy: { date: 'asc' }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalWorkouts,
        totalCaloriesBurned: totalCalories._sum.caloriesBurned || 0,
        totalDuration: totalDuration._sum.totalDuration || 0,
        workouts
      }
    });
  } catch (error) {
    next(error);
  }
};

