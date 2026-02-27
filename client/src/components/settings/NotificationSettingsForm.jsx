import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function NotificationSettingsForm({ onSuccess }) {
  const { user, updateUser } = useAuth();
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.notificationSettings) {
      setEmail(user.notificationSettings.email !== false);
      setPush(user.notificationSettings.push !== false);
    }
  }, [user]);

  const updateToggle = async (field, value) => {
    setError('');
    setLoading(true);
    const payload = field === 'email' ? { email: value, push } : { email, push: value };
    if (field === 'email') setEmail(value);
    else setPush(value);
    try {
      const res = await api.patch('/users/me/notifications', payload);
      const updated = res.data?.data?.user;
      if (updated) updateUser(updated);
      onSuccess?.('Notification preferences updated.');
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to update.');
      if (field === 'email') setEmail(!value);
      else setPush(!value);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-md">
      <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div>
          <p className="font-medium text-slate-900 dark:text-white">Email notifications</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Receive notifications by email.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={email}
          onClick={() => !loading && updateToggle('email', !email)}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
            email ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${email ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div>
          <p className="font-medium text-slate-900 dark:text-white">Push notifications</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Receive push notifications in the app.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={push}
          onClick={() => !loading && updateToggle('push', !push)}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
            push ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${push ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export default NotificationSettingsForm;
