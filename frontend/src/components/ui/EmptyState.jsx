import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

/**
 * EmptyState — no-data placeholder (DESIGN.md §7)
 * Monochrome icon container, neutral colors, optional CTA.
 * API is backward-compatible.
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is currently no data available for this view.',
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) => (
  <div
    className={[
      'flex flex-col items-center justify-center p-8 md:p-12 text-center',
      'park-card font-sans',
      className,
    ].join(' ')}
  >
    {/* Icon container — neutral, no brand color */}
    <div className="w-10 h-10 rounded-sm bg-surface-raised border border-border flex items-center justify-center text-text-muted mb-4">
      <Icon className="w-5 h-5" aria-hidden="true" />
    </div>

    <h3 className="font-semibold text-sm md:text-base text-text tracking-tight mb-1">
      {title}
    </h3>
    <p className="text-xs md:text-sm text-text-muted max-w-xs mb-6 leading-relaxed">
      {description}
    </p>

    {actionLabel && onAction && (
      <Button variant="secondary" size="sm" icon={actionIcon} onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);
