import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export function StatCard({ icon: Icon, label, value, trend, color = 'primary', className }) {
  const colors = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('card p-5', className)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="text-2xl font-bold text-text tracking-tight">{value}</p>
          {trend !== undefined && (
            <p className={cn('text-xs font-medium', trend >= 0 ? 'text-emerald-600' : 'text-red-500')}>
              {trend >= 0 ? '+' : ''}{trend}% vs last month
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', colors[color])}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
