import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, ShoppingCart, Trash2, Edit2, Plus } from 'lucide-react';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getOrders, createOrder, updateOrder, deleteOrder } from '../../api/orders';
import { getCustomers } from '../../api/customers';
import { Card, PageHeader, Button, Input, Modal } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/format';

const orderSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  customer: z.string().optional(),
  grandTotal: z.coerce.number().min(0, 'Must be positive'),
  paymentStatus: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export default function OrdersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrders({ limit: 100 }),
    retry: 1,
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => getCustomers({ limit: 100 }),
    retry: 1,
  });

  let orders = [];
  if (ordersData?.data?.data) {
    orders = Array.isArray(ordersData.data.data) ? ordersData.data.data : [];
  }

  const customers = (Array.isArray(customersData?.data?.data) ? customersData.data.data : []) || [];

  const filteredOrders = orders.filter(order =>
    !search || order.orderNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(orderSchema),
    mode: 'onChange',
  });

  const createMut = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order created!');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create order');
    }
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateOrder(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order updated!');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update order');
    }
  });

  const deleteMut = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order deleted!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    }
  });

  const closeModal = useCallback(() => {
    setModal(false);
    setEditing(null);
    reset();
  }, [reset]);

  const openCreate = useCallback(() => {
    setEditing(null);
    reset({ orderNumber: '', customer: '', grandTotal: 0, paymentStatus: 'pending', status: 'pending' });
    setModal(true);
  }, [reset]);

  const openEdit = useCallback((order) => {
    setEditing(order);
    reset(order);
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
      'pending': 'bg-yellow-100 text-yellow-700',
      'confirmed': 'bg-blue-100 text-blue-700',
      'shipped': 'bg-purple-100 text-purple-700',
      'delivered': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage sales orders"
        action={openCreate}
        actionLabel="Create Order"
        actionIcon={<Plus size={16} />}
      />

      <Card>
        <div className="p-4 border-b border-border">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface-secondary text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {ordersLoading ? (
            <div className="p-8 text-center text-text-secondary">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">
              No orders found. <button onClick={openCreate} className="text-primary-500 underline">Create one now</button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-surface-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Order #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Payment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-surface-secondary transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-primary-600">{order.orderNumber}</td>
                    <td className="px-6 py-3 text-sm text-text">{order.customer?.firstName} {order.customer?.lastName || ''}</td>
                    <td className="px-6 py-3 text-sm font-semibold">{formatCurrency(order.grandTotal)}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-text-secondary">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-3 text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(order)} className="p-2 hover:bg-surface-secondary rounded-lg text-blue-600 transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => {
                          if (confirm(`Delete order ${order.orderNumber}?`)) {
                            deleteMut.mutate(order._id);
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

      <Modal open={modal} onClose={closeModal} title={editing ? 'Edit Order' : 'Create Order'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Order Number *" error={errors.orderNumber?.message} {...register('orderNumber')} />
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
              <label className="text-sm font-medium text-text mb-2 block">Payment Status</label>
              <select {...register('paymentStatus')} className="w-full h-9 px-3 rounded-lg border border-border bg-surface-secondary text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-text mb-2 block">Order Status</label>
              <select {...register('status')} className="w-full h-9 px-3 rounded-lg border border-border bg-surface-secondary text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
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
