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

// Initialize OpenAI client (optional) for tailored advice
let openai = null;
if (process.env.OPENAI_API_KEY) {
  try {
    const OpenAI = require('openai');
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('✅ OpenAI initialized for analytics advice');
  } catch (error) {
    console.warn('⚠️  OpenAI package not available, using rule-based analytics advice');
  }
} else {
  console.warn('⚠️  OPENAI_API_KEY not set, using rule-based analytics advice');
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

    // Tailored advice based on goal vs predicted difference
    const advice = await this.getGoalBasedAdvice({
      user,
      targetDate,
      daysUntilTarget,
      predictedWeight,
      dailyDeficit,
      tdee,
      avgDailyCalories
    });

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
      weightDifference: Math.round((predictedWeight - user.goalWeight) * 10) / 10,
      advice
    };
  }

  /**
   * Generate goal-based advice driven by the gap between predicted and goal weight.
   * Uses AI if available, otherwise falls back to a deterministic recommendation.
   * @private
   */
  async getGoalBasedAdvice({ user, targetDate, daysUntilTarget, predictedWeight, dailyDeficit, tdee, avgDailyCalories }) {
    const goalGapKg = predictedWeight - user.goalWeight; // + => predicted heavier than goal, - => predicted lighter than goal
    const roundedGapKg = Math.round(goalGapKg * 10) / 10;

    // If already very close, keep guidance lightweight
    if (Math.abs(goalGapKg) < 0.5) {
      return {
        type: 'maintain',
        message: 'You’re very close to your goal based on the current trend. Keep your routine consistent and monitor weekly.',
        suggestedDailyCalories: Math.round(avgDailyCalories),
        calorieDelta: 0,
        goalGapKg: roundedGapKg
      };
    }

    // Required daily deficit (positive) or surplus (negative) to hit goal by target date
    // dailyDeficitGoal = (current - goal) * 7700 / days
    const dailyDeficitGoal = ((user.currentWeight - user.goalWeight) * 7700) / Math.max(1, daysUntilTarget);
    const deltaDeficit = dailyDeficitGoal - dailyDeficit; // + => need MORE deficit; - => need LESS deficit / surplus

    // Intake-only mapping: deficit = tdee - intake -> intakeTarget = tdee - dailyDeficitGoal
    const suggestedDailyCalories = tdee - dailyDeficitGoal;
    const calorieDelta = Math.round(suggestedDailyCalories - avgDailyCalories); // + eat more, - eat less

    // Guardrails: keep numbers sane for display (we still message as "approx")
    const clampedSuggestedCalories = Math.round(Math.max(1200, Math.min(4500, suggestedDailyCalories)));

    const fallback = () => {
      const direction = goalGapKg > 0 ? 'cut' : 'bulk';
      const absGap = Math.abs(roundedGapKg);
      const delta = Math.round(Math.abs(calorieDelta));

      const message =
        direction === 'cut'
          ? `You’re projected to be about ${absGap} kg above your goal by ${targetDate}. To close the gap, aim for ~${clampedSuggestedCalories} kcal/day (about ${delta} kcal/day less than your recent average) and keep activity consistent.`
          : `You’re projected to be about ${absGap} kg below your goal by ${targetDate}. To reach it, aim for ~${clampedSuggestedCalories} kcal/day (about ${delta} kcal/day more than your recent average) and prioritize strength training and recovery.`;

      return {
        type: direction,
        message,
        suggestedDailyCalories: clampedSuggestedCalories,
        calorieDelta,
        goalGapKg: roundedGapKg
      };
    };

    if (!openai) {
      return fallback();
    }

    try {
      const prompt = `You are a fitness & nutrition coach. Create ONE short, specific recommendation tailored to the user's goal gap.

Numbers (all approximations):
- Current weight (kg): ${user.currentWeight}
- Goal weight (kg): ${user.goalWeight}
- Predicted weight at target date (kg): ${Math.round(predictedWeight * 10) / 10}
- Target date: ${targetDate}
- Days remaining: ${daysUntilTarget}
- Estimated TDEE (kcal/day): ${Math.round(tdee)}
- Recent average intake (kcal/day): ${Math.round(avgDailyCalories)}
- Suggested intake to hit goal by target date (kcal/day): ${clampedSuggestedCalories}
- Needed adjustment vs recent average (kcal/day): ${calorieDelta} (positive = eat more, negative = eat less)

Constraints:
- Keep it actionable and safe (no extreme dieting). Mention that it's an estimate.
- If user needs to gain weight (predicted < goal), focus on lean gain: modest surplus, strength training, protein, sleep.
- If user needs to lose weight (predicted > goal), focus on sustainable deficit, protein/fiber, steps/conditioning.
- 2-4 sentences max.

Return ONLY valid JSON with keys: type (cut|bulk|maintain), message, suggestedDailyCalories, calorieDelta, goalGapKg.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Return ONLY valid JSON. No markdown. No extra text.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 250
      });

      let content = completion.choices[0].message.content.trim();
      if (content.startsWith('```')) {
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }

      const parsed = JSON.parse(content);
      if (!parsed || typeof parsed !== 'object' || !parsed.message) {
        return fallback();
      }

      const type = ['cut', 'bulk', 'maintain'].includes(parsed.type) ? parsed.type : (goalGapKg > 0 ? 'cut' : 'bulk');

      return {
        type,
        message: String(parsed.message).slice(0, 400),
        suggestedDailyCalories: Number.isFinite(parsed.suggestedDailyCalories)
          ? Math.round(parsed.suggestedDailyCalories)
          : clampedSuggestedCalories,
        calorieDelta: Number.isFinite(parsed.calorieDelta) ? Math.round(parsed.calorieDelta) : calorieDelta,
        goalGapKg: Number.isFinite(parsed.goalGapKg) ? Math.round(parsed.goalGapKg * 10) / 10 : roundedGapKg
      };
    } catch (error) {
      console.warn('⚠️  AI analytics advice failed, using rule-based fallback:', error.message);
      return fallback();
    }
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

