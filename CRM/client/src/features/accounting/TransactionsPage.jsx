import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { getTransactions, createTransaction } from '../../api/transactions';
import {
  Button, Input, Card, CardHeader, CardTitle, Modal, Table, Pagination, PageHeader, Select, Badge,
} from '../../components/ui';
import { useTable, useDebounce } from '../../hooks';
import { formatCurrency, formatDate } from '../../utils/format';

const col = createColumnHelper();

export default function TransactionsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const ds = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', ds, typeFilter],
    queryFn: () => getTransactions({ search: ds, type: typeFilter || undefined, limit: 100 }),
  });

  const transactions = data?.data?.data || [];

  const createMut = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transactions'] }); setModal(false); },
  });

  const { register, handleSubmit, reset } = useForm();
  const onSubmit = (d) => createMut.mutate(d);

  const columns = [
    col.accessor('date', { header: 'Date', cell: ({ getValue }) => formatDate(getValue()) }),
    col.accessor('type', { header: 'Type', cell: ({ getValue }) => (
      <span className={`inline-flex items-center gap-1 text-sm font-medium ${getValue() === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
        {getValue() === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {getValue()}
      </span>
    ) }),
    col.accessor('category', { header: 'Category' }),
    col.accessor('description', { header: 'Description' }),
    col.accessor('amount', { header: 'Amount', cell: ({ getValue, row }) => (
      <span className={`font-semibold ${row.original.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
        {row.original.type === 'income' ? '+' : '-'}{formatCurrency(getValue())}
      </span>
    ) }),
    col.accessor('paymentMethod', { header: 'Method', cell: ({ getValue }) => getValue() ? <Badge color="gray">{getValue()}</Badge> : '—' }),
    col.accessor('createdAt', { header: 'Recorded', cell: ({ getValue }) => formatDate(getValue()) }),
  ];

  const table = useTable({ data: transactions, columns });

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" description="All financial transactions" action={() => { reset({}); setModal(true); }} actionLabel="Add Transaction" actionIcon={<Plus size={16} />} />

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <div className="flex items-center gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-56 h-9 pl-9 pr-3 rounded-lg border border-border bg-surface-secondary text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          </div>
        </CardHeader>
        <Table table={table.table} loading={isLoading} columns={columns} />
        <Pagination table={table.table} />
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Transaction">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="Type" options={[
            { value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' },
          ]} {...register('type')} />
          <Select label="Category" options={[
            { value: 'sales', label: 'Sales' }, { value: 'purchase', label: 'Purchase' },
            { value: 'salary', label: 'Salary' }, { value: 'utility', label: 'Utility' },
            { value: 'rent', label: 'Rent' }, { value: 'marketing', label: 'Marketing' },
            { value: 'office', label: 'Office' }, { value: 'other', label: 'Other' },
          ]} {...register('category')} />
          <Input label="Amount" type="number" {...register('amount')} />
          <Input label="Description" {...register('description')} />
          <Input label="Date" type="date" {...register('date')} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
