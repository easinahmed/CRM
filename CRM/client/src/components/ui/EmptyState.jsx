import { Inbox } from 'lucide-react';
import Button from './Button';

export function EmptyState({ icon: Icon = Inbox, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-surface-tertiary flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-text-tertiary" />
      </div>
      <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
      {description && <p className="text-sm text-text-secondary mb-6 text-center max-w-sm">{description}</p>}
      {action && actionLabel && (
        <Button onClick={action} size="sm">{actionLabel}</Button>
      )}
    </div>
  );
}
