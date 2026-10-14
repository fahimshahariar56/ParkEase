import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Card — rectangular panel (DESIGN.md §5)
 * Variants: default | raised | interactive
 * API is backward-compatible.
 */
export const Card = ({
  children,
  variant = 'default',
  title,
  subtitle,
  headerAction,
  footer,
  className = '',
  onClick,
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();
  const isInteractive = variant === 'interactive' || Boolean(onClick);

  const base = 'rounded-card border font-sans overflow-hidden';

  const variants = {
    default:     'bg-surface border-border shadow-subtle',
    raised:      'bg-surface-raised border-border shadow-raised',
    // Interactive: neutral hover — no green border
    interactive: 'bg-surface border-border shadow-subtle hover:border-text/20 hover:shadow-raised cursor-pointer transition-all duration-150',
  };

  const Component = isInteractive ? motion.div : 'div';
  const motionProps = isInteractive
    ? {
      whileTap: prefersReducedMotion ? undefined : { scale: 0.995 },
      transition: { duration: prefersReducedMotion ? 0 : 0.15 },
    }
    : {};

  return (
    <Component
      onClick={onClick}
      className={`${base} ${variants[variant] ?? variants.default} ${className}`}
      {...motionProps}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
          <div className="min-w-0">
            {title && (
              <h3 className="font-semibold text-sm md:text-base text-text tracking-tight truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAction && (
            <div className="flex-shrink-0">{headerAction}</div>
          )}
        </div>
      )}

      <div className="p-5 md:p-6">{children}</div>

      {footer && (
        <div className="px-5 py-3 md:px-6 border-t border-border bg-surface-subtle/60">
          {footer}
        </div>
      )}
    </Component>
  );
};
