import React, { useRef, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Camera, Loader2, X } from 'lucide-react';

const ACCEPT = 'image/jpeg,image/jpg,image/png';
const MAX_SIZE = 2 * 1024 * 1024;

function resolveAvatarUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '') || '';
  return base ? `${base}${url.startsWith('/') ? url : `/${url}`}` : url;
}

export default function AvatarUpload() {
  const { user, updateUser } = useAuth();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const avatarUrl = resolveAvatarUrl(user?.profilePicUrl);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    if (file.size > MAX_SIZE) {
      setError('Image must be 2MB or smaller.');
      return;
    }
    const type = file.type?.toLowerCase();
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(type)) {
      setError('Only JPG and PNG are allowed.');
      return;
    }
    setUploading(true);
    try {
      const url = await api.uploadAvatar(file);
      updateUser({ profilePicUrl: url });
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setError('');
    setUploading(true);
    try {
      await api.patch('/users/me', { profilePicUrl: '' });
      updateUser({ profilePicUrl: '' });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to remove.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 border-2 border-slate-300 dark:border-slate-600">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-semibold text-slate-400">{user?.name?.[0]?.toUpperCase()}</span>
          )}
        </div>
        <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer hover:bg-blue-700 shadow-lg">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={handleFile}
            disabled={uploading}
          />
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
        </label>
      </div>
      <p className="text-xs text-slate-500">JPG or PNG, max 2MB</p>
      {avatarUrl && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={uploading}
          className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 disabled:opacity-50"
        >
          <X size={14} /> Remove photo
        </button>
      )}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
