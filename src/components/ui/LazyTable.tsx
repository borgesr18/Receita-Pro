'use client';

import React, { useMemo } from 'react';
import { Table, TableProps } from './Table';
import { SkeletonTable } from './Skeleton';
import { useLazyLoading, useInfiniteScroll } from '@/hooks/useLazyLoading';
import { Button } from './Button';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface LazyTableProps<T> extends Omit<TableProps<T>, 'data' | 'loading'> {
  fetchData: (page: number, pageSize: number, searchTerm?: string, filters?: Record<string, any>) => Promise<{
    data: T[];
    total: number;
    hasMore: boolean;
  }>;
  pageSize?: number;
  enableInfiniteScroll?: boolean;
  skeletonRows?: number;
  searchTerm?: string;
  filters?: Record<string, any>;
  onDataChange?: (data: T[], total: number) => void;
}

export function LazyTable<T extends Record<string, any>>({
  fetchData,
  pageSize = 20,
  enableInfiniteScroll = true,
  skeletonRows = 5,
  searchTerm = '',
  filters = {},
  onDataChange,
  ...tableProps
}: LazyTableProps<T>) {
  // Memoize fetch function to include search and filters
  const memoizedFetchData = useMemo(
    () => (page: number, size: number) => fetchData(page, size, searchTerm, filters),
    [fetchData, searchTerm, filters]
  );

  const {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    total,
    currentPage
  } = useLazyLoading({
    fetchData: memoizedFetchData,
    pageSize
  });

  // Infinite scroll trigger
  const loadMoreRef = useInfiniteScroll(
    loadMore,
    {
      enabled: enableInfiniteScroll && hasMore && !loading,
      threshold: 0.1,
      rootMargin: '100px'
    }
  );

  // Notify parent of data changes
  React.useEffect(() => {
    onDataChange?.(data, total);
  }, [data, total, onDataChange]);

  // Refresh data when search or filters change
  React.useEffect(() => {
    refresh();
  }, [searchTerm, filters, refresh]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Erro ao carregar dados
        </h3>
        <p className="text-text-muted mb-4">{error}</p>
        <Button
          onClick={refresh}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Table */}
      <Table
        {...tableProps}
        data={data}
        loading={loading && currentPage === 1}
        totalItems={total}
      />

      {/* Loading State for Initial Load */}
      {loading && currentPage === 1 && (
        <SkeletonTable rows={skeletonRows} columns={tableProps.columns.length} />
      )}

      {/* Infinite Scroll Loading */}
      {enableInfiniteScroll && hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {loading && currentPage > 1 && (
            <div className="flex items-center gap-2 text-text-muted">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Carregando mais dados...</span>
            </div>
          )}
        </div>
      )}

      {/* Manual Load More Button */}
      {!enableInfiniteScroll && hasMore && (
        <div className="flex justify-center py-4">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Carregando...
              </>
            ) : (
              'Carregar mais'
            )}
          </Button>
        </div>
      )}

      {/* End of Data Message */}
      {!hasMore && data.length > 0 && (
        <div className="text-center py-4 text-text-muted">
          <p>Todos os dados foram carregados ({total} itens)</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && data.length === 0 && (
        <div className="text-center py-8">
          <p className="text-text-muted">
            {searchTerm || Object.keys(filters).length > 0
              ? 'Nenhum resultado encontrado para os filtros aplicados'
              : 'Nenhum dado disponível'
            }
          </p>
          {(searchTerm || Object.keys(filters).length > 0) && (
            <Button
              onClick={() => {
                // This would need to be handled by parent component
                // to clear search and filters
              }}
              variant="ghost"
              className="mt-2"
            >
              Limpar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Hook for managing lazy table state
export function useLazyTable<T>({
  fetchData,
  pageSize = 20,
  searchDebounceMs = 300
}: {
  fetchData: LazyTableProps<T>['fetchData'];
  pageSize?: number;
  searchDebounceMs?: number;
}) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState<Record<string, any>>({});
  const [data, setData] = React.useState<T[]>([]);
  const [total, setTotal] = React.useState(0);

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, searchDebounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, searchDebounceMs]);

  const updateFilter = React.useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const removeFilter = React.useCallback((key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = React.useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  const handleDataChange = React.useCallback((newData: T[], newTotal: number) => {
    setData(newData);
    setTotal(newTotal);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    filters,
    updateFilter,
    removeFilter,
    clearFilters,
    data,
    total,
    handleDataChange,
    tableProps: {
      fetchData,
      pageSize,
      searchTerm: debouncedSearchTerm,
      filters,
      onDataChange: handleDataChange
    }
  };
}