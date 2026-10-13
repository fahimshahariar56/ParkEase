import React from 'react';

export const Badge = ({
  children,
  variant = 'available',
  size = 'md',
  showDot = true,
  icon: Icon,
  className = '',
}) => {
  const variants = {
    available: {
      badge: 'bg-status-available/15 text-status-available border-status-available/30',
      dot: 'bg-status-available',
    },
    pending: {
      badge: 'bg-status-pending/15 text-status-pending border-status-pending/30',
      dot: 'bg-status-pending',
    },
    occupied: {
      badge: 'bg-status-occupied/15 text-status-occupied border-status-occupied/30',
      dot: 'bg-status-occupied',
    },
    maintenance: {
      badge: 'bg-status-maintenance/15 text-status-maintenance border-status-maintenance/30',
      dot: 'bg-status-maintenance',
    },
    info: {
      badge: 'bg-status-info/15 text-status-info border-status-info/30',
      dot: 'bg-status-info',
    },
    brand: {
      badge: 'bg-brand/15 text-brand border-brand/30',
      dot: 'bg-brand',
    },
    neutral: {
      badge: 'bg-surface-raised text-text-muted border-border',
      dot: 'bg-text-muted',
    },
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const currentVariant = variants[variant] || variants.available;

  return (
    <span
      className={`
        inline-flex items-center font-mono font-medium rounded-pill border
        select-none whitespace-nowrap
        ${currentVariant.badge}
        ${sizes[size] || sizes.md}
        ${className}
      `}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${currentVariant.dot}`}
          aria-hidden="true"
        />
      )}
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
      <span>{children}</span>
    </span>
  );
};
