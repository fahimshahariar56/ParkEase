import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
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
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isDialogOpen) return;

    previousFocusRef.current = document.activeElement;
    const frame = requestAnimationFrame(() => closeRef.current?.focus());
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      const previousFocus = previousFocusRef.current;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, [isDialogOpen]);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      onClose?.();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = Array.from(dialogRef.current?.querySelectorAll(
      'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
    ) || []).filter((element) => element.getClientRects().length > 0);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!dialogRef.current.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <AnimatePresence>
      {isDialogOpen && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'dialog-title' : undefined}
          aria-describedby={description ? 'dialog-description' : undefined}
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Dialog panel */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
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
              <motion.button
                ref={closeRef}
                type="button"
                onClick={onClose}
                whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.14 }}
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
              </motion.button>
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
