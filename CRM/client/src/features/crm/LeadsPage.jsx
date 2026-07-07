import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Star } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { getLeads, createLead, updateLead, deleteLead, convertLead } from '../../api/leads';
import {
  Button, Input, Card, Modal, Table, Pagination, PageHeader, Select, Badge, statusBadge,
} from '../../components/ui';
import { useTable, useDebounce } from '../../hooks';
import { leadSchema } from '../../utils/validation';
import { formatDate, formatCurrency } from '../../utils/format';

const col = createColumnHelper();

export default function LeadsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const ds = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['leads', ds],
    queryFn: () => getLeads({ search: ds, limit: 100 }),
  });

  const leads = data?.data?.data || [];

  const createMut = useMutation({
    mutationFn: createLead,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); setModal(false); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateLead(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); setModal(false); setEditing(null); },
  });
  const deleteMut = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
  const convertMut = useMutation({
    mutationFn: convertLead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(leadSchema) });

  const openCreate = () => { reset({}); setEditing(null); setModal(true); };
  const openEdit = (l) => { reset(l); setEditing(l); setModal(true); };
  const onSubmit = (d) => editing ? updateMut.mutate({ id: editing._id, data: d }) : createMut.mutate(d);

  const columns = [
    col.accessor('fullName', { header: 'Name', cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-semibold text-amber-600">
          {row.original.firstName?.[0]}
        </div>
        <div>
          <p className="font-medium">{row.original.firstName} {row.original.lastName}</p>
          <p className="text-xs text-text-tertiary">{row.original.company || '—'}</p>
        </div>
      </div>
    ) }),
    col.accessor('email', { header: 'Email' }),
    col.accessor('phone', { header: 'Phone' }),
    col.accessor('score', { header: 'Score', cell: ({ getValue }) => (
      <div className="flex items-center gap-1">
        <Star size={14} className="text-amber-400" />
        <span>{getValue() || 0}</span>
      </div>
    ) }),
    col.accessor('source', { header: 'Source', cell: ({ getValue }) => <Badge color="blue">{getValue()}</Badge> }),
    col.accessor('status', { header: 'Status', cell: ({ getValue }) => statusBadge(getValue()) }),
    col.accessor('createdAt', { header: 'Created', cell: ({ getValue }) => formatDate(getValue()) }),
    col.display({ id: 'actions', header: '', cell: ({ row }) => (
      <div className="flex gap-1">
        {row.original.status !== 'converted' && (
          <Button variant="ghost" size="sm" className="text-emerald-600" onClick={(e) => { e.stopPropagation(); convertMut.mutate(row.original._id); }}>Convert</Button>
        )}
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(row.original); }}>Edit</Button>
        <Button variant="ghost" size="sm" className="text-red-500" onClick={(e) => { e.stopPropagation(); deleteMut.mutate(row.original._id); }}>Del</Button>
      </div>
    ) }),
  ];

  const table = useTable({ data: leads, columns });

  return (
    <div>
      <PageHeader title="Leads" description="Track and convert your leads" action={openCreate} actionLabel="Add Lead" actionIcon={<Plus size={16} />} />
      <Card>
        <div className="p-4 border-b border-border">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input type="text" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface-secondary text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
        </div>
        <Table table={table.table} loading={isLoading} columns={columns} onRowClick={openEdit} />
        <Pagination table={table.table} />
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Lead' : 'Add Lead'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Last Name" {...register('lastName')} />
          </div>
          <Input label="Email" error={errors.email?.message} {...register('email')} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Company" {...register('company')} />
          <Select label="Source" options={[
            { value: 'website', label: 'Website' }, { value: 'referral', label: 'Referral' },
            { value: 'social_media', label: 'Social Media' }, { value: 'call', label: 'Call' },
            { value: 'email', label: 'Email' }, { value: 'event', label: 'Event' },
          ]} {...register('source')} />
          <Input label="Score (0-100)" type="number" {...register('score')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
