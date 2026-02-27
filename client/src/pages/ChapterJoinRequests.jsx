import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FeaturePage from '../components/layout/FeaturePage';
import { ArrowLeft, Check, X, Loader2, User } from 'lucide-react';

export default function ChapterJoinRequests() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [chapter, setChapter] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending');
  const [reviewingId, setReviewingId] = useState(null);

  const isHead = user && [].concat(user.organizationsOwned || []).some((oid) => (oid?._id || oid)?.toString() === id);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const [detail, reqData] = await Promise.all([
          api.getChapter(id).then((d) => d.chapter),
          api.listJoinRequests(id, { status: filter }).then((d) => d.requests || []),
        ]);
        if (!cancelled) {
          setChapter(detail);
          setRequests(reqData);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error?.message || err.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, filter]);

  const handleReview = async (requestId, status, remarks = '') => {
    setReviewingId(requestId);
    try {
      await api.reviewJoinRequest(id, requestId, status, remarks);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      showToast(status === 'approved' ? 'Request approved.' : 'Request rejected.', 'success');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Action failed', 'error');
    } finally {
      setReviewingId(null);
    }
  };

  if (!user || !isHead) {
    return (
      <FeaturePage title="Access denied" subtitle="">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">Only the chapter head can view join requests.</p>
          <button type="button" onClick={() => navigate(`/chapters/${id}`)} className="mt-4 text-blue-600 hover:underline">
            Back to chapter
          </button>
        </div>
      </FeaturePage>
    );
  }

  if (loading && !chapter) {
    return (
      <FeaturePage title="Loading…" subtitle="">
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      </FeaturePage>
    );
  }

  if (error && !chapter) {
    return (
      <FeaturePage title="Error" subtitle="">
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      </FeaturePage>
    );
  }

  return (
    <FeaturePage
      title={chapter?.name ? `Join requests – ${chapter.name}` : 'Join requests'}
      subtitle="Review and approve or reject requests."
    >
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(`/chapters/${id}`)}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600"
        >
          <ArrowLeft size={18} /> Back to chapter
        </button>

        <div className="flex gap-2">
          {['pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${
                filter === s ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {requests.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center text-slate-500 dark:text-slate-400">
            No {filter} requests.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{req.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{req.email}</p>
                    {(req.rollNumber || req.branch || req.year) && (
                      <p className="text-xs text-slate-500 mt-1">
                        {[req.rollNumber, req.branch, req.year].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {req.whyJoin && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{req.whyJoin}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      Submitted {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleReview(req._id, 'approved')}
                      disabled={reviewingId === req._id}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {reviewingId === req._id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReview(req._id, 'rejected')}
                      disabled={reviewingId === req._id}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                )}
                {req.status !== 'pending' && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    req.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {req.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </FeaturePage>
  );
}
