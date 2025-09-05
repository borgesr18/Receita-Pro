'use client';

import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { SkeletonTable } from './LoadingStates';

// Types
export interface Column<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
}

export interface TableAction<T = any> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (record: T) => void;
  disabled?: (record: T) => boolean;
  variant?: 'default' | 'primary' | 'danger';
}

export interface TableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    onChange: (page: number, pageSize: number) => void;
  };
  rowKey?: keyof T | ((record: T) => string);
  onRow?: (record: T, index: number) => {
    onClick?: () => void;
    onDoubleClick?: () => void;
    className?: string;
  };
  actions?: TableAction<T>[];
  searchable?: boolean;
  filterable?: boolean;
  selectable?: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[], selectedRows: T[]) => void;
  };
  emptyText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Table Component
export function Table<T = any>({
  columns,
  data,
  loading = false,
  pagination,
  rowKey = 'id',
  onRow,
  actions,
  searchable = false,
  filterable = false,
  selectable,
  emptyText = 'Nenhum dado encontrado',
  className = '',
  size = 'md'
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters] = useState<Record<string, any>>({});
  const [selectedRows, setSelectedRows] = useState<string[]>(selectable?.selectedRowKeys || []);

  // Get row key
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey] || index);
  };

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm && searchable) {
      result = result.filter(item => {
        return columns.some(column => {
          const value = column.dataIndex ? item[column.dataIndex] : '';
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        result = result.filter(item => {
          const column = columns.find(col => col.key === key);
          const itemValue = column?.dataIndex ? item[column.dataIndex] : '';
          return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const column = columns.find(col => col.key === sortConfig.key);
        const aValue = column?.dataIndex ? a[column.dataIndex] : '';
        const bValue = column?.dataIndex ? b[column.dataIndex] : '';

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, filters, sortConfig, columns, searchable]);

  // Handle sorting
  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    setSortConfig(current => {
      if (current?.key === columnKey) {
        if (current.direction === 'asc') {
          return { key: columnKey, direction: 'desc' };
        } else {
          return null; // Remove sorting
        }
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = processedData.map((record, index) => getRowKey(record, index));
      setSelectedRows(allKeys);
      selectable?.onChange(allKeys, processedData);
    } else {
      setSelectedRows([]);
      selectable?.onChange([], []);
    }
  };

  const handleSelectRow = (record: T, index: number, checked: boolean) => {
    const key = getRowKey(record, index);
    let newSelectedRows;
    
    if (checked) {
      newSelectedRows = [...selectedRows, key];
    } else {
      newSelectedRows = selectedRows.filter(k => k !== key);
    }
    
    setSelectedRows(newSelectedRows);
    const selectedRecords = processedData.filter((item, idx) => 
      newSelectedRows.includes(getRowKey(item, idx))
    );
    selectable?.onChange(newSelectedRows, selectedRecords);
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const paddingClasses = {
    sm: 'px-2 py-1',
    md: 'px-4 py-2',
    lg: 'px-6 py-3'
  };

  if (loading) {
    return <SkeletonTable rows={5} columns={columns.length} className={className} />;
  }

  return (
    <div className={`bg-background rounded-lg shadow ${className}`}>
      {/* Header with search and filters */}
      {(searchable || filterable) && (
        <div className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            {searchable && (
              <div className="relative flex-1" role="search">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-focus-ring focus:border-transparent focus:ring-offset-2 focus:ring-offset-background"
                  aria-label="Pesquisar na tabela: Buscar..."
                  aria-describedby="search-help"
                />
                <div id="search-help" className="sr-only">
                  Digite para filtrar os resultados da tabela
                </div>
              </div>
            )}
            
            {filterable && (
              <button className="inline-flex items-center px-4 py-2 border border-border rounded-lg bg-background text-text-primary hover:bg-surface-hover focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto" role="region" aria-label="Tabela de dados" tabIndex={0}>
        <table className="w-full" role="table">
          <caption className="sr-only">
            Tabela com {processedData.length} {processedData.length === 1 ? 'resultado' : 'resultados'}
            {searchTerm && ` filtrados por "${searchTerm}"`}
            {sortConfig?.key && ` ordenados por ${sortConfig.key} em ordem ${sortConfig.direction === 'asc' ? 'crescente' : 'decrescente'}`}
          </caption>
          <thead className="bg-surface">
            <tr role="row">
              {selectable && (
                <th className={`${paddingClasses[size]} text-left`} role="columnheader" scope="col">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === processedData.length && processedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-border text-primary focus:ring-focus-ring"
                    aria-label={`Selecionar ${selectedRows.length === processedData.length ? 'nenhum' : 'todos'} os itens`}
                    aria-describedby="select-all-help"
                  />
                  <div id="select-all-help" className="sr-only">
                    {selectedRows.length} de {processedData.length} itens selecionados
                  </div>
                </th>
              )}
              
              {columns.map((column) => {
                const isSortable = column.sortable;
                const isCurrentSort = sortConfig?.key === column.key;
                
                return (
                  <th
                    key={column.key}
                    className={`
                      ${paddingClasses[size]} ${sizeClasses[size]}
                      font-medium text-text-primary
                      ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                      ${isSortable ? 'cursor-pointer hover:bg-surface-hover focus:bg-surface-hover focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-surface' : ''}
                    `}
                    style={{ width: column.width }}
                    onClick={() => isSortable && handleSort(column.key)}
                    role="columnheader"
                    scope="col"
                    aria-sort={isCurrentSort ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                    tabIndex={isSortable ? 0 : -1}
                    onKeyDown={(e) => {
                      if (isSortable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleSort(column.key);
                      }
                    }}
                    aria-label={`${column.title}${isSortable ? ', clique para ordenar' : ''}`}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.title}</span>
                      {isSortable && (
                        <div className="flex flex-col" aria-hidden="true">
                          <ChevronUp 
                            className={`w-3 h-3 ${
                              isCurrentSort && sortConfig.direction === 'asc'
                                ? 'text-primary'
                                : 'text-text-muted'
                            }`}
                          />
                          <ChevronDown 
                            className={`w-3 h-3 -mt-1 ${
                              isCurrentSort && sortConfig.direction === 'desc'
                                ? 'text-primary'
                                : 'text-text-muted'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
              
              {actions && actions.length > 0 && (
                <th className={`${paddingClasses[size]} text-right`}>
                  Ações
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-border">
            {processedData.length === 0 ? (
              <tr role="row">
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                  className="px-4 py-8 text-center text-text-muted"
                  role="cell"
                  aria-label="Nenhum resultado encontrado"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              processedData.map((record, index) => {
                const rowProps = onRow?.(record, index) || {};
                const key = getRowKey(record, index);
                const isSelected = selectedRows.includes(key);
                
                return (
                  <tr
                    key={key}
                    className={`
                      hover:bg-surface-hover transition-colors
                      ${isSelected ? 'bg-primary/10' : ''}
                      ${rowProps.className || ''}
                    `}
                    onClick={rowProps.onClick}
                    onDoubleClick={rowProps.onDoubleClick}
                    role="row"
                    aria-selected={selectable ? isSelected : undefined}
                    aria-rowindex={index + 2}
                  >
                    {selectable && (
                      <td className={paddingClasses[size]} role="cell">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(record, index, e.target.checked)}
                          className="rounded border-border text-primary focus:ring-focus-ring"
                          aria-label={`Selecionar linha ${index + 1}`}
                          aria-describedby={`row-${index}-description`}
                        />
                        <div id={`row-${index}-description`} className="sr-only">
                          Linha {index + 1} da tabela
                        </div>
                      </td>
                    )}
                    
                    {columns.map((column) => {
                      const value = column.dataIndex ? record[column.dataIndex] : record;
                      const content = column.render ? column.render(value, record, index) : String(value || '');
                      
                      return (
                        <td
                          key={column.key}
                          className={`
                            ${paddingClasses[size]} ${sizeClasses[size]}
                            text-text-primary
                            ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                          `}
                          role="cell"
                          aria-label={`${column.title}: ${typeof content === 'string' ? content : 'conteúdo personalizado'}`}
                        >
                          {content}
                        </td>
                      );
                    })}
                    
                    {actions && actions.length > 0 && (
                      <td className={`${paddingClasses[size]} text-right`} role="cell">
                        <div className="flex items-center justify-end space-x-2" role="group" aria-label="Ações da linha">
                          {actions.map((action) => {
                            const isDisabled = action.disabled?.(record) || false;
                            
                            return (
                              <button
                                key={action.key}
                                onClick={() => !isDisabled && action.onClick(record)}
                                disabled={isDisabled}
                                className={`
                                  p-1 rounded hover:bg-surface-hover focus:bg-surface-hover focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background transition-colors
                                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                  ${
                                    action.variant === 'danger'
                                      ? 'text-destructive hover:text-destructive/80'
                                      : action.variant === 'primary'
                                      ? 'text-primary hover:text-primary/80'
                                      : 'text-text-muted hover:text-text-primary'
                                  }
                                `}
                                title={action.label}
                                aria-label={`${action.label} - linha ${index + 1}`}
                                aria-describedby={`action-${action.key}-${index}-help`}
                              >
                                <span aria-hidden="true">{action.icon}</span>
                                <div id={`action-${action.key}-${index}-help`} className="sr-only">
                                  {action.label} para o item da linha {index + 1}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <nav className="px-4 py-3 border-t border-border" aria-label="Navegação da tabela">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-primary" aria-live="polite" aria-atomic="true">
              Mostrando {((pagination.current - 1) * pagination.pageSize) + 1} a{' '}
              {Math.min(pagination.current * pagination.pageSize, pagination.total)} de{' '}
              {pagination.total} resultados
            </div>
            
            <div className="flex items-center space-x-2" role="group" aria-label="Controles de paginação">
              <button
                onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
                disabled={pagination.current <= 1}
                className="p-2 rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover focus:ring-2 focus:ring-focus-ring focus:border-transparent focus:ring-offset-2 focus:ring-offset-background"
                aria-label="Página anterior"
                title="Ir para página anterior"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              
              <span className="px-3 py-1 text-sm" aria-label={`Página ${pagination.current} de ${Math.ceil(pagination.total / pagination.pageSize)}`}>
                {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              
              <button
                onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                className="p-2 rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover focus:ring-2 focus:ring-focus-ring focus:border-transparent focus:ring-offset-2 focus:ring-offset-background"
                aria-label="Próxima página"
                title="Ir para próxima página"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}

// Common table actions
export const commonTableActions = {
  view: (onClick: (record: any) => void): TableAction => ({
    key: 'view',
    label: 'Visualizar',
    icon: <Eye className="w-4 h-4" />,
    onClick
  }),
  
  edit: (onClick: (record: any) => void): TableAction => ({
    key: 'edit',
    label: 'Editar',
    icon: <Edit className="w-4 h-4" />,
    onClick,
    variant: 'primary'
  }),
  
  delete: (onClick: (record: any) => void): TableAction => ({
    key: 'delete',
    label: 'Excluir',
    icon: <Trash2 className="w-4 h-4" />,
    onClick,
    variant: 'danger'
  })
};

// Hook para gerenciar estado da tabela
export function useTable<T>({ data, columns, pageSize = 10, sortable = true, filterable = true }: {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  sortable?: boolean;
  filterable?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize,
    total: data.length
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
  };

  const handleSelectionChange = (keys: string[], rows: T[]) => {
    setSelectedRowKeys(keys);
  };

  const refresh = () => {
    // Implementar lógica de refresh
  };

  return {
    data,
    setData,
    loading,
    setLoading,
    pagination,
    setPagination,
    selectedRowKeys,
    setSelectedRowKeys,
    handlePaginationChange,
    handleSelectionChange,
    refresh
  };
}