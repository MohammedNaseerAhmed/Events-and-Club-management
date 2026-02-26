import React, { useEffect, useState } from 'react';
import FeaturePage from '../components/layout/FeaturePage';
import api from '../services/api';

const NetworkInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInvitations();
    loadSuggestions();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoadingInvites(true);
      setError('');
      const res = await api.get('/network/invitations');
      setInvitations(res.data?.data?.invitations || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to load invitations');
    } finally {
      setLoadingInvites(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const res = await api.get('/network/suggestions');
      setSuggestions(res.data?.data?.users || []);
    } catch {
      // Non-critical; ignore errors here
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleInviteAction = async (id, action) => {
    try {
      setError('');
      const endpoint =
        action === 'accept'
          ? `/network/invitations/${id}/accept`
          : `/network/invitations/${id}/reject`;
      await api.post(endpoint);
      setInvitations((prev) => prev.filter((inv) => inv._id !== id));
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to update invitation');
    }
  };

  const handleSendInvite = async (userId) => {
    try {
      setError('');
      await api.post('/network/invite', { recipientId: userId });
      setSuggestions((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, _invited: true } : u))
      );
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to send invite');
    }
  };

  return (
    <FeaturePage
      title="Network Invitations"
      subtitle="Manage connection requests and grow your campus network."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invitations column */}
        <section className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Pending invitations</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Accept or decline collaboration requests from other students.
                </p>
              </div>
              {invitations.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                  {invitations.length} pending
                </span>
              )}
            </div>

            {error && (
              <div className="px-5 py-3 text-xs text-red-600 bg-red-50 border-b border-red-100">
                {error}
              </div>
            )}

            {loadingInvites ? (
              <div className="px-5 py-8 flex justify-center">
                <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : invitations.length === 0 ? (
              <div className="px-5 py-6 text-sm text-gray-500">
                You don&apos;t have any pending invitations right now.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {invitations.map((inv) => (
                  <li key={inv._id} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {inv.requester?.profilePicUrl ? (
                          <img
                            src={inv.requester.profilePicUrl}
                            alt={inv.requester.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          inv.requester?.name?.[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {inv.requester?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          @{inv.requester?.username}
                        </p>
                        {inv.requester?.headline && (
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">
                            {inv.requester.headline}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleInviteAction(inv._id, 'accept')}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleInviteAction(inv._id, 'reject')}
                        className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Suggestions column */}
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">People you may know</h2>
              <p className="text-xs text-gray-500 mt-1">
                Suggested based on shared organizations and activity.
              </p>
            </div>
            {loadingSuggestions ? (
              <div className="px-5 py-6 flex justify-center">
                <div className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : suggestions.length === 0 ? (
              <div className="px-5 py-6 text-xs text-gray-500">
                No suggestions right now. Explore events and clubs to meet more people.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {suggestions.map((u) => (
                  <li key={u._id} className="px-5 py-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {u.profilePicUrl ? (
                          <img
                            src={u.profilePicUrl}
                            alt={u.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          u.name?.[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">@{u.username}</p>
                        {u.headline && (
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">
                            {u.headline}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendInvite(u._id)}
                      disabled={u._invited}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-500 text-emerald-600 hover:bg-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    >
                      {u._invited ? 'Invited' : 'Connect'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </FeaturePage>
  );
};

export default NetworkInvitations;
