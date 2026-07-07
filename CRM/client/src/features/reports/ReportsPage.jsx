import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download, FileText, TrendingUp, Users, Package, Loader2 } from 'lucide-react';
import {
  getSalesReport, getCustomerReport, getInventoryReport, getProfitLoss,
} from '../../api/reports';
import { Card, CardHeader, CardTitle, Button } from '../../components/ui';
import { downloadCSV, openReportWindow, flattenReportData, formatCurrency } from '../../utils';
import { formatDate } from '../../utils/format';

const reportCards = [
  { title: 'Sales Report', desc: 'Monthly sales performance and trends', icon: TrendingUp, color: 'bg-green-100 text-green-600 dark:bg-green-900/30', key: 'sales' },
  { title: 'Customer Report', desc: 'Customer acquisition and retention metrics', icon: Users, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30', key: 'customers' },
  { title: 'Inventory Report', desc: 'Stock levels and product performance', icon: Package, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30', key: 'inventory' },
  { title: 'Profit & Loss', desc: 'Revenue, expenses and net profit analysis', icon: FileText, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30', key: 'pnl' },
];

const fetchers = {
  sales: getSalesReport,
  customers: getCustomerReport,
  inventory: getInventoryReport,
  pnl: getProfitLoss,
};

function useReport(key) {
  return useQuery({
    queryKey: [`report-${key}`],
    queryFn: fetchers[key],
    enabled: false,
    staleTime: 60000,
  });
}

function useReportViewer(key) {
  return useQuery({
    queryKey: [`report-view-${key}`],
    queryFn: fetchers[key],
    enabled: false,
    staleTime: 60000,
  });
}

function ReportCard({ report, onView, onExport, loading }) {
  return (
    <Card hover>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${report.color} flex items-center justify-center`}>
          <report.icon size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-text">{report.title}</h3>
          <p className="text-sm text-text-secondary mt-1">{report.desc}</p>
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" size="sm" icon={loading ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />} onClick={onView}>View</Button>
            <Button variant="ghost" size="sm" icon={<Download size={14} />} onClick={onExport}>Export</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function ReportsPage() {
  const salesQ = useReport('sales');
  const custQ = useReport('customers');
  const invQ = useReport('inventory');
  const pnlQ = useReport('pnl');

  const queries = { sales: salesQ, customers: custQ, inventory: invQ, pnl: pnlQ };

  const getReportData = (key) => queries[key]?.data?.data?.data;

  const handleView = useCallback(async (key) => {
    const q = queries[key];
    const result = await q.refetch();
    const data = result?.data?.data?.data;
    if (!data) return;

    if (key === 'pnl') {
      const { income, expenses, netProfit, salesRevenue, purchaseCost, incomeCount, expenseCount } = data;
      openReportWindow('Profit & Loss Statement', `
        <div class="summary">
          <div class="stat"><div class="stat-label">Revenue</div><div class="stat-value">${formatCurrency(salesRevenue)}</div></div>
          <div class="stat"><div class="stat-label">Income</div><div class="stat-value">${formatCurrency(income)}</div></div>
          <div class="stat"><div class="stat-label">Expenses</div><div class="stat-value">${formatCurrency(expenses)}</div></div>
          <div class="stat"><div class="stat-label">Purchases</div><div class="stat-value">${formatCurrency(purchaseCost)}</div></div>
          <div class="stat" style="border-color:${netProfit >= 0 ? '#10b981' : '#ef4444'}"><div class="stat-label">Net Profit</div><div class="stat-value">${formatCurrency(netProfit)}</div></div>
        </div>
        <table><thead><tr><th>Metric</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td>Total Revenue</td><td>${formatCurrency(salesRevenue)}</td></tr>
          <tr><td>Total Income</td><td>${formatCurrency(income)}</td></tr>
          <tr><td>Total Expenses</td><td>${formatCurrency(expenses)} (${expenseCount} transactions)</td></tr>
          <tr><td>Purchase Cost</td><td>${formatCurrency(purchaseCost)}</td></tr>
          <tr><td><strong>Net Profit</strong></td><td><strong>${formatCurrency(netProfit)}</strong></td></tr>
        </tbody></table>
      `);
      return;
    }

    const items = data.orders || data.customers || data.products || [];
    const summary = data.summary || {};
    const summaryHtml = Object.entries(summary).map(([k, v]) =>
      `<div class="stat"><div class="stat-label">${k.replace(/([A-Z])/g, ' $1').trim()}</div><div class="stat-value">${typeof v === 'number' ? (k.includes('Value') || k.includes('Revenue') || k.includes('Spent') || k.includes('Payroll') ? formatCurrency(v) : v) : v}</div></div>`
    ).join('');
    const tableRows = items.slice(0, 50).map((item) =>
      `<tr>${Object.values(item).slice(0, 6).map((v) => `<td>${v?.name || v?.firstName || v?.toString().slice(0, 40) || '—'}</td>`).join('')}</tr>`
    ).join('');

    openReportWindow(reportCards.find((r) => r.key === key)?.title || key, `
      <div class="summary">${summaryHtml}</div>
      ${items.length ? `<table><thead><tr>${Object.keys(items[0]).slice(0, 6).map((k) => `<th>${k.replace(/([A-Z])/g, ' $1').trim()}</th>`).join('')}</tr></thead><tbody>${tableRows}</tbody></table>` : '<p>No data available</p>'}
    `);
  }, [salesQ, custQ, invQ, pnlQ]);

  const handleExport = useCallback(async (key) => {
    const q = queries[key];
    const result = await q.refetch();
    const data = result?.data?.data?.data;
    if (!data) return;

    if (key === 'pnl') {
      downloadCSV([data], `profit-loss-${Date.now()}.csv`);
      return;
    }

    const items = data.orders || data.customers || data.products || [];
    if (!items.length) return;
    const flat = flattenReportData(items, key);
    downloadCSV(flat, `${key}-report-${Date.now()}.csv`);
  }, [salesQ, custQ, invQ, pnlQ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Reports</h1>
        <p className="text-sm text-text-secondary mt-1">Business analytics and exportable reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportCards.map((r) => (
          <ReportCard
            key={r.key}
            report={r}
            onView={() => handleView(r.key)}
            onExport={() => handleExport(r.key)}
            loading={queries[r.key]?.isFetching}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Export</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Export Sales (CSV)', key: 'sales' },
            { label: 'Export Customers (CSV)', key: 'customers' },
            { label: 'Export Inventory (CSV)', key: 'inventory' },
            { label: 'P&L Statement', key: 'pnl' },
          ].map(({ label, key }) => (
            <Button
              key={label}
              variant="secondary"
              size="sm"
              icon={queries[key]?.isFetching ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              onClick={() => handleExport(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
