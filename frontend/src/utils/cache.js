// Cache utility for API responses and component preloading
// Cache is stored in sessionStorage and cleared on window close

const CACHE_PREFIX = 'wellnest_cache_';
const CACHE_VERSION = '1.0.0';

// Generate cache key
const getCacheKey = (url, params = {}) => {
  const paramString = JSON.stringify(params);
  return `${CACHE_PREFIX}${url}_${paramString}`;
};

// Check if cache is valid (not expired)
const isCacheValid = (cachedData) => {
  if (!cachedData) return false;
  if (cachedData.version !== CACHE_VERSION) return false;
  // Cache expires after 5 minutes
  const now = Date.now();
  return (now - cachedData.timestamp) < 5 * 60 * 1000;
};

// Get cached data
export const getCached = (url, params = {}) => {
  try {
    const key = getCacheKey(url, params);
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;
    
    const cachedData = JSON.parse(cached);
    if (isCacheValid(cachedData)) {
      return cachedData.data;
    } else {
      // Remove expired cache
      sessionStorage.removeItem(key);
      return null;
    }
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

// Set cached data
export const setCached = (url, data, params = {}) => {
  try {
    const key = getCacheKey(url, params);
    const cacheData = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    sessionStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error setting cache:', error);
    // If storage is full, clear old cache entries
    if (error.name === 'QuotaExceededError') {
      clearOldCache();
    }
  }
};

// Clear old cache entries (keep only recent ones)
const clearOldCache = () => {
  try {
    const keys = Object.keys(sessionStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    // Sort by timestamp and remove oldest 50%
    const cacheEntries = cacheKeys.map(key => {
      try {
        const data = JSON.parse(sessionStorage.getItem(key));
        return { key, timestamp: data.timestamp };
      } catch {
        return { key, timestamp: 0 };
      }
    }).sort((a, b) => a.timestamp - b.timestamp);
    
    const toRemove = cacheEntries.slice(0, Math.floor(cacheEntries.length / 2));
    toRemove.forEach(({ key }) => sessionStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing old cache:', error);
  }
};

// Clear all cache
export const clearCache = () => {
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

// Clear cache on window close
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    clearCache();
  });
  
  // Also clear on pagehide (for mobile browsers)
  window.addEventListener('pagehide', () => {
    clearCache();
  });
}

