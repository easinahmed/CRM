import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Mail, Phone, Building2 } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import {
  getCustomers, createCustomer, updateCustomer, deleteCustomer,
} from '../../api/customers';
import {
  Button, Input, Card, CardHeader, CardTitle, Badge, Modal,
  Table, Pagination, PageHeader, EmptyState, statusBadge, Select,
} from '../../components/ui';
import { useTable, useDebounce } from '../../hooks';
import { customerSchema } from '../../utils/validation';
import { formatDate, formatCurrency } from '../../utils/format';

const col = createColumnHelper();

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', debouncedSearch],
    queryFn: () => getCustomers({ search: debouncedSearch, limit: 100 }),
  });

  const customers = data?.data?.data || [];

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); setModal(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCustomer(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); setModal(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(customerSchema),
  });

  const openCreate = () => { reset({}); setEditing(null); setModal(true); };
  const openEdit = (customer) => { reset(customer); setEditing(customer); setModal(true); };

  const onSubmit = (formData) => {
    if (editing) {
      updateMutation.mutate({ id: editing._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns = [
    col.accessor('fullName', { header: 'Name', cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-semibold text-primary-600">
          {row.original.firstName?.[0]}{row.original.lastName?.[0]}
        </div>
        <div>
          <p className="font-medium text-text">{row.original.firstName} {row.original.lastName}</p>
          <p className="text-xs text-text-tertiary">{row.original.company || '—'}</p>
        </div>
      </div>
    ) }),
    col.accessor('email', { header: 'Contact', cell: ({ getValue, row }) => (
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-sm"><Mail size={14} className="text-text-tertiary" />{getValue() || '—'}</div>
        <div className="flex items-center gap-1.5 text-sm"><Phone size={14} className="text-text-tertiary" />{row.original.phone || '—'}</div>
      </div>
    ) }),
    col.accessor('totalOrders', { header: 'Orders', cell: ({ getValue }) => (
      <span className="font-medium">{getValue() || 0}</span>
    ) }),
    col.accessor('totalSpent', { header: 'Total Spent', cell: ({ getValue }) => formatCurrency(getValue()) }),
    col.accessor('status', { header: 'Status', cell: ({ getValue }) => statusBadge(getValue()) }),
    col.accessor('createdAt', { header: 'Created', cell: ({ getValue }) => formatDate(getValue()) }),
    col.display({
      id: 'actions', header: '',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(row.original); }}>Edit</Button>
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(row.original._id); }}>Delete</Button>
        </div>
      ),
    }),
  ];

  const table = useTable({ data: customers, columns });

  return (
    <div>
      <PageHeader title="Customers" description="Manage your customer relationships" action={openCreate} actionLabel="Add Customer" actionIcon={<Plus size={16} />} />
      <Card>
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface-secondary text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
        </div>
        <Table table={table.table} loading={isLoading} columns={columns} onRowClick={openEdit} />
        <Pagination table={table.table} />
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
          </div>
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Company" {...register('company')} />
          <Select label="Source" options={[
            { value: 'website', label: 'Website' }, { value: 'referral', label: 'Referral' },
            { value: 'social_media', label: 'Social Media' }, { value: 'ad', label: 'Ad' },
            { value: 'walk_in', label: 'Walk In' }, { value: 'other', label: 'Other' },
          ]} {...register('source')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
