import api from '../utils/api';

export const suggestionService = {
  // Get all suggestions
  getAllSuggestions: async () => {
    const response = await api.get('/suggestions');
    return response.data;
  },

  // Get workout suggestions
  getWorkoutSuggestions: async () => {
    const response = await api.get('/suggestions/workout');
    return response.data;
  },

  // Get nutrition suggestions
  getNutritionSuggestions: async () => {
    const response = await api.get('/suggestions/nutrition');
    return response.data;
  }
};

