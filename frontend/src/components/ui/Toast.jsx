import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

/**
 * ToastProvider — app-level toast system
 * Types: success | error | warning | info
 * All border accents use semantic status tokens (not brand green).
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast stack — bottom-right, pointer-events isolated */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-5 right-4 sm:right-5 z-[60] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// ─── Individual toast item ───────────────────────────────────────────────────

const TOAST_CONFIG = {
  success: {
    icon:       <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-status-available" aria-hidden="true" />,
    borderCls:  'border-status-available/30',
    accentCls:  'bg-status-available/8',
  },
  error: {
    icon:       <AlertCircle className="w-4 h-4 flex-shrink-0 text-status-occupied" aria-hidden="true" />,
    borderCls:  'border-status-occupied/30',
    accentCls:  'bg-status-occupied/8',
  },
  warning: {
    icon:       <AlertTriangle className="w-4 h-4 flex-shrink-0 text-status-pending" aria-hidden="true" />,
    borderCls:  'border-status-pending/30',
    accentCls:  'bg-status-pending/8',
  },
  info: {
    icon:       <Info className="w-4 h-4 flex-shrink-0 text-status-info" aria-hidden="true" />,
    borderCls:  'border-status-info/30',
    accentCls:  'bg-status-info/8',
  },
};

const ToastItem = ({ toast, onRemove }) => {
  const cfg = TOAST_CONFIG[toast.type] ?? TOAST_CONFIG.info;

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={[
        'pointer-events-auto flex items-start gap-3 px-4 py-3',
        'rounded-card bg-surface-raised border font-sans text-sm text-text',
        'shadow-raised',
        cfg.borderCls,
      ].join(' ')}
    >
      {cfg.icon}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="font-semibold text-xs tracking-tight text-text">
            {toast.title}
          </div>
        )}
        {toast.message && (
          <div className="text-xs text-text-muted mt-0.5 leading-relaxed">
            {toast.message}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        className={[
          'flex-shrink-0 p-0.5 rounded-sm -mt-0.5',
          'text-text-muted hover:text-text transition-colors duration-100',
          'focus-visible:outline-2 focus-visible:outline-offset-1',
        ].join(' ')}
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </motion.div>
  );
};

// ─── Hook ───────────────────────────────────────────────────────────────────

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
