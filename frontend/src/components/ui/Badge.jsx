import React from 'react';

/**
 * Badge — status pill (DESIGN.md §5: pills permitted for status badges)
 * All variants use semantic status colors, not brand green.
 * API is backward-compatible.
 */
export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  showDot = true,
  icon: Icon,
  className = '',
}) => {
  // Each variant: purely semantic — color communicates status, always paired with label text
  const variants = {
    available: {
      badge: 'bg-status-available/10 text-status-available border-status-available/25',
      dot:   'bg-status-available',
    },
    confirmed: {
      badge: 'bg-status-confirmed/10 text-status-confirmed border-status-confirmed/25',
      dot:   'bg-status-confirmed',
    },
    pending: {
      badge: 'bg-status-pending/10 text-status-pending border-status-pending/25',
      dot:   'bg-status-pending',
    },
    occupied: {
      badge: 'bg-status-occupied/10 text-status-occupied border-status-occupied/25',
      dot:   'bg-status-occupied',
    },
    cancelled: {
      badge: 'bg-status-cancelled/10 text-status-cancelled border-status-cancelled/25',
      dot:   'bg-status-cancelled',
    },
    maintenance: {
      badge: 'bg-status-maintenance/10 text-status-maintenance border-status-maintenance/25',
      dot:   'bg-status-maintenance',
    },
    info: {
      badge: 'bg-status-info/10 text-status-info border-status-info/25',
      dot:   'bg-status-info',
    },
    // Neutral: monochrome default
    neutral: {
      badge: 'bg-surface-raised text-text-muted border-border',
      dot:   'bg-text-muted',
    },
    // High-contrast inverted badge (e.g., active session)
    inverted: {
      badge: 'bg-text text-bg border-text',
      dot:   'bg-bg',
    },
    // Backward-compat brand alias: monochrome high-contrast raised
    brand: {
      badge: 'bg-surface-raised text-text border-border',
      dot:   'bg-text',
    },
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-[11px] px-2 py-0.5 gap-1.5',
    lg: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-1.5 h-1.5',
  };

  const cv = variants[variant] ?? variants.neutral;

  return (
    <span
      className={[
        'inline-flex items-center font-sans font-medium rounded-pill border',
        'select-none whitespace-nowrap',
        cv.badge,
        sizes[size] ?? sizes.md,
        className,
      ].join(' ')}
    >
      {showDot && !Icon && (
        <span
          className={`${dotSizes[size] ?? dotSizes.md} rounded-full flex-shrink-0 ${cv.dot}`}
          aria-hidden="true"
        />
      )}
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
};
