import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Search, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { getTransactions, createTransaction, getTransactionSummary } from '../../api/transactions';
import {
  Button, Input, Card, CardHeader, CardTitle, Modal, Table, Pagination, PageHeader, Select, StatCard,
} from '../../components/ui';
import { useTable, useDebounce } from '../../hooks';
import { formatCurrency, formatDate } from '../../utils/format';

const col = createColumnHelper();

export default function AccountingPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);

  const { data: summaryData } = useQuery({
    queryKey: ['transaction-summary'],
    queryFn: getTransactionSummary,
  });
  const { data, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => getTransactions({ limit: 100 }),
  });

  const summary = summaryData?.data?.data || {};
  const transactions = data?.data?.data || [];

  const createMut = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transactions'] }); qc.invalidateQueries({ queryKey: ['transaction-summary'] }); setModal(false); },
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
    col.accessor('paymentMethod', { header: 'Method' }),
  ];

  const table = useTable({ data: transactions, columns });

  return (
    <div className="space-y-6">
      <PageHeader title="Accounting" description="Track income and expenses" action={() => { reset({}); setModal(true); }} actionLabel="Add Transaction" actionIcon={<Plus size={16} />} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={TrendingUp} label="Total Income" value={formatCurrency(summary.income)} color="green" />
        <StatCard icon={TrendingDown} label="Total Expenses" value={formatCurrency(summary.expense)} color="red" />
        <StatCard icon={DollarSign} label="Net Profit" value={formatCurrency(summary.net)} color={summary.net >= 0 ? 'green' : 'red'} />
      </div>

      <Card>
        <CardHeader><CardTitle>Transactions</CardTitle></CardHeader>
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
