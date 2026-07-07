import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Select = forwardRef(({ label, error, options, placeholder, className, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-text-secondary">{label}</label>}
    <select
      ref={ref}
      className={cn(
        'w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
        error && 'border-red-500',
        className
      )}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
));

Select.displayName = 'Select';
export default Select;
