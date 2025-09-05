'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

// Types
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((index: number, item: T) => number);
  containerHeight: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  overscan?: number; // Number of items to render outside visible area
  className?: string;
  onScroll?: (scrollTop: number) => void;
  scrollToIndex?: number;
  getItemKey?: (item: T, index: number) => string | number;
}

interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  gap?: number;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  getItemKey?: (item: T, index: number) => string | number;
}

// Virtual List Component
export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
  onScroll,
  scrollToIndex,
  getItemKey
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  // const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate item heights
  const getItemHeight = useCallback((index: number): number => {
    if (typeof itemHeight === 'function') {
      return itemHeight(index, items[index]);
    }
    return itemHeight;
  }, [itemHeight, items]);

  // Calculate total height and item positions
  const { totalHeight, itemPositions } = useMemo(() => {
    let height = 0;
    const positions: number[] = [];
    
    for (let i = 0; i < items.length; i++) {
      positions[i] = height;
      height += getItemHeight(i);
    }
    
    return {
      totalHeight: height,
      itemPositions: positions
    };
  }, [items.length, getItemHeight]);

  // Find visible range
  const visibleRange = useMemo(() => {
    if (items.length === 0) {
      return { start: 0, end: 0 };
    }

    let start = 0;
    let end = items.length - 1;

    // Binary search for start index
    let low = 0;
    let high = items.length - 1;
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const itemTop = itemPositions[mid];
      const itemBottom = itemTop + getItemHeight(mid);
      
      if (itemBottom <= scrollTop) {
        low = mid + 1;
      } else if (itemTop > scrollTop + containerHeight) {
        high = mid - 1;
      } else {
        start = mid;
        break;
      }
    }

    // Find end index
    for (let i = start; i < items.length; i++) {
      const itemTop = itemPositions[i];
      if (itemTop >= scrollTop + containerHeight) {
        end = i - 1;
        break;
      }
    }

    // Apply overscan
    start = Math.max(0, start - overscan);
    end = Math.min(items.length - 1, end + overscan);

    return { start, end };
  }, [scrollTop, containerHeight, items.length, itemPositions, getItemHeight, overscan]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Scroll to specific index
  useEffect(() => {
    if (scrollToIndex !== undefined && scrollElementRef.current) {
      const targetPosition = itemPositions[scrollToIndex];
      scrollElementRef.current.scrollTop = targetPosition;
    }
  }, [scrollToIndex, itemPositions]);

  // Render visible items
  const visibleItems = [];
  for (let i = visibleRange.start; i <= visibleRange.end; i++) {
    const item = items[i];
    const top = itemPositions[i];
    const height = getItemHeight(i);
    
    const style: React.CSSProperties = {
      position: 'absolute',
      top,
      left: 0,
      right: 0,
      height,
      zIndex: 1
    };

    const key = getItemKey ? getItemKey(item, i) : i;
    
    visibleItems.push(
      <div key={key} style={style}>
        {renderItem(item, i, style)}
      </div>
    );
  }

  return (
    <div
      ref={scrollElementRef}
      className={cn(
        'relative overflow-auto',
        className
      )}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      role="list"
      aria-label="Lista virtual"
    >
      {/* Total height spacer */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
}

// Virtual Grid Component
export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  gap = 0,
  overscan = 5,
  className,
  onScroll,
  getItemKey
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate grid dimensions
  const columnsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const totalRows = Math.ceil(items.length / columnsPerRow);
  const totalHeight = totalRows * (itemHeight + gap) - gap;

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startRow = Math.floor(scrollTop / (itemHeight + gap));
    const endRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + containerHeight) / (itemHeight + gap))
    );

    const startIndex = Math.max(0, (startRow - overscan) * columnsPerRow);
    const endIndex = Math.min(
      items.length - 1,
      (endRow + overscan + 1) * columnsPerRow - 1
    );

    return { startIndex, endIndex, startRow: startRow - overscan, endRow: endRow + overscan };
  }, [scrollTop, containerHeight, itemHeight, gap, totalRows, columnsPerRow, items.length, overscan]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    const newScrollLeft = e.currentTarget.scrollLeft;
    setScrollTop(newScrollTop);
    setScrollLeft(newScrollLeft);
    onScroll?.(newScrollTop, newScrollLeft);
  }, [onScroll]);

  // Render visible items
  const visibleItems = [];
  for (let i = visibleRange.startIndex; i <= visibleRange.endIndex && i < items.length; i++) {
    const item = items[i];
    const row = Math.floor(i / columnsPerRow);
    const col = i % columnsPerRow;
    
    const left = col * (itemWidth + gap);
    const top = row * (itemHeight + gap);
    
    const style: React.CSSProperties = {
      position: 'absolute',
      left,
      top,
      width: itemWidth,
      height: itemHeight,
      zIndex: 1
    };

    const key = getItemKey ? getItemKey(item, i) : i;
    
    visibleItems.push(
      <div key={key} style={style}>
        {renderItem(item, i, style)}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-auto',
        className
      )}
      style={{ 
        height: containerHeight,
        width: containerWidth
      }}
      onScroll={handleScroll}
      role="grid"
      aria-label="Grade virtual"
    >
      {/* Total height spacer */}
      <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
}

// Hook for virtual scrolling
export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const totalHeight = items.length * itemHeight;
  
  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2);
    
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);
  
  const visibleItems = items.slice(visibleRange.start, visibleRange.end + 1);
  
  const offsetY = visibleRange.start * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    scrollTop,
    setScrollTop,
    visibleRange
  };
}

// Virtual Table Row Component
export function VirtualTableRow<T>({
  items,
  rowHeight = 50,
  containerHeight,
  renderRow,
  className,
  headerHeight = 40,
  renderHeader,
  onScroll,
  getRowKey
}: {
  items: T[];
  rowHeight?: number;
  containerHeight: number;
  renderRow: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  className?: string;
  headerHeight?: number;
  renderHeader?: () => React.ReactNode;
  onScroll?: (scrollTop: number) => void;
  getRowKey?: (item: T, index: number) => string | number;
}) {
  const availableHeight = containerHeight - (renderHeader ? headerHeight : 0);
  
  return (
    <div className={cn('flex flex-col', className)}>
      {renderHeader && (
        <div 
          style={{ height: headerHeight }}
          className="sticky top-0 z-10 bg-background border-b"
        >
          {renderHeader()}
        </div>
      )}
      
      <VirtualList
        items={items}
        itemHeight={rowHeight}
        containerHeight={availableHeight}
        renderItem={renderRow}
        getItemKey={getRowKey}
        onScroll={onScroll}
      />
    </div>
  );
}