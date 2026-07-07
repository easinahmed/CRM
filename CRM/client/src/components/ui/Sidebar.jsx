import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Target, DollarSign, Package, ShoppingCart,
  FileText, UserCircle, Receipt, BarChart3, ClipboardList, Settings, LogOut,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { section: 'Main', items: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { section: 'CRM', items: [
    { to: '/crm/customers', label: 'Customers', icon: Users },
    { to: '/crm/leads', label: 'Leads', icon: Target },
    { to: '/crm/deals', label: 'Deals', icon: DollarSign },
  ]},
  { section: 'Sales', items: [
    { to: '/sales/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/sales/invoices', label: 'Invoices', icon: FileText },
  ]},
  { section: 'Products', items: [
    { to: '/inventory/products', label: 'Products', icon: Package },
  ]},
  { section: 'Employees', items: [
    { to: '/employees', label: 'Employees', icon: UserCircle },
  ]},
  { section: 'Finance', items: [
    { to: '/accounting', label: 'Accounting', icon: Receipt },
    { to: '/accounting/transactions', label: 'Transactions', icon: ClipboardList },
  ]},
  { section: 'Reports', items: [
    { to: '/reports', label: 'Reports', icon: BarChart3 },
  ]},
  { section: 'System', items: [
    { to: '/settings', label: 'Settings', icon: Settings },
  ]},
];

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-sidebar-bg transition-all duration-300',
        collapsed ? 'lg:w-[72px]' : 'lg:w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-600/20 flex-shrink-0">
                C
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm truncate">Enterprise</p>
                  <p className="text-[10px] text-white/40 font-medium tracking-wider uppercase">CRM Platform</p>
                </div>
              )}
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-white/10 text-sidebar-text/60 hover:text-sidebar-text transition-colors hidden lg:grid place-items-center flex-shrink-0"
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-6">
            {navItems.map((group) => (
              <div key={group.section}>
                {!collapsed && (
                  <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">
                    {group.section}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onMobileClose}
                      className={({ isActive }) => cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary-600/20 text-primary-400 shadow-sm shadow-primary-600/5'
                          : 'text-sidebar-text hover:bg-white/[0.07] hover:text-white'
                      )}
                    >
                      <item.icon size={20} className={cn('flex-shrink-0')} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-white/10 p-3 flex-shrink-0">
            {!collapsed && user && (
              <div className="px-3 py-2.5 mb-1.5 bg-white/[0.03] rounded-lg">
                <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
                <p className="text-[11px] text-sidebar-text/60 capitalize mt-0.5">{user.role?.replace(/_/g, ' ')}</p>
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-text hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut size={20} className="flex-shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onMobileClose} />
      )}
    </>
  );
}
