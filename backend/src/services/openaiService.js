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

  /**
   * Analyze meal image and identify the meal with estimated nutrition
   * @param {Buffer} imageBuffer - Image buffer
   * @returns {Object} Meal identification and nutrition estimate
   */
  async analyzeMealImage(imageBuffer) {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Please set OPENAI_API_KEY in .env file.');
    }

    try {
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini', // Use vision-capable model
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this meal image and provide:
1. A clear description of what the meal is (e.g., "Grilled chicken breast with rice and vegetables")
2. Estimated nutrition information for a typical serving:
   - Calories (kcal)
   - Protein (g)
   - Carbohydrates (g)
   - Fat (g)
   
Return your response as a JSON object with this exact structure:
{
  "mealName": "description of the meal",
  "nutrition": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number
  },
  "servingSize": "typical serving description (e.g., '1 plate', '1 portion')"
}

Be realistic with your estimates. If you cannot clearly identify the meal, estimate based on what you can see.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3 // Lower temperature for more consistent nutrition estimates
      });

      const content = response.choices[0].message.content;
      
      // Try to parse JSON from response
      let mealData;
      try {
        // Extract JSON if wrapped in markdown code blocks
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : content;
        mealData = JSON.parse(jsonStr);
      } catch (parseError) {
        // If JSON parsing fails, try to extract values from text
        console.warn('Failed to parse JSON from OpenAI response, attempting text extraction');
        mealData = this.extractMealDataFromText(content);
      }

      return {
        mealName: mealData.mealName || 'Unknown Meal',
        nutrition: mealData.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 },
        servingSize: mealData.servingSize || '1 portion'
      };
    } catch (error) {
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

  /**
   * Fallback: Extract meal data from text if JSON parsing fails
   */
  extractMealDataFromText(text) {
    const mealData = {
      mealName: 'Unknown Meal',
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      servingSize: '1 portion'
    };

    // Try to extract meal name
    const nameMatch = text.match(/mealName["\s:]+"([^"]+)"/i) || text.match(/meal["\s:]+"([^"]+)"/i);
    if (nameMatch) mealData.mealName = nameMatch[1];

    // Try to extract nutrition values
    const caloriesMatch = text.match(/calories["\s:]+(\d+)/i);
    if (caloriesMatch) mealData.nutrition.calories = parseInt(caloriesMatch[1]);

    const proteinMatch = text.match(/protein["\s:]+(\d+\.?\d*)/i);
    if (proteinMatch) mealData.nutrition.protein = parseFloat(proteinMatch[1]);

    const carbsMatch = text.match(/carbs["\s:]+(\d+\.?\d*)/i) || text.match(/carbohydrates["\s:]+(\d+\.?\d*)/i);
    if (carbsMatch) mealData.nutrition.carbs = parseFloat(carbsMatch[1]);

    const fatMatch = text.match(/fat["\s:]+(\d+\.?\d*)/i);
    if (fatMatch) mealData.nutrition.fat = parseFloat(fatMatch[1]);

    return mealData;
  }
}

module.exports = new OpenAIService();

