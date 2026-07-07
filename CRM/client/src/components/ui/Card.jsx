import { cn } from '../../utils/cn';

export function Card({ children, className, hover, ...props }) {
  return (
    <div className={cn('card p-5', hover && 'card-hover', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn('text-lg font-semibold text-text', className)} {...props}>
      {children}
    </h3>
  );
}
