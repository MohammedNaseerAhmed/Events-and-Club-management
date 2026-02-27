import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Loader2 } from 'lucide-react';

const ClubAdminLoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData.email, formData.password);
      
      // Check if user is a club admin
      if (response.user.role === 'club_admin') {
        navigate('/club-admin/dashboard');
      } else {
        logout();
        setError('Access denied. Only club administrators can access this page.');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
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

          <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
            Club Admin Login
          </h1>
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8">
            Sign in to manage your club&apos;s events and details
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-xl px-3 py-3 border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl px-3 py-3 border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>

            <p className="text-center text-slate-600 text-sm">
              Not a club admin?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:underline">
                Student Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClubAdminLoginForm;
