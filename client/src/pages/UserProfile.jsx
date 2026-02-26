import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FeaturePage from '../components/layout/FeaturePage';
import api from '../services/api';

const UserProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/users/${username}`);
        setProfile(res.data?.data?.user || null);
      } catch (err) {
        setError(err.response?.data?.error?.message || err.message || 'Failed to load profile');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    if (username) load();
  }, [username]);

  if (loading) {
    return (
      <FeaturePage title={`@${username}`} subtitle="Public profile">
        <div className="flex justify-center items-center min-h-40">
          <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </FeaturePage>
    );
  }

  if (error || !profile) {
    return (
      <FeaturePage title={`@${username}`} subtitle="Public profile">
        <div className="bg-white rounded-xl border border-red-200 p-5 text-sm text-red-600">
          {error || 'User not found'}
        </div>
      </FeaturePage>
    );
  }

  const initials = profile.name?.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <FeaturePage
      title={profile.name}
      subtitle={`@${profile.username}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: core profile */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xl font-semibold overflow-hidden">
              {profile.profilePicUrl ? (
                <img
                  src={profile.profilePicUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials || profile.username[0]?.toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{profile.name}</h1>
              <p className="text-sm text-gray-500">@{profile.username}</p>
              {profile.headline && (
                <p className="mt-1 text-sm text-gray-600">{profile.headline}</p>
              )}
            </div>
          </div>

          {profile.bio && (
            <div className="mt-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Bio
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-600">
            <div className="bg-slate-50 rounded-xl px-3 py-2">
              <p className="font-semibold text-gray-800 text-[11px]">Role</p>
              <p className="mt-0.5 capitalize">{profile.role || 'student'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl px-3 py-2">
              <p className="font-semibold text-gray-800 text-[11px]">Connections</p>
              <p className="mt-0.5">{profile.connections?.length || 0}</p>
            </div>
          </div>
        </section>

        {/* Right: orgs + basic activity stub */}
        <section className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">
              Organizations
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.organizationsOwned?.map((org) => (
                <span
                  key={org._id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                >
                  {org.name}
                </span>
              ))}
              {profile.followingOrgs?.map((org) => (
                <span
                  key={org._id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700 border border-slate-100"
                >
                  {org.name}
                </span>
              ))}
              {(!profile.organizationsOwned?.length && !profile.followingOrgs?.length) && (
                <p className="text-xs text-gray-500">
                  This user is not associated with any organizations yet.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-1">
              Recent activity
            </h2>
            <p className="text-xs text-gray-500">
              Activity such as posts and event registrations will appear here as the platform grows.
            </p>
          </div>
        </section>
      </div>
    </FeaturePage>
  );
};

export default UserProfile;
