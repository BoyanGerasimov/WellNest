const axios = require('axios');

const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1';

class NutritionService {
  constructor() {
    this.apiKey = process.env.USDA_API_KEY;
    
    if (!this.apiKey) {
      console.warn('⚠️  USDA_API_KEY not set. API will work but with lower rate limits (60 requests/hour).');
      console.warn('   Get a free API key at: https://fdc.nal.usda.gov/api-key-signup.html');
    } else {
      console.log('✅ USDA FoodData Central API key configured');
    }

    this.client = axios.create({
      baseURL: USDA_API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Search for food items using USDA FoodData Central
   * @param {string} query - Search query (e.g., "apple", "chicken breast")
   * @param {number} pageNumber - Page number (default: 1)
   * @param {number} pageSize - Results per page (default: 20, max: 200)
   * @returns {Promise<Object>} Search results with foods array
   */
  async searchFood(query, pageNumber = 1, pageSize = 20) {
    try {
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        throw new Error('Search query is required and must be a non-empty string');
      }

      // Simplified params - remove problematic dataType and sortBy for now
      const params = {
        query: query.trim(),
        pageNumber: Math.max(1, parseInt(pageNumber) || 1),
        pageSize: Math.min(200, Math.max(1, parseInt(pageSize) || 20))
      };

      // Add API key if available
      if (this.apiKey) {
        params.api_key = this.apiKey;
      }

      const response = await this.client.get('/foods/search', { params });
      
      // Transform USDA response to a simpler, consistent format
      return {
        foods: (response.data.foods || []).map(food => ({
          fdcId: food.fdcId,
          description: food.description,
          brandOwner: food.brandOwner || null,
          dataType: food.dataType,
          nutrients: this._extractNutrients(food.foodNutrients || []),
          servingSize: food.servingSize || 100,
          servingSizeUnit: food.servingSizeUnit || 'g'
        })),
        totalHits: response.data.totalHits || 0,
        currentPage: response.data.currentPage || pageNumber,
        totalPages: response.data.totalPages || 1
      };
    } catch (error) {
      if (error.response) {
        // API error response
        const status = error.response.status;
        const errorData = error.response.data;
        const message = errorData?.error?.message || 
                       errorData?.message || 
                       errorData?.error ||
                       error.message;
        
        // Log full error for debugging
        console.error('USDA API Error:', {
          status,
          statusText: error.response.statusText,
          data: errorData,
          url: error.config?.url
        });
        
        if (status === 429) {
          throw new Error('USDA API rate limit exceeded. Please try again later.');
        } else if (status === 400) {
          throw new Error(`Invalid search query: ${message}`);
        } else if (status === 404) {
          throw new Error('No foods found matching your search.');
        } else if (status === 500) {
          throw new Error(`USDA API server error. The search query "${query.trim()}" may be invalid or the API is temporarily unavailable. Please try a different search term.`);
        }
        
        throw new Error(`USDA API error (${status}): ${message}`);
      } else if (error.request) {
        throw new Error('Unable to connect to USDA API. Please check your internet connection.');
      } else {
        throw new Error(`Nutrition API error: ${error.message}`);
      }
    }
  }

  /**
   * Get detailed nutrition information by FDC ID
   * @param {number} fdcId - FoodData Central ID
   * @param {Array<number>} nutrients - Optional array of nutrient IDs to include
   * @returns {Promise<Object>} Detailed nutrition data
   */
  async getNutritionData(fdcId, nutrients = [203, 204, 205, 208, 269]) {
    try {
      if (!fdcId || isNaN(parseInt(fdcId))) {
        throw new Error('Valid FDC ID is required');
      }

      const params = {
        nutrients: nutrients // Default: Protein (203), Fat (204), Carbs (205), Calories (208), Sugar (269)
      };

      // Add API key if available
      if (this.apiKey) {
        params.api_key = this.apiKey;
      }

      const response = await this.client.get(`/food/${fdcId}`, { params });
      
      return {
        fdcId: response.data.fdcId,
        description: response.data.description,
        brandOwner: response.data.brandOwner || null,
        ingredients: response.data.ingredients || null,
        nutrients: this._extractNutrients(response.data.foodNutrients || []),
        servingSize: response.data.servingSize || 100,
        servingSizeUnit: response.data.servingSizeUnit || 'g',
        publicationDate: response.data.publicationDate || null
      };
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error?.message || error.message;
        
        if (status === 404) {
          throw new Error(`Food with FDC ID ${fdcId} not found.`);
        } else if (status === 429) {
          throw new Error('USDA API rate limit exceeded. Please try again later.');
        }
        
        throw new Error(`USDA API error (${status}): ${message}`);
      } else if (error.request) {
        throw new Error('Unable to connect to USDA API. Please check your internet connection.');
      } else {
        throw new Error(`Nutrition API error: ${error.message}`);
      }
    }
  }

  /**
   * Extract and format nutrients from USDA response
   * @private
   * @param {Array} foodNutrients - Array of nutrient objects from USDA API
   * @returns {Object} Formatted nutrients object
   */
  _extractNutrients(foodNutrients) {
    const nutrients = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0,
      fiber: 0,
      sodium: 0
    };
    
    if (!Array.isArray(foodNutrients)) {
      return nutrients;
    }

    foodNutrients.forEach(nutrient => {
      if (!nutrient.nutrient) return;
      
      const name = nutrient.nutrient.name.toLowerCase();
      const value = nutrient.amount || 0;
      const unit = nutrient.nutrient.unitName || '';
      
      // Map common nutrients by name and nutrient ID
      const nutrientId = nutrient.nutrient.id;
      
      // Energy/Calories (ID: 208)
      if (nutrientId === 208 || name.includes('energy')) {
        nutrients.calories = Math.round(value);
      }
      // Protein (ID: 203)
      else if (nutrientId === 203 || name.includes('protein')) {
        nutrients.protein = parseFloat(value.toFixed(2));
      }
      // Total Fat (ID: 204)
      else if (nutrientId === 204 || (name.includes('total lipid') && name.includes('fat'))) {
        nutrients.fat = parseFloat(value.toFixed(2));
      }
      // Carbohydrates (ID: 205)
      else if (nutrientId === 205 || name.includes('carbohydrate')) {
        nutrients.carbs = parseFloat(value.toFixed(2));
      }
      // Sugars (ID: 269)
      else if (nutrientId === 269 || name.includes('sugar')) {
        nutrients.sugar = parseFloat(value.toFixed(2));
      }
      // Fiber (ID: 291)
      else if (nutrientId === 291 || name.includes('fiber')) {
        nutrients.fiber = parseFloat(value.toFixed(2));
      }
      // Sodium (ID: 307)
      else if (nutrientId === 307 || name.includes('sodium')) {
        nutrients.sodium = parseFloat(value.toFixed(2));
      }
    });

    return nutrients;
  }
}

module.exports = new NutritionService();

