import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is currently no data available for this view.',
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center font-mono park-card ${className}`}>
      <div className="w-12 h-12 rounded-full bg-surface-raised border border-border flex items-center justify-center text-text-muted mb-4 shadow-subtle">
        <Icon className="w-6 h-6 text-brand/80" />
      </div>
      <h3 className="font-bold text-base md:text-lg text-text tracking-tight mb-1">{title}</h3>
      <p className="text-xs md:text-sm text-text-muted max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="sm"
          icon={actionIcon}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
