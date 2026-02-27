import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FloatingLabelInput from '../components/ui/FloatingLabelInput';
import PasswordInput from '../components/ui/PasswordInput';
import { Shield, Loader2 } from 'lucide-react';

const adminLoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function AdminLogin() {
  const { user, login, isAuthenticated, authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else navigate('/feed', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    try {
      const result = await login(data.email, data.password);
      const user = result?.user;
      if (user?.role === 'admin') {
        showToast('Welcome back, Admin.', 'success');
        navigate('/admin/dashboard', { replace: true });
      } else {
        showToast('Not an admin account. Redirecting to dashboard.', 'success');
        navigate('/feed', { replace: true });
      }
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 429) {
        const retry = data?.error?.retryAfterSeconds ?? 900;
        const min = Math.ceil(retry / 60);
        setError('root', { type: 'manual', message: `Too many failed attempts. Try again in ${min} minute(s).` });
      } else {
        const msg = data?.error?.message || err.message || 'Login failed';
        setError('root', { type: 'manual', message: msg });
      }
    }
  };

  const rootError = errors.root?.message;
  if (isAuthenticated && user?.role === 'admin') return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8 dark:bg-slate-800/50 dark:border-slate-700">
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-white dark:text-white mb-2">Admin Login</h1>
          <p className="text-center text-slate-400 text-sm mb-8">Secure access for administrators</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FloatingLabelInput
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              className="bg-white/5 dark:bg-slate-800/50 border-slate-400/30 dark:border-slate-600 text-white placeholder-slate-500"
              {...register('email')}
            />
            <PasswordInput
              label="Password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
            {rootError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3" role="alert">
                {rootError}
              </div>
            )}
            <button
              type="submit"
              disabled={!isValid || authLoading}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center gap-2 transition-colors"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
                  <span>Signing in…</span>
                </>
              ) : (
                'Sign in as Admin'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-slate-400 hover:text-white text-sm transition-colors">
              Not an admin? Student Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
