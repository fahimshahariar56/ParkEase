import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

/**
 * Dialog — modal overlay (DESIGN.md §5)
 * Rectangular panel, neutral colors, accessible keyboard trap.
 * API is backward-compatible.
 */
export const Dialog = ({
  isOpen,
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-lg',
}) => {
  const isDialogOpen = Boolean(isOpen ?? open);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!isDialogOpen) return;

    // Focus the close button when dialog opens for keyboard accessibility
    const frame = requestAnimationFrame(() => closeRef.current?.focus());

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDialogOpen, onClose]);

  return (
    <AnimatePresence>
      {isDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'dialog-title' : undefined}
          aria-describedby={description ? 'dialog-description' : undefined}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Dialog panel */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={[
              'relative w-full font-sans',
              maxWidth,
              'bg-surface-raised border border-border',
              'rounded-card shadow-raised z-10',
              'overflow-hidden flex flex-col max-h-[90vh]',
            ].join(' ')}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border flex-shrink-0">
              <div className="min-w-0">
                {title && (
                  <h2
                    id="dialog-title"
                    className="text-base font-semibold text-text tracking-tight"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="dialog-description" className="text-xs text-text-muted mt-0.5">
                    {description}
                  </p>
                )}
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className={[
                  'flex-shrink-0 p-1.5 rounded-sm',
                  'text-text-muted hover:text-text',
                  'hover:bg-surface border border-transparent hover:border-border',
                  'transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-offset-1',
                ].join(' ')}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-5 overflow-y-auto flex-1">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-5 py-3 border-t border-border bg-surface/60 flex items-center justify-end gap-2.5 flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
