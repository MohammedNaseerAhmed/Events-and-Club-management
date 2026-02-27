import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Building2, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmailOtp, resendVerificationOtp, authLoading } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await verifyEmailOtp(email.trim(), otp.trim());
      showToast('Email verified successfully.', 'success');
      navigate('/feed', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Verification failed';
      showToast(msg, 'error');
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      showToast('Enter your email first.', 'error');
      return;
    }
    try {
      setResending(true);
      await resendVerificationOtp(email.trim());
      showToast('OTP resent successfully.', 'success');
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to resend OTP';
      showToast(msg, 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">Verify your email</h1>
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8">
            Enter the OTP sent to your email address.
          </p>

          <form onSubmit={handleVerify} className="space-y-5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl px-3 py-3 border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP"
              className="w-full rounded-xl px-3 py-3 border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 transition-colors"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
                  <span>Verifying...</span>
                </>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-blue-600 hover:underline disabled:opacity-50"
            >
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
            <Link to="/login" className="text-slate-600 hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
