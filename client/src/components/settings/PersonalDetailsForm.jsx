import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AvatarUpload from './AvatarUpload';

const NAME_MIN = 2;
const NAME_MAX = 80;
const BIO_MAX = 500;
const HEADLINE_MAX = 200;

function PersonalDetailsForm({ onSuccess }) {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    bio: '',
    headline: '',
    profilePicUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        bio: user.bio ?? '',
        headline: user.headline ?? '',
        profilePicUrl: user.profilePicUrl ?? '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validate = () => {
    const name = form.name?.trim();
    if (!name) {
      setError('Name is required.');
      return false;
    }
    if (name.length < NAME_MIN || name.length > NAME_MAX) {
      setError(`Name must be between ${NAME_MIN} and ${NAME_MAX} characters.`);
      return false;
    }
    if ((form.bio ?? '').length > BIO_MAX) {
      setError(`Bio must be at most ${BIO_MAX} characters.`);
      return false;
    }
    if ((form.headline ?? '').length > HEADLINE_MAX) {
      setError(`Headline must be at most ${HEADLINE_MAX} characters.`);
      return false;
    }
    if (form.profilePicUrl?.trim()) {
      try {
        new URL(form.profilePicUrl);
      } catch {
        setError('Profile picture URL must be a valid URL.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        bio: (form.bio ?? '').trim(),
        headline: (form.headline ?? '').trim(),
        profilePicUrl: (form.profilePicUrl ?? '').trim(),
      };
      const res = await api.patch('/users/me', payload);
      const updated = res.data?.data?.user;
      if (updated) updateUser(updated);
      onSuccess?.('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Profile photo</p>
        <AvatarUpload />
      </div>
      {user?.username != null && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
            <span>@{user.username}</span>
            <span className="text-slate-400 dark:text-slate-500">(cannot be changed)</span>
          </div>
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          minLength={NAME_MIN}
          maxLength={NAME_MAX}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Your display name"
        />
        <p className="mt-1 text-xs text-slate-500">{form.name.length}/{NAME_MAX}</p>
      </div>
      <div>
        <label htmlFor="headline" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Headline</label>
        <input
          id="headline"
          name="headline"
          type="text"
          value={form.headline}
          onChange={handleChange}
          maxLength={HEADLINE_MAX}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Short headline"
        />
        <p className="mt-1 text-xs text-slate-500">{form.headline.length}/{HEADLINE_MAX}</p>
      </div>
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
        <textarea
          id="bio"
          name="bio"
          value={form.bio}
          onChange={handleChange}
          maxLength={BIO_MAX}
          rows={4}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="A short bio"
        />
        <p className="mt-1 text-xs text-slate-500">{form.bio.length}/{BIO_MAX}</p>
      </div>
      <div>
        <label htmlFor="profilePicUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Profile picture URL</label>
        <input
          id="profilePicUrl"
          name="profilePicUrl"
          type="url"
          value={form.profilePicUrl}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://..."
        />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}

export default PersonalDetailsForm;
