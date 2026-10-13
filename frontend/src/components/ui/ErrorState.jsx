import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

/**
 * ErrorState — error boundary / fetch failure display (DESIGN.md §7)
 * Semantic red for error, neutral surroundings.
 * API is backward-compatible.
 */
export const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this content. Please try again.',
  onRetry,
  className = '',
}) => (
  <div
    role="alert"
    className={[
      'p-6 rounded-card font-sans text-center flex flex-col items-center justify-center',
      'bg-surface border border-status-occupied/20',
      className,
    ].join(' ')}
  >
    {/* Error icon — semantic red only */}
    <div className="w-9 h-9 rounded-sm bg-status-occupied/8 border border-status-occupied/20 flex items-center justify-center mb-3">
      <AlertCircle className="w-4.5 h-4.5 text-status-occupied" aria-hidden="true" />
    </div>

    <h3 className="font-semibold text-sm text-text mb-1 tracking-tight">{title}</h3>
    <p className="text-xs text-text-muted max-w-xs mb-5 leading-relaxed">{message}</p>

    {onRetry && (
      <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
        Try Again
      </Button>
    )}
  </div>
);
