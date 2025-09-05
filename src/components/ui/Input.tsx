'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outline';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    variant = 'outline',
    inputSize = 'md',
    fullWidth = true,
    disabled,
    required,
    id,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    const baseStyles = [
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-gray-400 dark:placeholder:text-gray-500'
    ].join(' ');

    const variants = {
      default: [
        'border-0 border-b-2 border-gray-200 bg-transparent',
        'focus:border-blue-500 focus:ring-0',
        'dark:border-gray-700 dark:focus:border-blue-400'
      ].join(' '),
      
      filled: [
        'border border-transparent bg-gray-100 rounded-lg',
        'focus:bg-white focus:border-blue-500 focus:ring-blue-500/20',
        'dark:bg-gray-800 dark:focus:bg-gray-700 dark:focus:border-blue-400'
      ].join(' '),
      
      outline: [
        'border border-gray-300 bg-white rounded-lg',
        'focus:border-blue-500 focus:ring-blue-500/20',
        'dark:border-gray-600 dark:bg-gray-800 dark:focus:border-blue-400'
      ].join(' ')
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-4 py-3 text-base'
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-5 h-5'
    };

    const errorStyles = hasError ? [
      'border-red-300 focus:border-red-500 focus:ring-red-500/20',
      'dark:border-red-500 dark:focus:border-red-400'
    ].join(' ') : '';

    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium',
              hasError ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className={cn(
              'absolute left-3 top-1/2 transform -translate-y-1/2',
              'text-gray-400 dark:text-gray-500',
              iconSizes[inputSize]
            )}>
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            id={inputId}
            className={cn(
              baseStyles,
              variants[variant],
              sizes[inputSize],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              errorStyles,
              fullWidth && 'w-full',
              className
            )}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : 
              helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          
          {rightIcon && (
            <div className={cn(
              'absolute right-3 top-1/2 transform -translate-y-1/2',
              'text-gray-400 dark:text-gray-500',
              iconSizes[inputSize]
            )}>
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p 
            id={`${inputId}-error`}
            className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p 
            id={`${inputId}-helper`}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };