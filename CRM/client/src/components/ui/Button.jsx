import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
  secondary: 'bg-surface-secondary text-text border border-border hover:bg-surface-tertiary',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  ghost: 'text-text-secondary hover:bg-surface-tertiary',
  outline: 'border border-primary-600 text-primary-600 hover:bg-primary-600/10',
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

const Button = forwardRef(({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={cn(
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:opacity-50 disabled:pointer-events-none',
      variants[variant],
      sizes[size],
      className
    )}
    {...props}
  >
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
    {children}
  </button>
));

Button.displayName = 'Button';
export default Button;
