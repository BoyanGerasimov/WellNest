const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    
    if (this.apiKey) {
      try {
        this.client = new OpenAI({
          apiKey: this.apiKey
        });
        console.log('✅ OpenAI service initialized for AI Chat Coach');
      } catch (error) {
        console.warn('⚠️  OpenAI client initialization failed:', error.message);
        this.client = null;
      }
    } else {
      console.warn('⚠️  OPENAI_API_KEY not set. AI Chat Coach will not be available.');
      this.client = null;
    }
  }

  async chatWithCoach(userId, message, context = {}) {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Please set OPENAI_API_KEY in .env file.');
    }

    try {
      const systemPrompt = `You are a friendly and knowledgeable fitness coach named WellNest Coach. 
Help users with their fitness goals, nutrition questions, and workout advice. 
Be encouraging, supportive, and provide practical, actionable advice.
Keep responses concise (under 200 words) and conversational.
If you don't have enough information, ask clarifying questions.`;

      const userContext = this.buildContext(context);
      const fullMessage = userContext ? `${userContext}\n\nUser: ${message}` : message;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullMessage }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      // Handle specific error types
      const status = error.status || error.response?.status;
      if (status === 429) {
        throw new Error('OpenAI quota exceeded. Please add billing to your OpenAI account at https://platform.openai.com/account/billing');
      } else if (status === 401) {
        throw new Error('OpenAI API key invalid. Please check your OPENAI_API_KEY in .env file.');
      } else {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
    }
  }

  buildContext(context) {
    if (!context.user) return null;

    let contextStr = `User Profile:\n`;
    if (context.user.name) contextStr += `Name: ${context.user.name}\n`;
    if (context.user.currentWeight) contextStr += `Current Weight: ${context.user.currentWeight}kg\n`;
    if (context.user.goalWeight) contextStr += `Goal Weight: ${context.user.goalWeight}kg\n`;
    if (context.user.activityLevel) contextStr += `Activity Level: ${context.user.activityLevel}\n`;
    if (context.user.dailyCalorieGoal) contextStr += `Daily Calorie Goal: ${context.user.dailyCalorieGoal} kcal\n`;
    
    if (context.recentWorkouts && context.recentWorkouts.length > 0) {
      contextStr += `\nRecent Workouts (last ${context.recentWorkouts.length}):\n`;
      context.recentWorkouts.forEach((workout, idx) => {
        contextStr += `${idx + 1}. ${workout.name} - ${workout.caloriesBurned} kcal burned\n`;
      });
    }

    if (context.recentMeals && context.recentMeals.length > 0) {
      contextStr += `\nRecent Meals (last ${context.recentMeals.length}):\n`;
      context.recentMeals.forEach((meal, idx) => {
        contextStr += `${idx + 1}. ${meal.name} - ${meal.totalCalories} kcal\n`;
      });
    }

    return contextStr;
  }
}

module.exports = new OpenAIService();

