import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
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

  const toastIcons = {
    success: <CheckCircle2 className="w-5 h-5 text-status-available flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-status-occupied flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-status-pending flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-status-info flex-shrink-0" />,
  };

  const toastBorders = {
    success: 'border-status-available/40',
    error: 'border-status-occupied/40',
    warning: 'border-status-pending/40',
    info: 'border-status-info/40',
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              className={`
                pointer-events-auto flex items-start gap-3 p-4 rounded-card
                bg-surface-raised border ${toastBorders[t.type] || 'border-border'}
                shadow-raised font-mono text-sm text-text
              `}
            >
              {toastIcons[t.type] || toastIcons.info}
              <div className="flex-1 min-w-0">
                {t.title && <div className="font-bold text-xs tracking-tight">{t.title}</div>}
                {t.message && <div className="text-xs text-text-muted mt-0.5">{t.message}</div>}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-text-muted hover:text-text p-0.5 rounded transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
