import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../api/employees';
import {
  Button, Input, Card, Modal, Table, Pagination, PageHeader, Select, Badge, statusBadge,
} from '../../components/ui';
import { useTable, useDebounce } from '../../hooks';
import { employeeSchema } from '../../utils/validation';
import { formatDate, formatCurrency } from '../../utils/format';

const col = createColumnHelper();

export default function EmployeesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const ds = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['employees', ds],
    queryFn: () => getEmployees({ search: ds, limit: 100 }),
  });
  const employees = data?.data?.data || [];

  const createMut = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); setModal(false); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateEmployee(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); setModal(false); setEditing(null); },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(employeeSchema) });

  const openCreate = () => { reset({}); setEditing(null); setModal(true); };
  const openEdit = (e) => { reset(e); setEditing(e); setModal(true); };
  const onSubmit = (d) => editing ? updateMut.mutate({ id: editing._id, data: d }) : createMut.mutate(d);

  const columns = [
    col.accessor('employeeId', { header: 'ID', cell: ({ getValue }) => <Badge color="gray">{getValue()}</Badge> }),
    col.accessor('fullName', { header: 'Name', cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-semibold text-primary-600">
          {row.original.firstName?.[0]}{row.original.lastName?.[0]}
        </div>
        <div><p className="font-medium">{row.original.firstName} {row.original.lastName}</p></div>
      </div>
    ) }),
    col.accessor('email', { header: 'Email' }),
    col.accessor('designation', { header: 'Designation' }),
    col.accessor('department', { header: 'Department', cell: ({ getValue }) => getValue() || '—' }),
    col.accessor('status', { header: 'Status', cell: ({ getValue }) => statusBadge(getValue()) }),
    col.accessor('joiningDate', { header: 'Joined', cell: ({ getValue }) => formatDate(getValue()) }),
    col.display({ id: 'actions', header: '', cell: ({ row }) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(row.original); }}>Edit</Button>
        <Button variant="ghost" size="sm" className="text-red-500" onClick={(e) => { e.stopPropagation(); deleteEmployee(row.original._id); }}>Del</Button>
      </div>
    ) }),
  ];

  const table = useTable({ data: employees, columns });

  return (
    <div>
      <PageHeader title="Employees" description="Manage your workforce" action={openCreate} actionLabel="Add Employee" actionIcon={<Plus size={16} />} />
      <Card>
        <div className="p-4 border-b border-border">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input type="text" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface-secondary text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
        </div>
        <Table table={table.table} loading={isLoading} columns={columns} />
        <Pagination table={table.table} />
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Employee' : 'Add Employee'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
          </div>
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Designation" {...register('designation')} />
          <Input label="Department" {...register('department')} />
          <Input label="Joining Date" type="date" {...register('joiningDate')} />
          <Input label="Salary" type="number" {...register('salary')} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
