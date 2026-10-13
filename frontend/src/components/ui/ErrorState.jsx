import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this content. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-6 rounded-card bg-surface border border-status-occupied/30 font-mono text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-10 h-10 rounded-full bg-status-occupied/15 text-status-occupied border border-status-occupied/30 flex items-center justify-center mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="font-bold text-sm md:text-base text-text mb-1">{title}</h3>
      <p className="text-xs text-text-muted max-w-sm mb-5">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
