import { cn } from '../../utils/cn';

const colors = {
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  yellow: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
};

export function Badge({ children, color = 'gray', className, dot, ...props }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
      colors[color],
      className
    )} {...props}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export const statusBadge = (status) => {
  const map = {
    active: 'green', inactive: 'gray', pending: 'yellow', approved: 'green',
    rejected: 'red', new: 'blue', contacted: 'indigo', qualified: 'cyan',
    'closed_won': 'green', 'closed_lost': 'red', draft: 'gray', sent: 'blue',
    paid: 'green', overdue: 'red', cancelled: 'gray', delivered: 'green',
    shipped: 'cyan', processing: 'yellow', confirmed: 'blue',
    present: 'green', absent: 'red', late: 'yellow', leave: 'purple',
    lead: 'indigo', proposal: 'purple', negotiation: 'cyan',
  };
  return <Badge color={map[status] || 'gray'}>{status.replace(/_/g, ' ')}</Badge>;
};
