const { PrismaClient } = require('@prisma/client');

// Use a single PrismaClient instance (lazy initialization)
let prisma;
try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (error) {
  console.error('❌ Error creating PrismaClient in achievementService:', error.message);
  throw error;
}

class AchievementService {
  /**
   * Check and unlock achievements for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of newly unlocked achievement types
   */
  async checkAchievements(userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return [];
      }

      const newAchievements = [];

      // Workout streak achievements
      const streak = await this.calculateWorkoutStreak(userId);
      if (streak >= 7 && !(await this.hasAchievement(userId, 'workout_streak_7'))) {
        await this.unlockAchievement(userId, 'workout_streak_7', '7 Day Streak', 'Complete 7 days of workouts in a row', '🔥', 10);
        newAchievements.push('workout_streak_7');
      }
      if (streak >= 30 && !(await this.hasAchievement(userId, 'workout_streak_30'))) {
        await this.unlockAchievement(userId, 'workout_streak_30', '30 Day Streak', 'Complete 30 days of workouts in a row', '🔥', 50);
        newAchievements.push('workout_streak_30');
      }
      if (streak >= 100 && !(await this.hasAchievement(userId, 'workout_streak_100'))) {
        await this.unlockAchievement(userId, 'workout_streak_100', '100 Day Streak', 'Complete 100 days of workouts in a row', '🔥', 200);
        newAchievements.push('workout_streak_100');
      }

      // Total workout count achievements
      const totalWorkouts = await prisma.workout.count({ where: { userId } });
      if (totalWorkouts >= 10 && !(await this.hasAchievement(userId, 'workout_count_10'))) {
        await this.unlockAchievement(userId, 'workout_count_10', '10 Workouts', 'Complete 10 workouts', '💪', 10);
        newAchievements.push('workout_count_10');
      }
      if (totalWorkouts >= 50 && !(await this.hasAchievement(userId, 'workout_count_50'))) {
        await this.unlockAchievement(userId, 'workout_count_50', '50 Workouts', 'Complete 50 workouts', '💪', 50);
        newAchievements.push('workout_count_50');
      }
      if (totalWorkouts >= 100 && !(await this.hasAchievement(userId, 'workout_count_100'))) {
        await this.unlockAchievement(userId, 'workout_count_100', '100 Workouts', 'Complete 100 workouts', '💪', 100);
        newAchievements.push('workout_count_100');
      }

      // Total calories burned achievements
      const totalCaloriesBurned = await prisma.workout.aggregate({
        where: { userId },
        _sum: { caloriesBurned: true }
      });
      const calories = totalCaloriesBurned._sum.caloriesBurned || 0;
      
      if (calories >= 10000 && !(await this.hasAchievement(userId, 'calories_10k'))) {
        await this.unlockAchievement(userId, 'calories_10k', '10K Calories', 'Burn 10,000 calories', '🔥', 25);
        newAchievements.push('calories_10k');
      }
      if (calories >= 50000 && !(await this.hasAchievement(userId, 'calories_50k'))) {
        await this.unlockAchievement(userId, 'calories_50k', '50K Calories', 'Burn 50,000 calories', '🔥', 100);
        newAchievements.push('calories_50k');
      }

      // Meal tracking achievements
      const totalMeals = await prisma.meal.count({ where: { userId } });
      if (totalMeals >= 30 && !(await this.hasAchievement(userId, 'meal_count_30'))) {
        await this.unlockAchievement(userId, 'meal_count_30', '30 Meals Logged', 'Log 30 meals', '🍎', 15);
        newAchievements.push('meal_count_30');
      }
      if (totalMeals >= 100 && !(await this.hasAchievement(userId, 'meal_count_100'))) {
        await this.unlockAchievement(userId, 'meal_count_100', '100 Meals Logged', 'Log 100 meals', '🍎', 50);
        newAchievements.push('meal_count_100');
      }

      // Goal achievement
      if (user.goalWeight && user.currentWeight) {
        const weightDiff = Math.abs(user.currentWeight - user.goalWeight);
        if (weightDiff <= 1 && !(await this.hasAchievement(userId, 'goal_reached'))) {
          await this.unlockAchievement(userId, 'goal_reached', 'Goal Achieved', 'Reach your weight goal', '🎯', 100);
          newAchievements.push('goal_reached');
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  /**
   * Calculate workout streak
   * @param {string} userId - User ID
   * @returns {Promise<number>} Current streak in days
   */
  async calculateWorkoutStreak(userId) {
    try {
      const workouts = await prisma.workout.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 100
      });

      if (workouts.length === 0) return 0;

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if there's a workout today or yesterday
      const hasRecentWorkout = workouts.some(w => {
        const workoutDate = new Date(w.date);
        workoutDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today - workoutDate) / (1000 * 60 * 60 * 24));
        return daysDiff <= 1;
      });

      if (!hasRecentWorkout) return 0;

      // Count consecutive days with workouts
      const workoutDates = new Set();
      workouts.forEach(w => {
        const date = new Date(w.date);
        date.setHours(0, 0, 0, 0);
        workoutDates.add(date.toISOString());
      });

      const sortedDates = Array.from(workoutDates)
        .map(d => new Date(d))
        .sort((a, b) => b - a);

      let currentDate = new Date(today);
      currentDate.setHours(0, 0, 0, 0);

      // Start from today or yesterday
      if (!sortedDates.some(d => d.getTime() === currentDate.getTime())) {
        currentDate.setDate(currentDate.getDate() - 1);
      }

      for (const workoutDate of sortedDates) {
        workoutDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === streak || (streak === 0 && daysDiff <= 1)) {
          streak++;
          currentDate = new Date(workoutDate);
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating workout streak:', error);
      return 0;
    }
  }

  /**
   * Unlock an achievement
   * @param {string} userId - User ID
   * @param {string} type - Achievement type
   * @param {string} title - Achievement title
   * @param {string} description - Achievement description
   * @param {string} icon - Achievement icon
   * @param {number} points - Points awarded
   * @returns {Promise<Object>} Created achievement
   */
  async unlockAchievement(userId, type, title, description, icon = '🏆', points = 10) {
    try {
      return await prisma.achievement.create({
        data: {
          userId,
          type,
          title,
          description,
          icon,
          points
        }
      });
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  /**
   * Check if user has a specific achievement
   * @param {string} userId - User ID
   * @param {string} type - Achievement type
   * @returns {Promise<boolean>} True if user has the achievement
   */
  async hasAchievement(userId, type) {
    try {
      const achievement = await prisma.achievement.findFirst({
        where: { userId, type }
      });
      return !!achievement;
    } catch (error) {
      console.error('Error checking achievement:', error);
      return false;
    }
  }

  /**
   * Get all achievements for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of achievements
   */
  async getUserAchievements(userId) {
    try {
      return await prisma.achievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: 'desc' }
      });
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  /**
   * Get achievement statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Achievement stats
   */
  async getAchievementStats(userId) {
    try {
      const [achievements, totalPoints, streak] = await Promise.all([
        this.getUserAchievements(userId),
        prisma.achievement.aggregate({
          where: { userId },
          _sum: { points: true }
        }),
        this.calculateWorkoutStreak(userId)
      ]);

      return {
        totalAchievements: achievements.length,
        totalPoints: totalPoints._sum.points || 0,
        currentStreak: streak,
        achievements
      };
    } catch (error) {
      console.error('Error getting achievement stats:', error);
      throw error;
    }
  }
}

module.exports = new AchievementService();

