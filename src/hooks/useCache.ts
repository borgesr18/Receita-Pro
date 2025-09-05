'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Default 5 minutes
  maxSize?: number; // Maximum cache entries
  persistToStorage?: boolean; // Persist to localStorage
  storageKey?: string;
}

interface UseCacheReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
  setData: (data: T) => void;
}

// In-memory cache store
class CacheStore {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttl: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

// Global cache instance
const globalCache = new CacheStore();

// Storage utilities
const storage = {
  get: (key: string): any => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage errors
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage errors
    }
  }
};

// Main cache hook
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): UseCacheReturn<T> {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes
    persistToStorage = false,
    storageKey = `cache_${key}`
  } = options;

  const [data, setDataState] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);
  
  // Update fetcher ref
  fetcherRef.current = fetcher;

  // Load initial data from cache or storage
  useEffect(() => {
    // Try memory cache first
    const cachedData = globalCache.get<T>(key);
    if (cachedData) {
      setDataState(cachedData);
      return;
    }

    // Try localStorage if enabled
    if (persistToStorage) {
      const storedEntry = storage.get(storageKey);
      if (storedEntry && Date.now() - storedEntry.timestamp < ttl) {
        setDataState(storedEntry.data);
        // Also set in memory cache
        globalCache.set(key, storedEntry.data, ttl);
        return;
      }
    }

    // No cached data, fetch fresh
    refetch();
  }, [key, ttl, persistToStorage, storageKey, refetch]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcherRef.current();
      
      // Update state
      setDataState(result);
      
      // Update memory cache
      globalCache.set(key, result, ttl);
      
      // Update localStorage if enabled
      if (persistToStorage) {
        storage.set(storageKey, {
          data: result,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Fetch failed');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [key, ttl, persistToStorage, storageKey]);

  const invalidate = useCallback(() => {
    globalCache.delete(key);
    if (persistToStorage) {
      storage.remove(storageKey);
    }
    setDataState(null);
    setError(null);
  }, [key, persistToStorage, storageKey]);

  const setData = useCallback((newData: T) => {
    setDataState(newData);
    globalCache.set(key, newData, ttl);
    
    if (persistToStorage) {
      storage.set(storageKey, {
        data: newData,
        timestamp: Date.now()
      });
    }
  }, [key, ttl, persistToStorage, storageKey]);

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidate,
    setData
  };
}

// Hook for caching API responses
export function useApiCache<T>(
  endpoint: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  return useCache(`api_${endpoint}`, fetcher, {
    ttl: 2 * 60 * 1000, // 2 minutes for API data
    persistToStorage: true,
    ...options
  });
}

// Hook for caching UI state
export function useUICache<T>(
  key: string,
  initialValue: T,
  options: Omit<CacheOptions, 'persistToStorage'> = {}
) {
  const [data, setDataState] = useState<T>(() => {
    const cached = globalCache.get<T>(`ui_${key}`);
    return cached !== null ? cached : initialValue;
  });

  const setData = useCallback((newData: T) => {
    setDataState(newData);
    globalCache.set(`ui_${key}`, newData, options.ttl || 30 * 60 * 1000); // 30 minutes default
  }, [key, options.ttl]);

  const clearData = useCallback(() => {
    globalCache.delete(`ui_${key}`);
    setDataState(initialValue);
  }, [key, initialValue]);

  return {
    data,
    setData,
    clearData
  };
}

// Hook for managing cache globally
export function useCacheManager() {
  const clearAll = useCallback(() => {
    globalCache.clear();
    // Clear localStorage cache entries
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  const clearByPattern = useCallback(() => {
    // This is a simplified implementation
    // In a real app, you might want more sophisticated pattern matching
    globalCache.clear();
  }, []);

  const getCacheStats = useCallback(() => {
    // Return cache statistics
    return {
      memoryEntries: globalCache['cache'].size,
      storageEntries: Object.keys(localStorage).filter(key => 
        key.startsWith('cache_')
      ).length
    };
  }, []);

  return {
    clearAll,
    clearByPattern,
    getCacheStats
  };
}

// Export cache store for advanced usage
export { globalCache };