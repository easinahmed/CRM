import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { registerApi } from '../../api/auth';
import { Button, Input } from '../../components/ui';
import { registerSchema } from '../../utils/validation';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      await registerApi(data);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch {
      // handled by interceptor
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">C</div>
            <h1 className="text-2xl font-bold text-text">Create account</h1>
            <p className="text-sm text-text-secondary mt-1">Get started with Enterprise CRM</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <Input label="Email" type="email" placeholder="you@company.com" error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" placeholder="Min 8 characters" error={errors.password?.message} {...register('password')} />
            <Input label="Phone" placeholder="+1 234 567 890" {...register('phone')} />
            <Button type="submit" loading={isSubmitting} className="w-full" icon={<UserPlus size={16} />}>Create Account</Button>
          </form>
          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
