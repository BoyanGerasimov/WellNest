import api from '../utils/api';

export const achievementService = {
  // Get all achievements
  getAchievements: async () => {
    const response = await api.get('/achievements');
    return response.data;
  },

  // Get achievement statistics
  getAchievementStats: async () => {
    const response = await api.get('/achievements/stats');
    return response.data;
  },

  // Get workout streak
  getStreak: async () => {
    const response = await api.get('/achievements/streak');
    return response.data;
  },

  // Check and unlock new achievements
  checkAchievements: async () => {
    const response = await api.post('/achievements/check');
    return response.data;
  }
};

