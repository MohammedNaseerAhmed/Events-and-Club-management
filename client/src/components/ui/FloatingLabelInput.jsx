import React from 'react';
import { forwardRef } from 'react';

const FloatingLabelInput = forwardRef(function FloatingLabelInput(
  { label, error, id, className = '', ...props },
  ref
) {
  const inputId = id || props.name || `field-${label.replace(/\s/g, '-')}`;
  return (
    <div className="relative">
      <input
        ref={ref}
        id={inputId}
        placeholder=" "
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`peer w-full rounded-xl border bg-white/50 dark:bg-slate-800/50 px-4 pt-5 pb-2 text-slate-900 dark:text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          error ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-slate-600'
        } ${className}`}
        {...props}
      />
      <label
        htmlFor={inputId}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none transition-all duration-200 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-blue-600 dark:peer-focus:text-blue-400 peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
      >
        {label}
      </label>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default FloatingLabelInput;
