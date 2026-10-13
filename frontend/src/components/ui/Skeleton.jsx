import React from 'react';
import { Loader2 } from 'lucide-react';

export const Skeleton = ({
  className = '',
  width,
  height,
  rounded = 'rounded-input',
  ...props
}) => {
  return (
    <div
      className={`bg-surface-raised animate-pulse border border-border/40 ${rounded} ${className}`}
      style={{
        width: width,
        height: height,
      }}
      aria-hidden="true"
      {...props}
    />
  );
};

export const CardSkeleton = ({ count = 1 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="park-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-16 rounded-pill" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="pt-2 flex gap-3">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const Spinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 font-mono text-text-muted">
      <Loader2 className={`${sizes[size] || sizes.md} animate-spin text-brand`} />
      {text && <span className="text-xs font-medium tracking-wide">{text}</span>}
    </div>
  );
};
