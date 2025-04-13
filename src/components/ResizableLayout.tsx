
import React, { useEffect, useRef } from 'react';
import Split from 'split.js';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResizableLayoutProps {
  children: React.ReactNode[];
  direction?: 'horizontal' | 'vertical';
  sizes?: number[];
  minSize?: number;
  gutterSize?: number;
  className?: string;
}

const ResizableLayout: React.FC<ResizableLayoutProps> = ({
  children,
  direction = 'horizontal',
  sizes = [50, 50],
  minSize = 100,
  gutterSize = 10,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Fix type error by casting elements to HTMLElement[]
    const elements = Array.from(containerRef.current.children)
      .filter(el => !el.classList.contains('gutter'))
      .map(el => el as HTMLElement);
    
    const split = Split(elements, {
      sizes,
      minSize,
      gutterSize,
      direction,
      elementStyle: (dimension, size) => ({
        'flex-basis': `calc(${size}% - ${gutterSize / 2}px)`,
      }),
      gutterStyle: () => ({
        'flex-basis': `${gutterSize}px`,
      }),
    });
    
    return () => {
      split.destroy();
    };
  }, [direction, isMobile, sizes, minSize, gutterSize]);

  const layoutDirection = isMobile
    ? 'flex-col'
    : direction === 'horizontal'
      ? 'flex-row'
      : 'flex-col';
  return (
    <div
      ref={containerRef}
      className={`flex ${layoutDirection} h-full w-full flex-grow ${className}`}
    >
      {children}
    </div>
  );
};

export default ResizableLayout;
