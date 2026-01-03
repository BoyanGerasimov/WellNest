const axios = require('axios');
const nutritionService = require('./nutritionService');

const OPEN_FOOD_FACTS_API_URL = 'https://world.openfoodfacts.org/api/v2';

class BarcodeService {
  constructor() {
    this.client = axios.create({
      baseURL: OPEN_FOOD_FACTS_API_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WellNestApp/1.0 (https://wellnest.app)'
      }
    });
    console.log('✅ BarcodeService initialized (Open Food Facts + USDA fallback)');
  }

  /**
   * Lookup product by barcode using Open Food Facts API, with USDA fallback
   * @param {string} barcode - Product barcode (UPC, EAN, etc.)
   * @returns {Promise<Object>} Product data with nutrition information
   */
  async lookupBarcode(barcode) {
    try {
      if (!barcode || typeof barcode !== 'string' || barcode.trim().length === 0) {
        throw new Error('Barcode is required');
      }

      const barcodeTrimmed = barcode.trim();
      console.log(`🔍 Looking up barcode: ${barcodeTrimmed}`);

      // Try Open Food Facts first
      try {
        const response = await this.client.get(`/product/${barcodeTrimmed}.json`);
        
        if (response.data && response.data.status === 1 && response.data.product) {
          const product = response.data.product;
          console.log(`✅ Found product in Open Food Facts: ${product.product_name || 'Unknown'}`);

          // Extract nutrition data
          const nutrients = {
            calories: Math.round(product.nutriments?.['energy-kcal_100g'] || 
                                product.nutriments?.['energy-kcal'] || 0),
            protein: parseFloat((product.nutriments?.['proteins_100g'] || 
                                product.nutriments?.['proteins'] || 0).toFixed(2)),
            carbs: parseFloat((product.nutriments?.['carbohydrates_100g'] || 
                              product.nutriments?.['carbohydrates'] || 0).toFixed(2)),
            fat: parseFloat((product.nutriments?.['fat_100g'] || 
                            product.nutriments?.['fat'] || 0).toFixed(2)),
            sugar: parseFloat((product.nutriments?.['sugars_100g'] || 
                              product.nutriments?.['sugars'] || 0).toFixed(2)),
            fiber: parseFloat((product.nutriments?.['fiber_100g'] || 
                              product.nutriments?.['fiber'] || 0).toFixed(2)),
            sodium: parseFloat((product.nutriments?.['sodium_100g'] || 
                               product.nutriments?.['sodium'] || 0).toFixed(2))
          };

          return {
            barcode: product.code,
            name: product.product_name || product.product_name_en || 'Unknown Product',
            brand: product.brands || null,
            image: product.image_url || product.image_front_url || null,
            servingSize: 100, // Open Food Facts typically uses per 100g
            servingSizeUnit: 'g',
            nutrients: nutrients,
            ingredients: product.ingredients_text || null,
            // Map to USDA-like format for compatibility
            fdcId: null, // Not a USDA product
            description: product.product_name || product.product_name_en || 'Unknown Product',
            brandOwner: product.brands || null,
            source: 'Open Food Facts'
          };
        }
      } catch (offError) {
        console.log(`⚠️  Product not found in Open Food Facts: ${offError.message}`);
        // Continue to USDA fallback
      }

      // Product not found in Open Food Facts
      // Provide helpful error message with suggestions
      console.log(`❌ Product with barcode ${barcodeTrimmed} not found in Open Food Facts`);
      
      throw new Error(
        `Product with barcode ${barcodeTrimmed} not found in our database. ` +
        `This product may not be in Open Food Facts yet. ` +
        `Please try searching for the product name manually using the search tab above. ` +
        `For example, search for "sausage" or the specific product name.`
      );
    } catch (error) {
      if (error.message.includes('not found in our databases')) {
        throw error; // Re-throw our custom error
      } else if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          throw new Error(
            `Product with barcode ${barcode.trim()} not found. ` +
            `Try searching manually or check if the barcode is correct.`
          );
        }
        throw new Error(`Open Food Facts API error: ${error.message}`);
      } else if (error.request) {
        throw new Error('Unable to connect to barcode lookup services. Please check your internet connection.');
      } else {
        throw new Error(`Barcode lookup error: ${error.message}`);
      }
    }
  }
}

module.exports = new BarcodeService();

