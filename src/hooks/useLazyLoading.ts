'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseLazyLoadingOptions<T> {
  fetchData: (page: number, pageSize: number) => Promise<{ data: T[]; total: number; hasMore: boolean }>;
  pageSize?: number;
  initialPage?: number;
  threshold?: number; // Distance from bottom to trigger load
}

interface UseLazyLoadingReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  total: number;
  currentPage: number;
}

export function useLazyLoading<T>({
  fetchData,
  pageSize = 20,
  initialPage = 1,
  threshold = 100
}: UseLazyLoadingOptions<T>): UseLazyLoadingReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const loadingRef = useRef(false);

  const loadData = useCallback(async (page: number, append = false) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchData(page, pageSize);
      
      setData(prevData => append ? [...prevData, ...result.data] : result.data);
      setTotal(result.total);
      setHasMore(result.hasMore);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchData, pageSize]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadData(currentPage + 1, true);
    }
  }, [loading, hasMore, currentPage, loadData]);

  const refresh = useCallback(() => {
    setData([]);
    setCurrentPage(initialPage);
    setHasMore(true);
    setTotal(0);
    loadData(initialPage, false);
  }, [initialPage, loadData]);

  // Initial load
  useEffect(() => {
    loadData(initialPage, false);
  }, [initialPage, loadData]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    total,
    currentPage
  };
}

// Hook for intersection observer (infinite scroll)
export function useInfiniteScroll(
  callback: () => void,
  options: {
    threshold?: number;
    rootMargin?: string;
    enabled?: boolean;
  } = {}
) {
  const { threshold = 0.1, rootMargin = '0px', enabled = true } = options;
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !targetRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(targetRef.current);

    return () => observer.disconnect();
  }, [callback, threshold, rootMargin, enabled]);

  return targetRef;
}

// Hook for virtual scrolling
interface UseVirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function useVirtualScroll<T>(
  items: T[],
  { itemHeight, containerHeight, overscan = 5 }: UseVirtualScrollOptions
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);
  
  const visibleItems = items.slice(startIndex, endIndex).map((item, index) => ({
    item,
    index: startIndex + index
  }));
  
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex
  };
}