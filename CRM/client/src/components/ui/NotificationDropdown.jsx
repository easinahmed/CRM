import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Info, AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../api/notifications';
import { formatRelative } from '../../utils/format';
import { cn } from '../../utils/cn';

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const colorMap = {
  info: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  success: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30',
  warning: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
  error: 'text-red-500 bg-red-100 dark:bg-red-900/30',
};

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 30000,
  });

  const markReadMut = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMut = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.data?.data?.notifications || [];
  const unread = data?.data?.data?.unread || 0;

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-surface-tertiary text-text-secondary transition-colors"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm shadow-red-500/30">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface border border-border rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-text">Notifications</h3>
              {unread > 0 && (
                <button
                  onClick={() => markAllMut.mutate()}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center py-8 px-4">
                  <Bell size={28} className="text-text-tertiary mb-2" />
                  <p className="text-sm text-text-secondary">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = iconMap[n.type] || Info;
                  return (
                    <button
                      key={n._id}
                      onClick={() => !n.isRead && markReadMut.mutate(n._id)}
                      className={cn(
                        'w-full text-left px-4 py-3 flex gap-3 transition-colors hover:bg-surface-secondary border-b border-border/50 last:border-0',
                        !n.isRead && 'bg-primary-50/50 dark:bg-primary-900/10'
                      )}
                    >
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', colorMap[n.type] || colorMap.info)}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text truncate">{n.title}</p>
                        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[11px] text-text-tertiary mt-1">{formatRelative(n.createdAt)}</p>
                      </div>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
