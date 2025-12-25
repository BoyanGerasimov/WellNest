const { PrismaClient } = require('@prisma/client');

// Use a single PrismaClient instance (lazy initialization)
let prisma;
try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (error) {
  console.error('❌ Error creating PrismaClient in suggestionService:', error.message);
  throw error;
}

class SuggestionService {
  /**
   * Get workout suggestions based on user goals, activity level, and history
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of suggestion objects
   */
  async getWorkoutSuggestions(userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return [];
      }

      const recentWorkouts = await prisma.workout.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 10
      });

      const suggestions = [];

      // Check workout frequency
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      const recentWorkoutCount = recentWorkouts.filter(
        w => new Date(w.date) >= last7Days
      ).length;

      if (recentWorkoutCount < 3) {
        suggestions.push({
          type: 'workout_frequency',
          message: 'Try to work out at least 3 times per week for best results',
          priority: 'high',
          icon: '💪'
        });
      }

      // Check for variety
      const workoutTypes = new Set();
      recentWorkouts.forEach(w => {
        if (w.tags && w.tags.length > 0) {
          w.tags.forEach(tag => workoutTypes.add(tag));
        }
      });

      if (workoutTypes.size < 2 && recentWorkouts.length >= 3) {
        suggestions.push({
          type: 'workout_variety',
          message: 'Add variety to your workouts! Try different types of exercises',
          priority: 'medium',
          icon: '🔄'
        });
      }

      // Goal-based suggestions
      if (user.goalWeight && user.currentWeight) {
        const weightDiff = user.currentWeight - user.goalWeight;
        if (weightDiff > 5) {
          suggestions.push({
            type: 'weight_loss',
            message: 'Focus on cardio workouts to reach your weight loss goal',
            priority: 'high',
            icon: '🏃'
          });
        } else if (weightDiff < -5) {
          suggestions.push({
            type: 'weight_gain',
            message: 'Focus on strength training and ensure adequate nutrition for muscle gain',
            priority: 'high',
            icon: '💪'
          });
        }
      }

      // Activity level suggestions
      if (user.activityLevel === 'sedentary' && recentWorkoutCount === 0) {
        suggestions.push({
          type: 'start_working_out',
          message: 'Start with light activities like walking or yoga',
          priority: 'high',
          icon: '🚶'
        });
      }

      // Rest day suggestion
      const lastWorkout = recentWorkouts[0];
      if (lastWorkout) {
        const daysSinceLastWorkout = Math.floor(
          (new Date() - new Date(lastWorkout.date)) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastWorkout === 0 && recentWorkoutCount >= 5) {
          suggestions.push({
            type: 'rest_day',
            message: 'Consider taking a rest day to allow your body to recover',
            priority: 'low',
            icon: '😴'
          });
        }
      }

      return suggestions;
    } catch (error) {
      console.error('Error getting workout suggestions:', error);
      return [];
    }
  }

  /**
   * Get nutrition suggestions based on user goals and meal history
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of suggestion objects
   */
  async getNutritionSuggestions(userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return [];
      }

      const recentMeals = await prisma.meal.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 7
      });

      const suggestions = [];

      if (recentMeals.length === 0) {
        suggestions.push({
          type: 'start_tracking',
          message: 'Start logging your meals to get personalized nutrition suggestions',
          priority: 'high',
          icon: '🍎'
        });
        return suggestions;
      }

      // Calculate average daily calories
      const totalCalories = recentMeals.reduce((sum, meal) => sum + (meal.totalCalories || 0), 0);
      const avgDailyCalories = totalCalories / Math.max(1, recentMeals.length);

      if (user.dailyCalorieGoal) {
        const goal = user.dailyCalorieGoal;
        const percentage = (avgDailyCalories / goal) * 100;

        if (percentage > 110) {
          suggestions.push({
            type: 'calorie_excess',
            message: `You're consuming ${Math.round(percentage - 100)}% more calories than your goal. Consider reducing portion sizes`,
            priority: 'high',
            icon: '⚠️'
          });
        } else if (percentage < 90) {
          suggestions.push({
            type: 'calorie_deficit',
            message: `You're consuming ${Math.round(100 - percentage)}% fewer calories than your goal. Make sure you're eating enough!`,
            priority: 'medium',
            icon: '📉'
          });
        } else {
          suggestions.push({
            type: 'calorie_on_track',
            message: 'Great job! You\'re staying within your calorie goal',
            priority: 'low',
            icon: '✅'
          });
        }
      }

      // Protein intake suggestion
      const totalProtein = recentMeals.reduce((sum, meal) => sum + (meal.totalProtein || 0), 0);
      const avgProtein = totalProtein / Math.max(1, recentMeals.length);
      
      // Recommended protein: 0.8-1.2g per kg of body weight
      if (user.currentWeight) {
        const recommendedProtein = user.currentWeight * 1.0; // 1g per kg
        if (avgProtein < recommendedProtein * 0.8) {
          suggestions.push({
            type: 'protein_low',
            message: `Consider increasing protein intake. Aim for ${Math.round(recommendedProtein)}g per day`,
            priority: 'medium',
            icon: '🥩'
          });
        }
      }

      // Meal frequency suggestion
      const mealsByDate = {};
      recentMeals.forEach(meal => {
        const date = new Date(meal.date).toDateString();
        if (!mealsByDate[date]) {
          mealsByDate[date] = 0;
        }
        mealsByDate[date]++;
      });

      const avgMealsPerDay = Object.values(mealsByDate).reduce((sum, count) => sum + count, 0) / Object.keys(mealsByDate).length;
      if (avgMealsPerDay < 3) {
        suggestions.push({
          type: 'meal_frequency',
          message: 'Try to eat 3-4 balanced meals per day for better metabolism',
          priority: 'medium',
          icon: '🍽️'
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Error getting nutrition suggestions:', error);
      return [];
    }
  }

  /**
   * Get all suggestions (workout + nutrition)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Object with workout and nutrition suggestions
   */
  async getAllSuggestions(userId) {
    const [workoutSuggestions, nutritionSuggestions] = await Promise.all([
      this.getWorkoutSuggestions(userId),
      this.getNutritionSuggestions(userId)
    ]);

    return {
      workout: workoutSuggestions,
      nutrition: nutritionSuggestions,
      all: [...workoutSuggestions, ...nutritionSuggestions].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
    };
  }
}

module.exports = new SuggestionService();

