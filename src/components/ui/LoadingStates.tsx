'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

// Loading Spinner Component
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'secondary' | 'white' | 'gray';
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  color = 'primary' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400'
  };

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
}

// Loading Button Component
export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingButton({ 
  loading = false,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props 
}: LoadingButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    outline: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-primary-500',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-primary-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${(loading || disabled) ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <LoadingSpinner 
          size={size === 'lg' ? 'md' : 'sm'} 
          color="white" 
          className="mr-2" 
        />
      )}
      {children}
    </button>
  );
}

// Skeleton Components
export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
  className = '', 
  width,
  height,
  rounded = false,
  animation = 'pulse'
}: SkeletonProps) {
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: ''
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`
        bg-gray-200 dark:bg-gray-700
        ${rounded ? 'rounded-full' : 'rounded'}
        ${animationClasses[animation]}
        ${className}
      `}
      style={style}
    />
  );
}

// Skeleton Text Lines
export interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}

export function SkeletonText({ 
  lines = 3, 
  className = '',
  lastLineWidth = '75%'
}: SkeletonTextProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={16}
          width={index === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
}

// Card Skeleton
export interface SkeletonCardProps {
  className?: string;
  showAvatar?: boolean;
  showImage?: boolean;
  lines?: number;
}

export function SkeletonCard({ 
  className = '',
  showAvatar = false,
  showImage = false,
  lines = 3
}: SkeletonCardProps) {
  return (
    <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      {showImage && (
        <Skeleton height={200} className="mb-4" />
      )}
      
      <div className="space-y-3">
        {showAvatar && (
          <div className="flex items-center space-x-3">
            <Skeleton width={40} height={40} rounded />
            <div className="flex-1">
              <Skeleton height={16} width="60%" className="mb-1" />
              <Skeleton height={14} width="40%" />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Skeleton height={20} width="80%" />
          <SkeletonText lines={lines} />
        </div>
        
        <div className="flex space-x-2 pt-2">
          <Skeleton height={32} width={80} />
          <Skeleton height={32} width={80} />
        </div>
      </div>
    </div>
  );
}

// Table Skeleton
export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
  showHeader?: boolean;
}

export function SkeletonTable({ 
  rows = 5,
  columns = 4,
  className = '',
  showHeader = true
}: SkeletonTableProps) {
  return (
    <div className={`overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      <table className="w-full">
        {showHeader && (
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-4 py-3">
                  <Skeleton height={16} width="80%" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <Skeleton 
                    height={16} 
                    width={colIndex === 0 ? '90%' : Math.random() > 0.5 ? '70%' : '50%'} 
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Page Loading Component
export interface PageLoadingProps {
  message?: string;
  className?: string;
}

export function PageLoading({ 
  message = 'Carregando...',
  className = ''
}: PageLoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] ${className}`}>
      <LoadingSpinner size="xl" className="mb-4" />
      <p className="text-gray-600 dark:text-gray-400 text-lg">{message}</p>
    </div>
  );
}

// Inline Loading Component
export interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InlineLoading({ 
  message = 'Carregando...',
  size = 'md',
  className = ''
}: InlineLoadingProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LoadingSpinner size={size} />
      <span className="text-gray-600 dark:text-gray-400">{message}</span>
    </div>
  );
}

// Loading Overlay Component
export interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
  backdrop?: boolean;
}

export function LoadingOverlay({ 
  isVisible,
  message = 'Carregando...',
  className = '',
  backdrop = true
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center
      ${backdrop ? 'bg-black bg-opacity-50' : ''}
      ${className}
    `}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-700 dark:text-gray-300 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Progress Bar Component
export interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ 
  value,
  className = '',
  showLabel = false,
  color = 'primary',
  size = 'md'
}: ProgressBarProps) {
  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600'
  };

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Progresso</span>
          <span>{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}

// Hook para gerenciar estados de loading
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [error, setError] = React.useState<string | null>(null);

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const setLoadingError = (errorMessage: string) => {
    setIsLoading(false);
    setError(errorMessage);
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
  };

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    reset
  };
}