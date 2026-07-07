import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Package } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/products';
import { getCategories } from '../../api/categories';
import {
  Button, Input, Card, Modal, Table, Pagination, PageHeader, Badge, statusBadge,
} from '../../components/ui';
import { useTable, useDebounce } from '../../hooks';
import { productSchema } from '../../utils/validation';
import { formatCurrency } from '../../utils/format';

const col = createColumnHelper();

export default function ProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const ds = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['products', ds],
    queryFn: () => getProducts({ search: ds, limit: 100 }),
  });
  const products = data?.data?.data || [];

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });
  const categories = categoriesData?.data?.data || [];

  const createMut = useMutation({
    mutationFn: createProduct,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setModal(false); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setModal(false); setEditing(null); },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(productSchema) });
  const openCreate = () => { reset({}); setEditing(null); setModal(true); };
  const openEdit = (p) => { reset(p); setEditing(p); setModal(true); };
  const onSubmit = (d) => {
    // Remove empty category before sending
    if (d.category === '') delete d.category;
    editing ? updateMut.mutate({ id: editing._id, data: d }) : createMut.mutate(d);
  };

  const columns = [
    col.accessor('name', { header: 'Product', cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-surface-tertiary flex items-center justify-center"><Package size={16} className="text-text-tertiary" /></div>
        <div><p className="font-medium">{row.original.name}</p><p className="text-xs text-text-tertiary">{row.original.sku}</p></div>
      </div>
    ) }),
    col.accessor('price', { header: 'Price', cell: ({ getValue }) => <span className="font-semibold">{formatCurrency(getValue())}</span> }),
    col.accessor('costPrice', { header: 'Cost', cell: ({ getValue }) => formatCurrency(getValue()) }),
    col.accessor('stock', { header: 'Stock', cell: ({ getValue, row }) => (
      <span className={row.original.stock <= row.original.minStock ? 'text-red-500 font-medium' : ''}>{getValue() || 0}</span>
    ) }),
    col.accessor('status', { header: 'Status', cell: ({ getValue }) => statusBadge(getValue()) }),
    col.display({ id: 'actions', header: '', cell: ({ row }) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(row.original); }}>Edit</Button>
        <Button variant="ghost" size="sm" className="text-red-500" onClick={(e) => { e.stopPropagation(); deleteProduct(row.original._id); }}>Del</Button>
      </div>
    ) }),
  ];

  const table = useTable({ data: products, columns });

  return (
    <div>
      <PageHeader title="Products" description="Manage your product catalog" action={openCreate} actionLabel="Add Product" actionIcon={<Plus size={16} />} />
      <Card>
        <div className="p-4 border-b border-border">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface-secondary text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
        </div>
        <Table table={table.table} loading={isLoading} columns={columns} />
        <Pagination table={table.table} />
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Product Name" error={errors.name?.message} {...register('name')} />
          <Input label="SKU" error={errors.sku?.message} {...register('sku')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price" type="number" error={errors.price?.message} {...register('price')} />
            <Input label="Cost Price" type="number" {...register('costPrice')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Stock" type="number" {...register('stock')} />
            <div>
              <label className="text-sm font-medium text-text mb-1 block">Category (Optional)</label>
              <select 
                {...register('category')} 
                className="w-full h-9 px-3 rounded-lg border border-border bg-surface-secondary text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                <option value="">-- Select Category --</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <Input label="Description" {...register('description')} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
