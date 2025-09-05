'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    ...props
  }, ref) => {
    const baseStyles = [
      'inline-flex items-center justify-center',
      'font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'relative overflow-hidden'
    ].join(' ');

    const variants = {
      primary: [
        'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
        'text-white border border-transparent',
        'focus:ring-blue-500 shadow-sm hover:shadow-md'
      ].join(' '),
      
      secondary: [
        'bg-gray-100 hover:bg-gray-200 active:bg-gray-300',
        'text-gray-900 border border-gray-300',
        'focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600',
        'dark:text-gray-100 dark:border-gray-600'
      ].join(' '),
      
      outline: [
        'bg-transparent hover:bg-gray-50 active:bg-gray-100',
        'text-gray-700 border border-gray-300',
        'focus:ring-gray-500 dark:hover:bg-gray-800',
        'dark:text-gray-300 dark:border-gray-600'
      ].join(' '),
      
      ghost: [
        'bg-transparent hover:bg-gray-100 active:bg-gray-200',
        'text-gray-700 border border-transparent',
        'focus:ring-gray-500 dark:hover:bg-gray-800',
        'dark:text-gray-300'
      ].join(' '),
      
      danger: [
        'bg-red-600 hover:bg-red-700 active:bg-red-800',
        'text-white border border-transparent',
        'focus:ring-red-500 shadow-sm hover:shadow-md'
      ].join(' '),
      
      success: [
        'bg-green-600 hover:bg-green-700 active:bg-green-800',
        'text-white border border-transparent',
        'focus:ring-green-500 shadow-sm hover:shadow-md'
      ].join(' ')
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
      md: 'px-4 py-2 text-sm rounded-lg gap-2',
      lg: 'px-6 py-3 text-base rounded-lg gap-2',
      xl: 'px-8 py-4 text-lg rounded-xl gap-3'
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
      xl: 'w-6 h-6'
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          loading && 'cursor-wait',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <div className={cn(
              'animate-spin rounded-full border-2 border-current border-t-transparent',
              iconSizes[size]
            )} />
          </div>
        )}
        
        <div className={cn(
          'flex items-center gap-inherit',
          loading && 'opacity-0'
        )}>
          {leftIcon && (
            <span className={cn('flex-shrink-0', iconSizes[size])}>
              {leftIcon}
            </span>
          )}
          
          {children && <span>{children}</span>}
          
          {rightIcon && (
            <span className={cn('flex-shrink-0', iconSizes[size])}>
              {rightIcon}
            </span>
          )}
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };