const { PrismaClient } = require('@prisma/client');

// Use a single PrismaClient instance (lazy initialization)
let prisma;
try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (error) {
  console.error('❌ Error creating PrismaClient in analyticsService:', error.message);
  throw error;
}

class AnalyticsService {
  /**
   * Predict weight loss/gain trajectory
   * @param {string} userId - User ID
   * @param {Date|string} targetDate - Target date for prediction
   * @returns {Promise<Object>} Prediction data
   */
  async predictWeightTrajectory(userId, targetDate) {
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: {
        currentWeight: true,
        goalWeight: true,
        height: true,
        dateOfBirth: true,
        gender: true,
        activityLevel: true
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.currentWeight || !user.goalWeight) {
      throw new Error('User weight data not available. Please update your profile with current weight and goal weight.');
    }

    // Get historical meal data (last 90 days)
    const meals = await prisma.meal.findMany({
      where: { 
        userId,
        date: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
        }
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        totalCalories: true
      }
    });

    // Calculate average daily calorie intake
    const dailyCalories = this.groupByDate(meals, 'totalCalories');
    const avgDailyCalories = dailyCalories.length > 0 
      ? dailyCalories.reduce((a, b) => a + b, 0) / dailyCalories.length
      : 2000; // Default if no meal data
    
    // Calculate BMR and TDEE
    const bmr = this.calculateBMR(user);
    const tdee = this.calculateTDEE(bmr, user.activityLevel);
    const dailyDeficit = tdee - avgDailyCalories;

    // Calculate days until target date
    const targetDateObj = new Date(targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDateObj.setHours(0, 0, 0, 0);
    
    const daysUntilTarget = Math.ceil((targetDateObj - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilTarget < 0) {
      throw new Error('Target date must be in the future');
    }

    // Predict weight change (1kg ≈ 7700 calories)
    const predictedWeightChange = (dailyDeficit * daysUntilTarget) / 7700;
    const predictedWeight = user.currentWeight - predictedWeightChange;

    // Calculate if on track (within 2kg of goal)
    const onTrack = Math.abs(predictedWeight - user.goalWeight) < 2;

    // Calculate weekly weight change rate
    const weeklyWeightChange = (dailyDeficit * 7) / 7700;

    return {
      currentWeight: user.currentWeight,
      goalWeight: user.goalWeight,
      predictedWeight: Math.round(predictedWeight * 10) / 10,
      predictedDate: targetDate,
      dailyDeficit: Math.round(dailyDeficit),
      daysRemaining: daysUntilTarget,
      weeklyWeightChange: Math.round(weeklyWeightChange * 10) / 10,
      onTrack,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      avgDailyCalories: Math.round(avgDailyCalories),
      weightDifference: Math.round((predictedWeight - user.goalWeight) * 10) / 10
    };
  }

  /**
   * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
   * @param {Object} user - User object with weight, height, dateOfBirth, gender
   * @returns {number} BMR in kcal/day
   */
  calculateBMR(user) {
    const weight = user.currentWeight || 70;
    const height = user.height || 170; // in cm
    const age = user.dateOfBirth ? this.calculateAge(user.dateOfBirth) : 30;

    if (user.gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (user.gender === 'female') {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      // Average of male and female for other/unspecified
      return (10 * weight + 6.25 * height - 5 * age - 78);
    }
  }

  /**
   * Calculate Total Daily Energy Expenditure (TDEE)
   * @param {number} bmr - Basal Metabolic Rate
   * @param {string} activityLevel - Activity level
   * @returns {number} TDEE in kcal/day
   */
  calculateTDEE(bmr, activityLevel) {
    const multipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    return bmr * (multipliers[activityLevel] || 1.2);
  }

  /**
   * Group items by date and extract field values
   * @param {Array} items - Array of items with date and field
   * @param {string} field - Field name to extract
   * @returns {Array} Array of field values
   */
  groupByDate(items, field) {
    const grouped = {};
    
    items.forEach(item => {
      const dateKey = new Date(item.date).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item[field] || 0);
    });

    // Sum values for each date
    return Object.keys(grouped).map(date => {
      return grouped[date].reduce((sum, val) => sum + val, 0);
    });
  }

  /**
   * Calculate age from date of birth
   * @param {Date|string} dateOfBirth - Date of birth
   * @returns {number} Age in years
   */
  calculateAge(dateOfBirth) {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
}

module.exports = new AnalyticsService();

