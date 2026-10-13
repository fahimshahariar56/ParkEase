import React from 'react';
import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`
        relative p-2 rounded-input border border-border bg-surface-raised hover:bg-surface
        text-text hover:border-brand/40 transition-colors shadow-subtle flex items-center justify-center
        focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2
        ${className}
      `}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 30, opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-brand" />
        ) : (
          <Moon className="w-4 h-4 text-brand" />
        )}
      </motion.div>
    </motion.button>
  );
};
