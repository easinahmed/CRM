import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Trash2, Edit2, Plus } from 'lucide-react';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice } from '../../api/invoices';
import { getCustomers } from '../../api/customers';
import { Card, PageHeader, Button, Input, Modal } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/format';

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  customer: z.string().optional(),
  grandTotal: z.coerce.number().min(0, 'Must be positive'),
  status: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export default function InvoicesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => getInvoices({ limit: 100 }),
    retry: 1,
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => getCustomers({ limit: 100 }),
    retry: 1,
  });

  let invoices = [];
  if (invoicesData?.data?.data) {
    invoices = Array.isArray(invoicesData.data.data) ? invoicesData.data.data : [];
  }

  const customers = (Array.isArray(customersData?.data?.data) ? customersData.data.data : []) || [];

  const filteredInvoices = invoices.filter(invoice =>
    !search || invoice.invoiceNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(invoiceSchema),
    mode: 'onChange',
  });

  const createMut = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created!');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    }
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateInvoice(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice updated!');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update invoice');
    }
  });

  const deleteMut = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete invoice');
    }
  });

  const closeModal = useCallback(() => {
    setModal(false);
    setEditing(null);
    reset();
  }, [reset]);

  const openCreate = useCallback(() => {
    setEditing(null);
    reset({ invoiceNumber: '', customer: '', grandTotal: 0, status: 'draft' });
    setModal(true);
  }, [reset]);

  const openEdit = useCallback((invoice) => {
    setEditing(invoice);
    reset(invoice);
    setModal(true);
  }, [reset]);

  const onSubmit = (data) => {
    if (editing) {
      updateMut.mutate({ id: editing._id, data });
    } else {
      createMut.mutate(data);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-700',
      'sent': 'bg-blue-100 text-blue-700',
      'paid': 'bg-green-100 text-green-700',
      'overdue': 'bg-red-100 text-red-700',
      'cancelled': 'bg-red-100 text-red-700',
      'refunded': 'bg-yellow-100 text-yellow-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage invoices"
        action={openCreate}
        actionLabel="Create Invoice"
        actionIcon={<Plus size={16} />}
      />

      <Card>
        <div className="p-4 border-b border-border">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface-secondary text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {invoicesLoading ? (
            <div className="p-8 text-center text-text-secondary">Loading invoices...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">
              No invoices found. <button onClick={openCreate} className="text-primary-500 underline">Create one now</button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-surface-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Invoice #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Due Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Issued</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-surface-secondary transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-primary-600">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-3 text-sm text-text">{invoice.customer?.firstName} {invoice.customer?.lastName || ''}</td>
                    <td className="px-6 py-3 text-sm font-semibold">{formatCurrency(invoice.grandTotal)}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-text-secondary">{invoice.dueDate ? formatDate(invoice.dueDate) : '-'}</td>
                    <td className="px-6 py-3 text-sm text-text-secondary">{formatDate(invoice.issueDate)}</td>
                    <td className="px-6 py-3 text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(invoice)} className="p-2 hover:bg-surface-secondary rounded-lg text-blue-600 transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => {
                          if (confirm(`Delete invoice ${invoice.invoiceNumber}?`)) {
                            deleteMut.mutate(invoice._id);
                          }
                        }} className="p-2 hover:bg-surface-secondary rounded-lg text-red-600 transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Modal open={modal} onClose={closeModal} title={editing ? 'Edit Invoice' : 'Create Invoice'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Invoice Number *" error={errors.invoiceNumber?.message} {...register('invoiceNumber')} />
          <div>
            <label className="text-sm font-medium text-text mb-2 block">Customer</label>
            <select {...register('customer')} className="w-full h-9 px-3 rounded-lg border border-border bg-surface-secondary text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500/30">
              <option value="">-- Select Customer --</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
            </select>
          </div>
          <Input label="Grand Total" type="number" error={errors.grandTotal?.message} {...register('grandTotal')} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-text mb-2 block">Status</label>
              <select {...register('status')} className="w-full h-9 px-3 rounded-lg border border-border bg-surface-secondary text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <Input label="Due Date" type="date" {...register('dueDate')} />
          </div>
          <Input label="Notes" {...register('notes')} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? 'Saving...' : (editing ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
