import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function PrivacySettingsForm({ onSuccess }) {
  const { user, updateUser } = useAuth();
  const [profileVisible, setProfileVisible] = useState(true);
  const [activityVisible, setActivityVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.privacySettings) {
      setProfileVisible(user.privacySettings.profileVisible !== false);
      setActivityVisible(user.privacySettings.activityVisible !== false);
    }
  }, [user]);

  const updateToggle = async (field, value) => {
    setError('');
    setLoading(true);
    const payload = field === 'profileVisible'
      ? { profileVisible: value, activityVisible: activityVisible }
      : { profileVisible: profileVisible, activityVisible: value };
    if (field === 'profileVisible') setProfileVisible(value);
    else setActivityVisible(value);
    try {
      const res = await api.patch('/users/me/privacy', payload);
      const updated = res.data?.data?.user;
      if (updated) updateUser(updated);
      onSuccess?.('Privacy settings updated.');
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to update.');
      if (field === 'profileVisible') setProfileVisible(!value);
      else setActivityVisible(!value);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-md">
      <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div>
          <p className="font-medium text-slate-900 dark:text-white">Profile visible</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Others can view your profile and @username.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={profileVisible}
          onClick={() => !loading && updateToggle('profileVisible', !profileVisible)}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
            profileVisible ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${profileVisible ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div>
          <p className="font-medium text-slate-900 dark:text-white">Activity visible</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Show your activity (e.g. events, posts) to others.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={activityVisible}
          onClick={() => !loading && updateToggle('activityVisible', !activityVisible)}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
            activityVisible ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${activityVisible ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export default PrivacySettingsForm;
