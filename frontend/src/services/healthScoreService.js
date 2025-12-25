import api from '../utils/api';

export const healthScoreService = {
  // Get health score
  getHealthScore: async () => {
    const response = await api.get('/health-score');
    return response.data;
  }
};

