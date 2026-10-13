import React from 'react';
import { motion } from 'motion/react';

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
  const isInteractive = variant === 'interactive' || Boolean(onClick);

  const baseStyles = 'rounded-card border transition-all duration-150 font-mono';
  
  const variants = {
    default: 'bg-surface border-border shadow-subtle',
    raised: 'bg-surface-raised border-border shadow-raised',
    interactive: 'bg-surface border-border hover:border-brand/50 hover:shadow-raised cursor-pointer active:scale-[0.99]',
  };

  const Component = isInteractive ? motion.div : 'div';
  const motionProps = isInteractive ? {
    whileHover: { y: -2 },
    transition: { duration: 0.15 }
  } : {};

  return (
    <Component
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.default} ${className}`}
      {...motionProps}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between gap-4 p-5 md:p-6 border-b border-border/60">
          <div>
            {title && <h3 className="font-bold text-base md:text-lg text-text tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </div>
      )}

      <div className="p-5 md:p-6">
        {children}
      </div>

      {footer && (
        <div className="p-4 md:px-6 md:py-4 border-t border-border/60 bg-surface-subtle/40 rounded-b-card">
          {footer}
        </div>
      )}
    </Component>
  );
};
