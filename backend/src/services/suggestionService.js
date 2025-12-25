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

// Initialize OpenAI client (optional)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  try {
    const OpenAI = require('openai');
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log('✅ OpenAI initialized for AI suggestions');
  } catch (error) {
    console.warn('⚠️  OpenAI package not available, using rule-based suggestions');
  }
} else {
  console.warn('⚠️  OPENAI_API_KEY not set, using rule-based suggestions');
}

class SuggestionService {
  /**
   * Get workout suggestions using AI or rule-based fallback
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

      // Try AI-powered suggestions first if OpenAI is available
      if (openai) {
        try {
          return await this.getAIWorkoutSuggestions(user, recentWorkouts);
        } catch (error) {
          // Handle specific error types
          const status = error.status || error.response?.status;
          if (status === 429) {
            console.warn('⚠️  OpenAI quota exceeded. Using rule-based suggestions. Add billing to your OpenAI account at https://platform.openai.com/account/billing to enable AI suggestions.');
          } else if (status === 401) {
            console.warn('⚠️  OpenAI API key invalid. Using rule-based suggestions. Check your OPENAI_API_KEY in .env file.');
          } else {
            console.error('AI suggestion failed, falling back to rule-based:', error.message);
          }
          // Fall through to rule-based
        }
      }

      // Rule-based fallback
      return this.getRuleBasedWorkoutSuggestions(user, recentWorkouts);
    } catch (error) {
      console.error('Error getting workout suggestions:', error);
      return [];
    }
  }

  /**
   * Get AI-powered workout suggestions using OpenAI
   * @private
   */
  async getAIWorkoutSuggestions(user, recentWorkouts) {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentWorkoutCount = recentWorkouts.filter(
      w => new Date(w.date) >= last7Days
    ).length;

    const workoutTypes = new Set();
    recentWorkouts.forEach(w => {
      if (w.tags && w.tags.length > 0) {
        w.tags.forEach(tag => workoutTypes.add(tag));
      }
    });

    // Prepare user context
    const userContext = {
      name: user.name,
      currentWeight: user.currentWeight,
      goalWeight: user.goalWeight,
      activityLevel: user.activityLevel,
      height: user.height,
      gender: user.gender,
      recentWorkoutCount,
      totalWorkouts: recentWorkouts.length,
      workoutTypes: Array.from(workoutTypes),
      lastWorkoutDate: recentWorkouts[0] ? new Date(recentWorkouts[0].date).toLocaleDateString() : 'Never'
    };

    const prompt = `You are a fitness coach AI assistant. Analyze the following user data and provide 3-5 personalized workout suggestions.

User Profile:
- Name: ${userContext.name}
- Current Weight: ${userContext.currentWeight || 'Not set'} kg
- Goal Weight: ${userContext.goalWeight || 'Not set'} kg
- Activity Level: ${userContext.activityLevel || 'Not set'}
- Height: ${userContext.height || 'Not set'} cm
- Gender: ${userContext.gender || 'Not set'}

Recent Activity:
- Workouts in last 7 days: ${recentWorkoutCount}
- Total recent workouts: ${userContext.totalWorkouts}
- Workout types: ${userContext.workoutTypes.length > 0 ? userContext.workoutTypes.join(', ') : 'None'}
- Last workout: ${userContext.lastWorkoutDate}

Provide 3-5 specific, actionable workout suggestions based on this data. Consider:
1. Workout frequency and consistency
2. Variety in exercise types
3. Progress toward weight goals
4. Activity level appropriateness
5. Recovery and rest needs

Format your response as a JSON array where each suggestion has:
- type: a short identifier (e.g., "workout_frequency", "cardio_focus", etc.)
- message: a clear, encouraging suggestion (max 100 characters)
- priority: "high", "medium", or "low"
- icon: a relevant emoji

Return ONLY valid JSON, no markdown, no explanation. Example format:
[
  {"type": "workout_frequency", "message": "Try to work out at least 3 times per week for best results", "priority": "high", "icon": "💪"},
  {"type": "cardio_focus", "message": "Add 20-30 min cardio sessions 3x/week to boost weight loss", "priority": "high", "icon": "🏃"}
]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful fitness coach AI. Provide personalized workout suggestions as a JSON array. Return ONLY valid JSON array, no markdown, no explanation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    let responseContent = completion.choices[0].message.content.trim();
    let aiSuggestions = [];

    // Remove markdown code blocks if present
    if (responseContent.startsWith('```')) {
      responseContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    try {
      // Try to parse as JSON
      const parsed = JSON.parse(responseContent);
      // Handle both array and object with suggestions key
      if (Array.isArray(parsed)) {
        aiSuggestions = parsed;
      } else if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        aiSuggestions = parsed.suggestions;
      } else if (parsed.workout && Array.isArray(parsed.workout)) {
        aiSuggestions = parsed.workout;
      } else {
        // If it's an object, try to extract suggestions
        aiSuggestions = Object.values(parsed).filter(item => 
          item && typeof item === 'object' && item.message
        );
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Response content:', responseContent.substring(0, 200));
      // Fall through to rule-based
      return this.getRuleBasedWorkoutSuggestions(user, recentWorkouts);
    }

    // Validate and format suggestions
    return aiSuggestions
      .filter(s => s && s.message && s.type)
      .map(s => ({
        type: s.type,
        message: s.message.substring(0, 150), // Limit length
        priority: ['high', 'medium', 'low'].includes(s.priority) ? s.priority : 'medium',
        icon: s.icon || '💡'
      }))
      .slice(0, 5); // Limit to 5 suggestions
  }

  /**
   * Get rule-based workout suggestions (fallback)
   * @private
   */
  getRuleBasedWorkoutSuggestions(user, recentWorkouts) {
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
  }

  /**
   * Get nutrition suggestions using AI or rule-based fallback
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

      if (recentMeals.length === 0) {
        return [{
          type: 'start_tracking',
          message: 'Start logging your meals to get personalized nutrition suggestions',
          priority: 'high',
          icon: '🍎'
        }];
      }

      // Try AI-powered suggestions first if OpenAI is available
      if (openai) {
        try {
          return await this.getAINutritionSuggestions(user, recentMeals);
        } catch (error) {
          // Handle specific error types
          const status = error.status || error.response?.status;
          if (status === 429) {
            console.warn('⚠️  OpenAI quota exceeded. Using rule-based suggestions. Add billing to your OpenAI account at https://platform.openai.com/account/billing to enable AI suggestions.');
          } else if (status === 401) {
            console.warn('⚠️  OpenAI API key invalid. Using rule-based suggestions. Check your OPENAI_API_KEY in .env file.');
          } else {
            console.error('AI suggestion failed, falling back to rule-based:', error.message);
          }
          // Fall through to rule-based
        }
      }

      // Rule-based fallback
      return this.getRuleBasedNutritionSuggestions(user, recentMeals);
    } catch (error) {
      console.error('Error getting nutrition suggestions:', error);
      return [];
    }
  }

  /**
   * Get AI-powered nutrition suggestions using OpenAI
   * @private
   */
  async getAINutritionSuggestions(user, recentMeals) {
    const totalCalories = recentMeals.reduce((sum, meal) => sum + (meal.totalCalories || 0), 0);
    const totalProtein = recentMeals.reduce((sum, meal) => sum + (meal.totalProtein || 0), 0);
    const totalCarbs = recentMeals.reduce((sum, meal) => sum + (meal.totalCarbs || 0), 0);
    const totalFats = recentMeals.reduce((sum, meal) => sum + (meal.totalFats || 0), 0);
    
    const daysWithMeals = new Set(recentMeals.map(m => {
      const date = new Date(m.date);
      date.setHours(0, 0, 0, 0);
      return date.toISOString();
    })).size;

    const avgDailyCalories = daysWithMeals > 0 ? totalCalories / daysWithMeals : 0;
    const avgDailyProtein = daysWithMeals > 0 ? totalProtein / daysWithMeals : 0;
    const avgDailyCarbs = daysWithMeals > 0 ? totalCarbs / daysWithMeals : 0;
    const avgDailyFats = daysWithMeals > 0 ? totalFats / daysWithMeals : 0;

    const userContext = {
      name: user.name,
      currentWeight: user.currentWeight,
      goalWeight: user.goalWeight,
      height: user.height,
      gender: user.gender,
      activityLevel: user.activityLevel,
      dailyCalorieGoal: user.dailyCalorieGoal,
      avgDailyCalories: Math.round(avgDailyCalories),
      avgDailyProtein: Math.round(avgDailyProtein * 10) / 10,
      avgDailyCarbs: Math.round(avgDailyCarbs * 10) / 10,
      avgDailyFats: Math.round(avgDailyFats * 10) / 10,
      mealsLogged: recentMeals.length,
      daysTracked: daysWithMeals
    };

    const prompt = `You are a nutrition coach AI assistant. Analyze the following user nutrition data and provide 3-5 personalized nutrition suggestions.

User Profile:
- Name: ${userContext.name}
- Current Weight: ${userContext.currentWeight || 'Not set'} kg
- Goal Weight: ${userContext.goalWeight || 'Not set'} kg
- Height: ${userContext.height || 'Not set'} cm
- Gender: ${userContext.gender || 'Not set'}
- Activity Level: ${userContext.activityLevel || 'Not set'}
- Daily Calorie Goal: ${userContext.dailyCalorieGoal || 'Not set'} calories

Nutrition Data (Last 7 Days):
- Average Daily Calories: ${userContext.avgDailyCalories} cal
- Average Daily Protein: ${userContext.avgDailyProtein}g
- Average Daily Carbs: ${userContext.avgDailyCarbs}g
- Average Daily Fats: ${userContext.avgDailyFats}g
- Meals Logged: ${userContext.mealsLogged}
- Days Tracked: ${userContext.daysTracked}

Provide 3-5 specific, actionable nutrition suggestions based on this data. Consider:
1. Calorie goal adherence
2. Macronutrient balance (protein, carbs, fats)
3. Meal frequency and timing
4. Progress toward weight goals
5. Nutritional adequacy

Format your response as a JSON array where each suggestion has:
- type: a short identifier (e.g., "calorie_excess", "protein_boost", etc.)
- message: a clear, encouraging suggestion (max 100 characters)
- priority: "high", "medium", or "low"
- icon: a relevant emoji

Return ONLY valid JSON, no markdown, no explanation. Example format:
[
  {"type": "calorie_excess", "message": "You're consuming 15% more calories than your goal. Try reducing portion sizes", "priority": "high", "icon": "⚠️"},
  {"type": "protein_boost", "message": "Increase protein to 120g/day for better muscle recovery", "priority": "medium", "icon": "🥩"}
]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful nutrition coach AI. Provide personalized nutrition suggestions as a JSON array. Return ONLY valid JSON array, no markdown, no explanation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    let responseContent = completion.choices[0].message.content.trim();
    let aiSuggestions = [];

    // Remove markdown code blocks if present
    if (responseContent.startsWith('```')) {
      responseContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    try {
      const parsed = JSON.parse(responseContent);
      if (Array.isArray(parsed)) {
        aiSuggestions = parsed;
      } else if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        aiSuggestions = parsed.suggestions;
      } else if (parsed.nutrition && Array.isArray(parsed.nutrition)) {
        aiSuggestions = parsed.nutrition;
      } else {
        aiSuggestions = Object.values(parsed).filter(item => 
          item && typeof item === 'object' && item.message
        );
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Response content:', responseContent.substring(0, 200));
      return this.getRuleBasedNutritionSuggestions(user, recentMeals);
    }

    // Validate and format suggestions
    return aiSuggestions
      .filter(s => s && s.message && s.type)
      .map(s => ({
        type: s.type,
        message: s.message.substring(0, 150),
        priority: ['high', 'medium', 'low'].includes(s.priority) ? s.priority : 'medium',
        icon: s.icon || '💡'
      }))
      .slice(0, 5);
  }

  /**
   * Get rule-based nutrition suggestions (fallback)
   * @private
   */
  getRuleBasedNutritionSuggestions(user, recentMeals) {
    const suggestions = [];

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
    
    if (user.currentWeight) {
      const recommendedProtein = user.currentWeight * 1.0;
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
