import React from 'react';

export const Input = React.forwardRef(({
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
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full space-y-1.5 font-mono ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-text-muted select-none"
        >
          {label} {required && <span className="text-status-occupied">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-text-muted">
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
          className={`
            w-full bg-surface-raised text-text placeholder-text-muted/60 text-sm font-mono
            border rounded-input px-3.5 py-2.5 transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-status-occupied focus:ring-status-occupied/40 focus:border-status-occupied' : 'border-border hover:border-border-dark'}
          `}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-status-occupied mt-1 font-mono flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-text-muted mt-1 font-mono">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
