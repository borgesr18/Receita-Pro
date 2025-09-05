'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-surface-hover';
  
  const variantClasses = {
    text: 'rounded-sm',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  };
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };
  
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  
  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      aria-hidden="true"
    />
  );
};

// Skeleton variants for common use cases
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className 
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        height={16}
        width={i === lines - 1 ? '75%' : '100%'}
      />
    ))}
  </div>
);

export const SkeletonAvatar: React.FC<{ size?: number; className?: string }> = ({ 
  size = 40, 
  className 
}) => (
  <Skeleton
    variant="circular"
    width={size}
    height={size}
    className={className}
  />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-4 border border-border rounded-lg bg-background', className)}>
    <div className="flex items-center space-x-3 mb-4">
      <SkeletonAvatar size={32} />
      <div className="flex-1">
        <Skeleton variant="text" height={16} width="60%" className="mb-2" />
        <Skeleton variant="text" height={12} width="40%" />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

export const SkeletonTable: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string;
}> = ({ 
  rows = 5, 
  columns = 4, 
  className 
}) => (
  <div className={cn('w-full', className)}>
    {/* Header */}
    <div className="flex space-x-4 p-4 border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" height={16} width="100%" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 p-4 border-b border-border">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={colIndex} 
            variant="text" 
            height={14} 
            width={colIndex === 0 ? '30%' : '100%'} 
          />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonList: React.FC<{ 
  items?: number; 
  showAvatar?: boolean;
  className?: string;
}> = ({ 
  items = 5, 
  showAvatar = true, 
  className 
}) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3">
        {showAvatar && <SkeletonAvatar size={32} />}
        <div className="flex-1">
          <Skeleton variant="text" height={16} width="70%" className="mb-2" />
          <Skeleton variant="text" height={12} width="50%" />
        </div>
      </div>
    ))}
  </div>
);

// Loading states for specific components
export const SkeletonButton: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-28'
  };
  
  return (
    <Skeleton
      variant="rounded"
      className={cn(sizeClasses[size], className)}
    />
  );
};

export const SkeletonInput: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton
    variant="rounded"
    height={40}
    className={cn('w-full', className)}
  />
);

export const SkeletonChart: React.FC<{ 
  height?: number;
  className?: string;
}> = ({ 
  height = 200, 
  className 
}) => (
  <div className={cn('w-full', className)}>
    <Skeleton variant="rounded" height={height} />
  </div>
);

// Shimmer animation keyframes (add to your CSS)
/*
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}
*/