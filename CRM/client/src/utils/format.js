export const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);

export const formatNumber = (num) =>
  new Intl.NumberFormat('en-US').format(num || 0);

export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(date));
};

export const formatDateTime = (date) =>
  formatDate(date, { hour: '2-digit', minute: '2-digit' });

export const formatRelative = (date) => {
  if (!date) return '—';
  const now = new Date();
  const d = new Date(date);
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

export const truncate = (str, len = 50) =>
  str?.length > len ? str.slice(0, len) + '...' : str;
