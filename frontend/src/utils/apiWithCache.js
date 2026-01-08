// API utility with caching support
import api from './api';
import { getCached, setCached } from './cache';

// Create a cached API request
export const cachedApi = {
  get: async (url, config = {}) => {
    const params = config.params || {};
    const useCache = config.cache !== false; // Cache by default
    
    // Check cache first
    if (useCache) {
      const cached = getCached(url, params);
      if (cached !== null) {
        return { data: cached, fromCache: true };
      }
    }
    
    // Make API request
    try {
      const response = await api.get(url, config);
      
      // Cache successful responses
      if (useCache && response.status === 200) {
        setCached(url, response.data, params);
      }
      
      return { data: response.data, fromCache: false };
    } catch (error) {
      // If request fails, try to return cached data as fallback
      if (useCache) {
        const cached = getCached(url, params);
        if (cached !== null) {
          console.warn('API request failed, using cached data:', url);
          return { data: cached, fromCache: true, error };
        }
      }
      throw error;
    }
  },
  
  post: api.post.bind(api),
  put: api.put.bind(api),
  patch: api.patch.bind(api),
  delete: api.delete.bind(api),
};

export default cachedApi;

