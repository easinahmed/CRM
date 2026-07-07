import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Save, Building2, Palette, Shield, Bell } from 'lucide-react';
import { getSettings, updateSettings } from '../../api/settings';
import { Button, Input, Card, CardHeader, CardTitle } from '../../components/ui';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  const settings = data?.data?.data || {};

  const updateMut = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved');
    },
  });

  const { register, handleSubmit } = useForm({ values: settings });

  const onSubmit = (d) => updateMut.mutate(d);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your company and system preferences</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle><Building2 size={18} className="text-primary-500" /> Company Information</CardTitle></CardHeader>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Company Name" {...register('companyName')} />
            <Input label="Email" {...register('email')} />
            <Input label="Phone" {...register('phone')} />
            <Input label="Website" {...register('website')} />
            <Input label="Tax ID" {...register('taxId')} />
            <Input label="Registration Number" {...register('registrationNumber')} />
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle><Palette size={18} className="text-primary-500" /> Localization</CardTitle></CardHeader>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Currency" {...register('currency')} />
            <Input label="Currency Symbol" {...register('currencySymbol')} />
            <Input label="Timezone" {...register('timezone')} />
            <Input label="Date Format" {...register('dateFormat')} />
            <Input label="Tax Name" {...register('taxName')} />
            <Input label="Tax Rate (%)" type="number" {...register('taxRate')} />
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle><Shield size={18} className="text-primary-500" /> Invoice & Order Prefixes</CardTitle></CardHeader>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Invoice Prefix" {...register('invoicePrefix')} />
            <Input label="Order Prefix" {...register('orderPrefix')} />
            <Input label="Purchase Prefix" {...register('purchasePrefix')} />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={updateMut.isPending} icon={<Save size={16} />}>Save Settings</Button>
        </div>
      </form>
    </div>
  );
}
