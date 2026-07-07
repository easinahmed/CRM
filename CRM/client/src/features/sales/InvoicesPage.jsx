import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { getInvoices } from '../../api/invoices';
import { Card, Table, Pagination, PageHeader, Badge, statusBadge } from '../../components/ui';
import { useTable, useDebounce } from '../../hooks';
import { formatCurrency, formatDate } from '../../utils/format';

const col = createColumnHelper();

export default function InvoicesPage() {
  const [search, setSearch] = useState('');
  const ds = useDebounce(search);
  const { data, isLoading } = useQuery({
    queryKey: ['invoices', ds],
    queryFn: () => getInvoices({ search: ds, limit: 100 }),
  });
  const invoices = data?.data?.data || [];

  const columns = [
    col.accessor('invoiceNumber', { header: 'Invoice', cell: ({ getValue }) => <Badge color="purple">{getValue()}</Badge> }),
    col.accessor('customer', { header: 'Customer', cell: ({ getValue }) => getValue()?.firstName + ' ' + (getValue()?.lastName || '') || '—' }),
    col.accessor('grandTotal', { header: 'Amount', cell: ({ getValue }) => <span className="font-semibold">{formatCurrency(getValue())}</span> }),
    col.accessor('status', { header: 'Status', cell: ({ getValue }) => statusBadge(getValue()) }),
    col.accessor('dueDate', { header: 'Due Date', cell: ({ getValue }) => formatDate(getValue()) }),
    col.accessor('issueDate', { header: 'Issued', cell: ({ getValue }) => formatDate(getValue()) }),
  ];

  const table = useTable({ data: invoices, columns });

  return (
    <div>
      <PageHeader title="Invoices" description="Manage invoices" />
      <Card>
        <div className="p-4 border-b border-border">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input type="text" placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface-secondary text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
        </div>
        <Table table={table.table} loading={isLoading} columns={columns} />
        <Pagination table={table.table} />
      </Card>
    </div>
  );
}
