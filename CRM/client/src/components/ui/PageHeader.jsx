import Button from './Button';
import { cn } from '../../utils/cn';

export function PageHeader({ title, description, action, actionLabel, actionIcon, className }) {
  return (
    <div className={cn('flex items-center justify-between mb-6', className)}>
      <div>
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
      </div>
      {action && actionLabel && (
        <Button onClick={action} icon={actionIcon} size="md">{actionLabel}</Button>
      )}
    </div>
  );
}
