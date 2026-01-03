const nutritionService = require('./nutritionService');

class VisionService {
  constructor() {
    // Check if Google Cloud Vision is configured
    this.isConfigured = false;
    
    if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_KEY_FILE) {
      try {
        const vision = require('@google-cloud/vision');
        this.client = new vision.ImageAnnotatorClient({
          keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
        });
        this.isConfigured = true;
        console.log('✅ Google Cloud Vision API configured');
      } catch (error) {
        console.warn('⚠️  Google Cloud Vision client initialization failed:', error.message);
        console.warn('   Recipe scanner will not be available. Install @google-cloud/vision package.');
      }
    } else {
      console.warn('⚠️  Google Cloud Vision not configured. Set GOOGLE_CLOUD_PROJECT_ID and GOOGLE_CLOUD_KEY_FILE in .env');
    }
  }

  async scanRecipe(imageBuffer) {
    if (!this.isConfigured || !this.client) {
      throw new Error('Google Cloud Vision API is not configured. Please set up GOOGLE_CLOUD_PROJECT_ID and GOOGLE_CLOUD_KEY_FILE in .env file.');
    }

    try {
      // Detect text in image
      const [result] = await this.client.textDetection({
        image: { content: imageBuffer }
      });

      const detections = result.textAnnotations;
      if (!detections || detections.length === 0) {
        throw new Error('No text found in image. Please ensure the image contains readable text.');
      }

      // Extract text (first detection is the full text)
      const text = detections[0].description;

      // Parse recipe ingredients
      const ingredients = this.parseIngredients(text);

      // Get nutrition data for each ingredient using USDA API
      const nutritionData = [];
      for (const ingredient of ingredients) {
        try {
          // Search for the ingredient in USDA database
          const searchResults = await nutritionService.searchFood(ingredient, 1, 1);
          
          if (searchResults.foods && searchResults.foods.length > 0) {
            const food = searchResults.foods[0];
            nutritionData.push({
              ingredient,
              nutrition: {
                description: food.description,
                calories: food.nutrients.calories || 0,
                protein: food.nutrients.protein || 0,
                carbs: food.nutrients.carbs || 0,
                fat: food.nutrients.fat || 0,
                fdcId: food.fdcId
              }
            });
          } else {
            // If not found, add placeholder
            nutritionData.push({
              ingredient,
              nutrition: null,
              error: 'Not found in USDA database'
            });
          }
        } catch (error) {
          console.error(`Failed to get nutrition for ${ingredient}:`, error.message);
          nutritionData.push({
            ingredient,
            nutrition: null,
            error: error.message
          });
        }
      }

      return {
        text,
        ingredients,
        nutritionData,
        totalIngredients: ingredients.length,
        foundNutritionData: nutritionData.filter(item => item.nutrition !== null).length
      };
    } catch (error) {
      if (error.message.includes('No text found')) {
        throw error;
      }
      throw new Error(`Vision API error: ${error.message}`);
    }
  }

  /**
   * Parse ingredients from recipe text
   * @param {string} text - Extracted text from image
   * @returns {Array<string>} Array of ingredient names
   */
  parseIngredients(text) {
    const lines = text.split('\n');
    const ingredients = [];
    const ingredientKeywords = ['cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'piece', 'pieces', 'clove', 'cloves'];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) continue;
      
      // Skip lines that look like headers or instructions
      if (trimmedLine.toLowerCase().includes('instructions') || 
          trimmedLine.toLowerCase().includes('directions') ||
          trimmedLine.toLowerCase().includes('method') ||
          trimmedLine.toLowerCase().includes('step')) {
        break; // Stop parsing if we hit instructions
      }

      // Match patterns like "1 cup flour", "2 eggs", "1/2 tsp salt"
      // Look for numbers followed by units or ingredient names
      const hasQuantity = /^\d+/.test(trimmedLine) || /^\d+\/\d+/.test(trimmedLine);
      const hasUnit = ingredientKeywords.some(keyword => 
        trimmedLine.toLowerCase().includes(keyword)
      );
      
      // If line has quantity or unit, it's likely an ingredient
      if (hasQuantity || hasUnit) {
        // Extract ingredient name (remove quantity and unit)
        let ingredient = trimmedLine
          .replace(/^\d+\/\d+\s*/, '') // Remove fractions like "1/2"
          .replace(/^\d+\.?\d*\s*/, '') // Remove numbers like "1" or "1.5"
          .replace(/\b(cup|cups|tbsp|tsp|oz|lb|g|kg|ml|l|piece|pieces|clove|cloves)\b/gi, '') // Remove units
          .trim();
        
        // Clean up common prefixes
        ingredient = ingredient.replace(/^-\s*/, '').trim();
        
        if (ingredient.length > 2) {
          ingredients.push(ingredient);
        }
      }
    }

    // If no ingredients found with pattern matching, try to extract from common recipe formats
    if (ingredients.length === 0) {
      // Look for lines that might be ingredients (short lines, not sentences)
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length > 3 && trimmed.length < 100 && !trimmed.includes('.')) {
          // Skip if it looks like a header
          if (!trimmed.toLowerCase().match(/^(ingredients|recipe|serves|prep| cook)/)) {
            ingredients.push(trimmed);
          }
        }
      }
    }

    return ingredients.slice(0, 20); // Limit to 20 ingredients
  }
}

module.exports = new VisionService();

