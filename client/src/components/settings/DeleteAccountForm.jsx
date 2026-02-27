import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle } from 'lucide-react';

function DeleteAccountForm() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteRequest = () => {
    setPassword('');
    setError('');
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!password.trim()) {
      setError('Please enter your password to confirm.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.delete('/users/me', { data: { password } });
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to delete account.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setPassword('');
    setError('');
  };

  if (!modalOpen) {
    return (
      <div className="max-w-md space-y-4">
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          type="button"
          onClick={handleDeleteRequest}
          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
        >
          Delete account
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-md space-y-4">
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          type="button"
          onClick={handleDeleteRequest}
          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
        >
          Delete account
        </button>
      </div>

      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} aria-hidden="true" />
        <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete account</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                This will permanently delete your account and all data. Enter your password to confirm.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="delete-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Your password
            </label>
            <input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password to confirm"
              autoComplete="current-password"
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
            />
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Deleting…' : 'Delete my account'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeleteAccountForm;
