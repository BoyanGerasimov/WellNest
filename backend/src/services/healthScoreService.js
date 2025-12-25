const { PrismaClient } = require('@prisma/client');

// Use a single PrismaClient instance (lazy initialization)
let prisma;
try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (error) {
  console.error('❌ Error creating PrismaClient in healthScoreService:', error.message);
  throw error;
}

class HealthScoreService {
  /**
   * Calculate health score based on various metrics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Health score object with breakdown
   */
  async calculateHealthScore(userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      // Get last 30 days of data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      const [workouts, meals] = await Promise.all([
        prisma.workout.findMany({
          where: {
            userId,
            date: { gte: thirtyDaysAgo }
          }
        }),
        prisma.meal.findMany({
          where: {
            userId,
            date: { gte: thirtyDaysAgo }
          }
        })
      ]);

      let score = 0;
      const factors = {};
      const maxScore = 100;

      // 1. Workout frequency (0-30 points)
      const workoutDays = new Set(workouts.map(w => {
        const date = new Date(w.date);
        date.setHours(0, 0, 0, 0);
        return date.toISOString();
      })).size;
      
      // Target: 4 workouts per week = ~17 workouts in 30 days
      const targetWorkoutDays = 17;
      const workoutFrequency = Math.min(1, workoutDays / targetWorkoutDays);
      const workoutScore = Math.round(workoutFrequency * 30);
      score += workoutScore;
      factors.workoutFrequency = {
        score: workoutScore,
        maxScore: 30,
        value: workoutDays,
        target: targetWorkoutDays,
        label: 'Workout Frequency'
      };

      // 2. Calorie goal adherence (0-25 points)
      if (user.dailyCalorieGoal) {
        const totalCalories = meals.reduce((sum, m) => sum + (m.totalCalories || 0), 0);
        const daysWithMeals = new Set(meals.map(m => {
          const date = new Date(m.date);
          date.setHours(0, 0, 0, 0);
          return date.toISOString();
        })).size;
        
        const avgDailyCalories = daysWithMeals > 0 ? totalCalories / daysWithMeals : 0;
        const goal = user.dailyCalorieGoal;
        
        // Score is highest when within 10% of goal
        const deviation = Math.abs(avgDailyCalories - goal) / goal;
        const adherence = Math.max(0, 1 - (deviation * 2)); // Penalty for being off by more than 10%
        const calorieScore = Math.round(adherence * 25);
        score += calorieScore;
        
        factors.calorieAdherence = {
          score: calorieScore,
          maxScore: 25,
          value: Math.round(avgDailyCalories),
          target: goal,
          label: 'Calorie Goal Adherence'
        };
      } else {
        factors.calorieAdherence = {
          score: 0,
          maxScore: 25,
          value: 0,
          target: 0,
          label: 'Calorie Goal Adherence (No goal set)'
        };
      }

      // 3. Goal progress (0-20 points)
      if (user.goalWeight && user.currentWeight) {
        // Calculate progress towards goal
        // This is simplified - in reality, you'd track weight over time
        const weightDiff = Math.abs(user.currentWeight - user.goalWeight);
        const initialDiff = Math.abs((user.currentWeight || user.goalWeight) - user.goalWeight);
        
        // If we don't have initial weight, assume 10kg difference
        const progress = initialDiff > 0 ? 1 - (weightDiff / Math.max(initialDiff, 10)) : 0;
        const goalScore = Math.round(Math.max(0, Math.min(1, progress)) * 20);
        score += goalScore;
        
        factors.goalProgress = {
          score: goalScore,
          maxScore: 20,
          value: user.currentWeight,
          target: user.goalWeight,
          label: 'Weight Goal Progress'
        };
      } else {
        factors.goalProgress = {
          score: 0,
          maxScore: 20,
          value: user.currentWeight || 0,
          target: user.goalWeight || 0,
          label: 'Weight Goal Progress (No goal set)'
        };
      }

      // 4. Consistency (0-15 points)
      // Based on how consistently user logs workouts and meals
      const totalDays = 30;
      const daysWithActivity = new Set([
        ...workouts.map(w => {
          const date = new Date(w.date);
          date.setHours(0, 0, 0, 0);
          return date.toISOString();
        }),
        ...meals.map(m => {
          const date = new Date(m.date);
          date.setHours(0, 0, 0, 0);
          return date.toISOString();
        })
      ]).size;
      
      const consistency = daysWithActivity / totalDays;
      const consistencyScore = Math.round(consistency * 15);
      score += consistencyScore;
      
      factors.consistency = {
        score: consistencyScore,
        maxScore: 15,
        value: daysWithActivity,
        target: totalDays,
        label: 'Activity Consistency'
      };

      // 5. Nutrition balance (0-10 points)
      if (meals.length > 0) {
        const totalProtein = meals.reduce((sum, m) => sum + (m.totalProtein || 0), 0);
        const totalCarbs = meals.reduce((sum, m) => sum + (m.totalCarbs || 0), 0);
        const totalFats = meals.reduce((sum, m) => sum + (m.totalFats || 0), 0);
        const totalCalories = meals.reduce((sum, m) => sum + (m.totalCalories || 0), 0);

        // Ideal macro distribution: 30% protein, 40% carbs, 30% fats (by calories)
        // Protein: 4 cal/g, Carbs: 4 cal/g, Fats: 9 cal/g
        const proteinCalories = totalProtein * 4;
        const carbsCalories = totalCarbs * 4;
        const fatsCalories = totalFats * 9;
        const totalMacroCalories = proteinCalories + carbsCalories + fatsCalories;

        if (totalMacroCalories > 0) {
          const proteinPercent = (proteinCalories / totalMacroCalories) * 100;
          const carbsPercent = (carbsCalories / totalMacroCalories) * 100;
          const fatsPercent = (fatsCalories / totalMacroCalories) * 100;

          // Score based on how close to ideal distribution
          const proteinDeviation = Math.abs(proteinPercent - 30);
          const carbsDeviation = Math.abs(carbsPercent - 40);
          const fatsDeviation = Math.abs(fatsPercent - 30);

          const avgDeviation = (proteinDeviation + carbsDeviation + fatsDeviation) / 3;
          const balanceScore = Math.round(Math.max(0, 10 - (avgDeviation / 5)));
          score += balanceScore;

          factors.nutritionBalance = {
            score: balanceScore,
            maxScore: 10,
            value: {
              protein: Math.round(proteinPercent),
              carbs: Math.round(carbsPercent),
              fats: Math.round(fatsPercent)
            },
            target: { protein: 30, carbs: 40, fats: 30 },
            label: 'Nutrition Balance'
          };
        } else {
          factors.nutritionBalance = {
            score: 0,
            maxScore: 10,
            value: { protein: 0, carbs: 0, fats: 0 },
            target: { protein: 30, carbs: 40, fats: 30 },
            label: 'Nutrition Balance'
          };
        }
      } else {
        factors.nutritionBalance = {
          score: 0,
          maxScore: 10,
          value: { protein: 0, carbs: 0, fats: 0 },
          target: { protein: 30, carbs: 40, fats: 30 },
          label: 'Nutrition Balance (No data)'
        };
      }

      // Ensure score doesn't exceed max
      score = Math.min(score, maxScore);

      return {
        totalScore: Math.round(score),
        maxScore: maxScore,
        percentage: Math.round((score / maxScore) * 100),
        factors,
        grade: this.getGrade(score),
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error calculating health score:', error);
      throw error;
    }
  }

  /**
   * Get grade based on score
   * @param {number} score - Health score (0-100)
   * @returns {string} Grade (A+, A, B+, B, C+, C, D, F)
   */
  getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }
}

module.exports = new HealthScoreService();

