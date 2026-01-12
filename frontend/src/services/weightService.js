import api from '../utils/api';

export const weightService = {
  getWeights: async (params = {}) => {
    const response = await api.get('/weights', { params });
    return response.data;
  },

  createWeight: async (weight) => {
    const response = await api.post('/weights', { weight });
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }
};


