import api from '../utils/api';

export const workoutService = {
  // Get all workouts
  getWorkouts: async (params = {}) => {
    const response = await api.get('/workouts', { params });
    return response.data;
  },

  // Get single workout
  getWorkout: async (id) => {
    const response = await api.get(`/workouts/${id}`);
    return response.data;
  },

  // Create workout
  createWorkout: async (workoutData) => {
    const response = await api.post('/workouts', workoutData);
    return response.data;
  },

  // Update workout
  updateWorkout: async (id, workoutData) => {
    const response = await api.put(`/workouts/${id}`, workoutData);
    return response.data;
  },

  // Delete workout
  deleteWorkout: async (id) => {
    const response = await api.delete(`/workouts/${id}`);
    return response.data;
  },

  // Get workout statistics
  getWorkoutStats: async (params = {}) => {
    const response = await api.get('/workouts/stats', { params });
    return response.data;
  }
};

