import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * ThemeToggle — animated sun/moon switch (DESIGN.md §13)
 * Neutral monochrome styling — no brand/green color.
 * Motion for React handles icon transition.
 */
export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const isDark = theme === 'dark';

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      className={[
        'relative w-8 h-8 flex items-center justify-center',
        'rounded-btn border border-border bg-surface-raised',
        'text-text-muted hover:text-text hover:border-text/20 hover:bg-surface-raised',
        'transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      ].join(' ')}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={theme}
          initial={prefersReducedMotion ? false : { rotate: -15, opacity: 0, scale: 0.85 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 1 } : { rotate: 15, opacity: 0, scale: 0.85 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Sun className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Moon className="w-4 h-4" aria-hidden="true" />
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};
