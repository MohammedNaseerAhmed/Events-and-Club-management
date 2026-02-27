import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { loginSchema } from '../lib/validations/authSchemas';
import FloatingLabelInput from '../components/ui/FloatingLabelInput';
import PasswordInput from '../components/ui/PasswordInput';
import { Building2, Loader2 } from 'lucide-react';

export default function Login() {
  const { login, isAuthenticated, authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/feed';

  useEffect(() => {
    if (isAuthenticated) navigate('/feed', { replace: true });
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      showToast('Welcome back!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Login failed';
      showToast(msg, 'error');
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">Sign in</h1>
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FloatingLabelInput
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <PasswordInput
              label="Password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="submit"
              disabled={!isValid || authLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex items-center justify-center gap-2 transition-colors"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
                  <span>Signing in…</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-3">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Sign up
              </Link>
            </p>
            <p className="text-slate-500 dark:text-slate-500 text-sm">
              <Link to="/club-admin/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                Club admin login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
