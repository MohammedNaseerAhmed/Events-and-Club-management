import React, { useState } from 'react';
import api from '../../services/api';

const MIN_LENGTH = 8;
const HAS_LETTER_AND_NUMBER = /^(?=.*[A-Za-z])(?=.*[0-9])/;

function ChangePasswordForm({ onSuccess }) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validate = () => {
    if (!form.currentPassword?.trim()) {
      setError('Current password is required.');
      return false;
    }
    if (!form.newPassword) {
      setError('New password is required.');
      return false;
    }
    if (form.newPassword.length < MIN_LENGTH) {
      setError(`New password must be at least ${MIN_LENGTH} characters.`);
      return false;
    }
    if (!HAS_LETTER_AND_NUMBER.test(form.newPassword)) {
      setError('New password must contain at least one letter and one number.');
      return false;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirmation do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await api.patch('/users/me/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onSuccess?.('Password changed successfully.');
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current password</label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          value={form.currentPassword}
          onChange={handleChange}
          autoComplete="current-password"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New password</label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={handleChange}
          autoComplete="new-password"
          minLength={MIN_LENGTH}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-slate-500">At least 8 characters, one letter and one number.</p>
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm new password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Updating…' : 'Change password'}
      </button>
    </form>
  );
}

export default ChangePasswordForm;
