import api from '../utils/api';

export const recipeService = {
  async scanRecipe(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/recipes/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

