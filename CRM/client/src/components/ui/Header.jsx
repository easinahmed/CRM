import { Menu, Moon, Sun, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { NotificationDropdown } from './NotificationDropdown';

export function Header({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-surface-tertiary text-text-secondary transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md ml-4 lg:ml-0">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface-secondary text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-shadow"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-surface-tertiary text-text-secondary transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
}
