import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ShoppingCart } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { getOrders } from '../../api/orders';
import { Card, Table, Pagination, PageHeader, Badge, statusBadge } from '../../components/ui';
import { useTable, useDebounce } from '../../hooks';
import { formatCurrency, formatDate } from '../../utils/format';

const col = createColumnHelper();

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const ds = useDebounce(search);
  const { data, isLoading } = useQuery({
    queryKey: ['orders', ds],
    queryFn: () => getOrders({ search: ds, limit: 100 }),
  });
  const orders = data?.data?.data || [];

  const columns = [
    col.accessor('orderNumber', { header: 'Order', cell: ({ getValue }) => <Badge color="indigo">{getValue()}</Badge> }),
    col.accessor('customer', { header: 'Customer', cell: ({ getValue }) => getValue()?.firstName + ' ' + (getValue()?.lastName || '') || 'Walk-in' }),
    col.accessor('grandTotal', { header: 'Total', cell: ({ getValue }) => <span className="font-semibold">{formatCurrency(getValue())}</span> }),
    col.accessor('paymentStatus', { header: 'Payment', cell: ({ getValue }) => statusBadge(getValue()) }),
    col.accessor('status', { header: 'Status', cell: ({ getValue }) => statusBadge(getValue()) }),
    col.accessor('createdAt', { header: 'Date', cell: ({ getValue }) => formatDate(getValue()) }),
  ];

  const table = useTable({ data: orders, columns });

  return (
    <div>
      <PageHeader title="Orders" description="Manage sales orders" />
      <Card>
        <div className="p-4 border-b border-border">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface-secondary text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
        </div>
        <Table table={table.table} loading={isLoading} columns={columns} />
        <Pagination table={table.table} />
      </Card>
    </div>
  );
}
