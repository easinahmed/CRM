import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users, Target, DollarSign, ShoppingCart, Package, UserCheck,
  TrendingUp, TrendingDown, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { getDashboardStats } from '../../api/dashboard';
import { StatCard, Card, CardHeader, CardTitle } from '../../components/ui';
import { StatSkeleton } from '../../components/ui/Skeleton';
import { formatCurrency, formatRelative } from '../../utils/format';
import { statusBadge } from '../../components/ui/Badge';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000,
  });

  const stats = data?.data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Revenue', value: formatCurrency(stats?.kpis?.totalRevenue), icon: DollarSign, color: 'green', trend: 12.5 },
    { label: 'Net Profit', value: formatCurrency(stats?.kpis?.netProfit), icon: TrendingUp, color: 'primary', trend: 8.3 },
    { label: 'Customers', value: stats?.kpis?.totalCustomers, icon: Users, color: 'blue', trend: 5.2 },
    { label: 'Leads', value: stats?.kpis?.totalLeads, icon: Target, color: 'amber', trend: -2.1 },
    { label: 'Deals Pipeline', value: formatCurrency(stats?.kpis?.pipelineValue), icon: DollarSign, color: 'purple', trend: 15.7 },
    { label: 'Orders', value: stats?.kpis?.totalOrders, icon: ShoppingCart, color: 'primary', trend: 3.8 },
    { label: 'Products', value: stats?.kpis?.totalProducts, icon: Package, color: 'green' },
    { label: 'Employees', value: stats?.kpis?.totalEmployees, icon: UserCheck, color: 'blue' },
  ];

  const dealsChartData = stats?.dealsByStage?.map((d) => ({
    name: d._id.replace(/_/g, ' '),
    value: d.count,
    amount: d.value,
  })) || [];

  const activities = stats?.recentActivities || [];

  const revenueData = [
    { month: 'Jan', revenue: 45000, expenses: 32000 },
    { month: 'Feb', revenue: 52000, expenses: 34000 },
    { month: 'Mar', revenue: 48000, expenses: 31000 },
    { month: 'Apr', revenue: 61000, expenses: 35000 },
    { month: 'May', revenue: 55000, expenses: 33000 },
    { month: 'Jun', revenue: 67000, expenses: 36000 },
    { month: 'Jul', revenue: 72000, expenses: 38000 },
    { month: 'Aug', revenue: 68000, expenses: 37000 },
    { month: 'Sep', revenue: 75000, expenses: 39000 },
    { month: 'Oct', revenue: 82000, expenses: 41000 },
    { month: 'Nov', revenue: 78000, expenses: 40000 },
    { month: 'Dec', revenue: 95000, expenses: 43000 },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">Your business overview at a glance</p>
      </div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <StatCard key={i} {...kpi} />
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Expenses</CardTitle>
            </CardHeader>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Deals Pipeline</CardTitle>
            </CardHeader>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dealsChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {dealsChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {dealsChartData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <div className="space-y-1">
              {activities.length === 0 ? (
                <p className="text-sm text-text-secondary py-4 text-center">No recent activities</p>
              ) : (
                activities.slice(0, 8).map((act, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-surface-tertiary flex items-center justify-center flex-shrink-0">
                      <Activity size={14} className="text-text-tertiary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text truncate">{act.description || act.action}</p>
                      <p className="text-xs text-text-tertiary">
                        {act.user?.firstName} {act.user?.lastName} · {formatRelative(act.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData.slice(-6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8 }}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
