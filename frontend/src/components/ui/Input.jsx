import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Input — rectangular premium field (DESIGN.md §5)
 * Supports: label, icon, error, helperText, disabled, required
 * API is backward-compatible.
 */
export const Input = React.forwardRef((
  {
    label,
    error,
    helperText,
    icon: Icon,
    id,
    type = 'text',
    disabled = false,
    required = false,
    className = '',
    placeholder,
    ...props
  },
  ref,
) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-text-muted select-none"
        >
          {label}
          {required && (
            <span className="text-status-occupied ml-0.5" aria-hidden="true">*</span>
          )}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div
            className="absolute left-3 pointer-events-none text-text-muted"
            aria-hidden="true"
          >
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-hint` : undefined
          }
          className={[
            'w-full bg-surface-raised text-text text-sm font-sans',
            'border rounded-input px-3 py-2.5',
            'placeholder:text-text-muted/50',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-1',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            Icon ? 'pl-9' : '',
            error
              ? 'border-status-occupied focus:ring-status-occupied focus:border-status-occupied'
              : 'border-border hover:border-text/20 focus:ring-text/30 focus:border-text/40',
          ].join(' ')}
          {...props}
        />
      </div>

      {error ? (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-xs text-status-occupied flex items-center gap-1"
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-hint`} className="text-xs text-text-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
