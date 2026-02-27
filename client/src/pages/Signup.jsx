import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { registerSchema } from '../lib/validations/authSchemas';
import FloatingLabelInput from '../components/ui/FloatingLabelInput';
import PasswordInput from '../components/ui/PasswordInput';
import PasswordRules from '../components/ui/PasswordRules';
import api from '../services/api';
import { Building2, Loader2, Check, X } from 'lucide-react';

export default function Signup() {
  const { register: registerUser, isAuthenticated, authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/feed', { replace: true });
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
    },
  });

  const passwordValue = watch('password');
  const usernameValue = watch('username');
  const [usernameStatus, setUsernameStatus] = useState({ state: 'idle', message: '' });

  useEffect(() => {
    const raw = (usernameValue || '').trim().toLowerCase();
    if (raw.length < 4) {
      setUsernameStatus({ state: 'idle', message: '' });
      return;
    }
    if (!/^[a-z0-9_]+$/.test(raw)) {
      setUsernameStatus({ state: 'invalid', message: 'Only letters, numbers, underscore' });
      return;
    }
    const t = setTimeout(async () => {
      setUsernameStatus({ state: 'loading', message: '' });
      try {
        const { available, reason } = await api.checkUsername(raw);
        setUsernameStatus(available ? { state: 'available', message: 'Available' } : { state: 'taken', message: reason || 'Username taken' });
      } catch {
        setUsernameStatus({ state: 'idle', message: '' });
      }
    }, 500);
    return () => clearTimeout(t);
  }, [usernameValue]);

  const onSubmit = async (data) => {
    try {
      const result = await registerUser(data.name, data.username, data.email, data.password, data.role);
      if (result?.requiresVerification) {
        showToast('OTP sent to your email. Verify to continue.', 'success');
        navigate('/verify-email', { replace: true, state: { email: data.email } });
        return;
      }
      showToast('Account created. Welcome!', 'success');
      navigate('/feed', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Registration failed';
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
          <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">Create account</h1>
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8">Join CampusHub to get started</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FloatingLabelInput
              label="Full name"
              type="text"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name')}
            />
            <div>
              <FloatingLabelInput
                label="Username (4+ chars, letters, numbers, underscore)"
                type="text"
                autoComplete="username"
                error={errors.username?.message}
                {...register('username')}
              />
              {usernameStatus.state !== 'idle' && usernameStatus.state !== 'loading' && (
                <p className={`mt-1.5 text-sm flex items-center gap-1.5 ${usernameStatus.state === 'available' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {usernameStatus.state === 'available' ? <Check size={14} /> : <X size={14} />}
                  {usernameStatus.message}
                </p>
              )}
              {usernameStatus.state === 'loading' && (
                <p className="mt-1.5 text-sm text-slate-500 flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin" /> Checking…
                </p>
              )}
            </div>
            <FloatingLabelInput
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <div>
              <PasswordInput
                label="Password"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password')}
              />
              <PasswordRules value={passwordValue} />
            </div>
            <PasswordInput
              label="Confirm password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <button
              type="submit"
              disabled={!isValid || authLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex items-center justify-center gap-2 transition-colors"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
                  <span>Creating account…</span>
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600 dark:text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
