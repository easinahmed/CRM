import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(({ label, error, icon, className, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-medium text-text-secondary">
        {label}
      </label>
    )}
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-tertiary">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text placeholder:text-text-tertiary transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
          icon && 'pl-10',
          error && 'border-red-500 focus:ring-red-500/30 focus:border-red-500',
          className
        )}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
