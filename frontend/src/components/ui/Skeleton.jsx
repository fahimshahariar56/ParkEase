import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Skeleton — loading placeholder
 * Skeleton / CardSkeleton / Spinner — all backward-compatible.
 */
export const Skeleton = ({
  className = '',
  width,
  height,
  rounded = 'rounded-sm',
  ...props
}) => (
  <div
    className={`bg-surface-raised animate-pulse border border-border/30 ${rounded} ${className}`}
    style={{ width, height }}
    aria-hidden="true"
    {...props}
  />
);

export const CardSkeleton = ({ count = 1 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="park-card p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-5 w-14 rounded-pill" />
        </div>
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
        <div className="pt-1 flex gap-2.5">
          <Skeleton className="h-9 w-24 rounded-btn" />
          <Skeleton className="h-9 w-20 rounded-btn" />
        </div>
      </div>
    ))}
  </div>
);

export const Spinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };
  return (
    <div
      role="status"
      aria-label={text}
      className="flex flex-col items-center justify-center p-8 gap-3 text-text-muted"
    >
      <Loader2
        className={`${sizes[size] ?? sizes.md} animate-spin text-text-muted`}
        aria-hidden="true"
      />
      {text && <span className="text-xs font-medium tracking-wide">{text}</span>}
    </div>
  );
};
