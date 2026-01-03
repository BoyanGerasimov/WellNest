import api from '../utils/api';

export const mealService = {
  // Get all meals
  getMeals: async (params = {}) => {
    const response = await api.get('/meals', { params });
    return response.data;
  },

  // Get single meal
  getMeal: async (id) => {
    const response = await api.get(`/meals/${id}`);
    return response.data;
  },

  // Create meal
  createMeal: async (mealData) => {
    const response = await api.post('/meals', mealData);
    return response.data;
  },

  // Update meal
  updateMeal: async (id, mealData) => {
    const response = await api.put(`/meals/${id}`, mealData);
    return response.data;
  },

  // Delete meal
  deleteMeal: async (id) => {
    const response = await api.delete(`/meals/${id}`);
    return response.data;
  },

  // Search food using USDA API
  searchFood: async (query, pageNumber = 1, pageSize = 20) => {
    const response = await api.post('/meals/search-food', {
      query,
      pageNumber,
      pageSize
    });
    return response.data;
  },

  // Get nutrition data by FDC ID
  getNutrition: async (fdcId) => {
    const response = await api.post('/meals/nutrition', { fdcId });
    return response.data;
  },

  // Get meal statistics
  getMealStats: async (params = {}) => {
    const response = await api.get('/meals/stats', { params });
    return response.data;
  },

  // Scan meal image using AI
  scanMeal: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/meals/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

