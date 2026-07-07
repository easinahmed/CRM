import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import { Button, Input, Card, Modal, PageHeader } from '../../components/ui';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional().or(z.literal('')),
  status: z.string().optional().or(z.literal('active')),
});

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: queryData, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
    retry: 1,
  });

  // Handle different possible API response structures
  let allCategories = [];
  if (queryData) {
    if (Array.isArray(queryData?.data?.data)) {
      allCategories = queryData.data.data;
    } else if (Array.isArray(queryData?.data)) {
      allCategories = queryData.data;
    } else if (Array.isArray(queryData)) {
      allCategories = queryData;
    }
  }



  const filteredCategories = allCategories.filter(cat =>
    !search || cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(categorySchema),
    mode: 'onChange',
  });

  const createMut = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created!');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create category');
    }
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated!');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
  });

  const deleteMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  });

  const closeModal = useCallback(() => {
    setModal(false);
    setEditing(null);
    reset();
  }, [reset]);

  const openCreate = useCallback(() => {
    setEditing(null);
    reset({ name: '', description: '', status: 'active' });
    setModal(true);
  }, [reset]);

  const openEdit = useCallback((cat) => {
    setEditing(cat);
    reset(cat);
    setModal(true);
  }, [reset]);

  const onSubmit = async (data) => {
    if (editing) {
      updateMut.mutate({ id: editing._id, data });
    } else {
      createMut.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage product categories"
        action={openCreate}
        actionLabel="Add Category"
        actionIcon={<Plus size={16} />}
      />

      <Card>
        <div className="p-4 border-b border-border">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface-secondary text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm">
              Error loading categories: {error.message}
            </div>
          )}
          {isLoading ? (
            <div className="p-8 text-center text-text-secondary">Loading categories...</div>
          ) : allCategories.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">
              No categories found. <button onClick={openCreate} className="text-primary-500 underline">Create one now</button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-surface-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Slug</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCategories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-surface-secondary transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-text">{cat.name}</td>
                    <td className="px-6 py-3 text-sm text-text-secondary"><code>{cat.slug}</code></td>
                    <td className="px-6 py-3 text-sm text-text-secondary">{cat.description || '-'}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${cat.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {cat.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-2 hover:bg-surface-secondary rounded-lg text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${cat.name}"?`)) {
                              deleteMut.mutate(cat._id);
                            }
                          }}
                          className="p-2 hover:bg-surface-secondary rounded-lg text-red-600 transition-colors"
                          title="Delete"
                        >
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

      <Modal
        open={modal}
        onClose={closeModal}
        title={editing ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Category Name *"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Description"
            {...register('description')}
          />
          <div>
            <label className="text-sm font-medium text-text mb-2 block">Status</label>
            <select
              {...register('status')}
              className="w-full h-9 px-3 rounded-lg border border-border bg-surface-secondary text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMut.isPending || updateMut.isPending}
            >
              {createMut.isPending || updateMut.isPending ? 'Saving...' : (editing ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
