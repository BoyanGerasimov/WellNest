import api from '../utils/api';

export const analyticsService = {
  async predictWeightTrajectory(targetDate) {
    const response = await api.post('/analytics/predict-weight', { targetDate });
    return response.data;
  }
};

