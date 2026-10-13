import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

/**
 * Button — rectangular premium system (DESIGN.md §5)
 * Variants: primary | secondary | outline | ghost | danger | icon
 * Sizes: sm | md | lg
 *
 * API is backward-compatible with the previous Button component.
 */
export const Button = React.forwardRef((
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    className = '',
    type = 'button',
    onClick,
    ...props
  },
  ref,
) => {
  // Base: rectangular shape, Inter font, smooth transitions, no layout shift on hover
  const base = [
    'inline-flex items-center justify-center gap-2',
    'font-sans font-medium tracking-tight',
    'rounded-btn border',
    'transition-all duration-150 ease-in-out',
    'select-none cursor-pointer',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
    'whitespace-nowrap',
  ].join(' ');

  // Variant map — monochrome first, status accent only for danger
  const variants = {
    // High-contrast solid: white on black (dark) / black on white (light)
    primary: [
      'bg-text text-bg border-text',
      'hover:bg-text/90 hover:border-text/90',
      'active:bg-text/80',
      'focus-visible:outline-text',
    ].join(' '),

    // Tonal surface: raised background with visible border
    secondary: [
      'bg-surface-raised text-text border-border',
      'hover:bg-surface-raised hover:border-text/20',
      'active:bg-surface',
      'focus-visible:outline-text',
    ].join(' '),

    // Outline only: transparent bg, text-color border
    outline: [
      'bg-transparent text-text border-border',
      'hover:border-text/50 hover:bg-surface-raised',
      'active:bg-surface',
      'focus-visible:outline-text',
    ].join(' '),

    // Ghost: no border, no background until hover
    ghost: [
      'bg-transparent text-text border-transparent',
      'hover:bg-surface-raised hover:border-border',
      'active:bg-surface',
      'focus-visible:outline-text',
    ].join(' '),

    // Danger: semantic red, retained for destructive actions
    danger: [
      'bg-status-occupied text-white border-status-occupied',
      'hover:bg-red-700 hover:border-red-700',
      'active:bg-red-800',
      'focus-visible:outline-status-occupied',
    ].join(' '),
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
    md: 'text-sm px-4 py-2 h-9',
    lg: 'text-sm px-5 py-2.5 h-10',
  };

  const iconSizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-4 h-4' };

  const isDisabled = disabled || isLoading;
  const iconCls = iconSizes[size] ?? iconSizes.md;

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      // Subtle press response — no scale-up on hover (prevents layout shift)
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.1 }}
      className={[
        base,
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className={`${iconCls} animate-spin flex-shrink-0`} aria-hidden="true" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={`${iconCls} flex-shrink-0`} aria-hidden="true" />
          )}
          {children && <span>{children}</span>}
          {Icon && iconPosition === 'right' && (
            <Icon className={`${iconCls} flex-shrink-0`} aria-hidden="true" />
          )}
        </>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';
