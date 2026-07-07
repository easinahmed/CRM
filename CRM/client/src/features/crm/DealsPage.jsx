import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Search } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { getDeals, createDeal, updateDeal, deleteDeal, getDealPipeline } from '../../api/deals';
import {
  Button, Input, Card, CardHeader, CardTitle, Modal, Table, Pagination, PageHeader, Badge, statusBadge,
} from '../../components/ui';
import { useTable, useDebounce } from '../../hooks';
import { formatCurrency, formatDate } from '../../utils/format';

const col = createColumnHelper();
const STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

export default function DealsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState('list');
  const ds = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['deals', ds],
    queryFn: () => getDeals({ search: ds, limit: 100 }),
  });
  const { data: pipelineData } = useQuery({
    queryKey: ['deals-pipeline'],
    queryFn: getDealPipeline,
  });

  const deals = data?.data?.data || [];
  const pipeline = pipelineData?.data?.data || {};

  const createMut = useMutation({
    mutationFn: createDeal,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); setModal(false); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateDeal(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); setModal(false); setEditing(null); },
  });

  const { register, handleSubmit, reset } = useForm();
  const openCreate = () => { reset({}); setEditing(null); setModal(true); };
  const onSubmit = (d) => editing ? updateMut.mutate({ id: editing._id, data: d }) : createMut.mutate(d);

  const columns = [
    col.accessor('title', { header: 'Title', cell: ({ row }) => (
      <div><p className="font-medium">{row.original.title}</p><p className="text-xs text-text-tertiary">{row.original.customer?.firstName} {row.original.customer?.lastName}</p></div>
    ) }),
    col.accessor('value', { header: 'Value', cell: ({ getValue }) => <span className="font-semibold text-primary-600">{formatCurrency(getValue())}</span> }),
    col.accessor('stage', { header: 'Stage', cell: ({ getValue }) => statusBadge(getValue()) }),
    col.accessor('probability', { header: 'Prob.', cell: ({ getValue }) => <span>{getValue()}%</span> }),
    col.accessor('expectedCloseDate', { header: 'Close Date', cell: ({ getValue }) => formatDate(getValue()) }),
    col.display({ id: 'actions', header: '', cell: ({ row }) => (
      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); reset(row.original); setEditing(row.original); setModal(true); }}>Edit</Button>
    ) }),
  ];

  const table = useTable({ data: deals, columns });

  return (
    <div className="space-y-6">
      <PageHeader title="Deals Pipeline" description="Manage your sales pipeline" action={openCreate} actionLabel="Add Deal" actionIcon={<Plus size={16} />} />

      <div className="flex gap-2">
        <Button variant={view === 'list' ? 'primary' : 'secondary'} size="sm" onClick={() => setView('list')}>List</Button>
        <Button variant={view === 'pipeline' ? 'primary' : 'secondary'} size="sm" onClick={() => setView('pipeline')}>Pipeline</Button>
      </div>

      {view === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAGES.map((stage) => {
            const stageDeals = pipeline[stage] || [];
            return (
              <div key={stage} className="card p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase text-text-secondary">{stage.replace(/_/g, ' ')}</span>
                  <span className="text-xs font-medium bg-surface-tertiary px-2 py-0.5 rounded-full">{stageDeals.length}</span>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {stageDeals.map((deal) => (
                    <motion.div key={deal._id} layout className="bg-surface-secondary rounded-lg p-3 border border-border cursor-pointer hover:border-primary-300 transition-colors">
                      <p className="text-sm font-medium text-text">{deal.title}</p>
                      <p className="text-xs text-text-tertiary mt-1">{deal.customer?.firstName} {deal.customer?.lastName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-primary-600">{formatCurrency(deal.value)}</span>
                        <Badge color="gray">{deal.probability}%</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'list' && (
        <Card>
          <div className="p-4 border-b border-border">
            <div className="relative max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input type="text" placeholder="Search deals..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface-secondary text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          </div>
          <Table table={table.table} loading={isLoading} columns={columns} />
          <Pagination table={table.table} />
        </Card>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Deal' : 'Add Deal'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" {...register('title')} />
          <Input label="Value" type="number" {...register('value')} />
          <div className="grid grid-cols-2 gap-3">
            <select {...register('stage')} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm">
              {STAGES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <Input label="Probability %" type="number" {...register('probability')} />
          </div>
          <Input label="Expected Close Date" type="date" {...register('expectedCloseDate')} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
