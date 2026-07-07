import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/ui';
import { loginSchema } from '../../utils/validation';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      navigate('/dashboard');
    } catch {
      // error toast handled by axios interceptor
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
              C
            </div>
            <h1 className="text-2xl font-bold text-text">Welcome back</h1>
            <p className="text-sm text-text-secondary mt-1">Sign in to your Enterprise CRM account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-text-tertiary hover:text-text-secondary"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" className="rounded border-border" /> Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">Forgot password?</Link>
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full" icon={<LogIn size={16} />}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">Create one</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
