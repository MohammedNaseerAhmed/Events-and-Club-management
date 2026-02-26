import React, { useEffect, useState } from 'react';
import FeaturePage from '../components/layout/FeaturePage';
import api from '../services/api';

const PAGE_SIZE = 10;

const Feed = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    loadFeed(1, true);
    loadUpcomingEvents();
  }, []);

  const loadFeed = async (pageToLoad = 1, replace = false) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/feed', {
        params: { page: pageToLoad, limit: PAGE_SIZE },
      });
      const data = res.data?.data || {};
      const newItems = data.items || [];
      setItems((prev) => (replace ? newItems : [...prev, ...newItems]));
      setPage(pageToLoad);
      setHasMore(pageToLoad < (data.pages || 1));
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingEvents = async () => {
    try {
      const res = await api.get('/events', {
        params: { page: 1, limit: 5, from: new Date().toISOString() },
      });
      setUpcomingEvents(res.data?.data?.events || []);
    } catch {
      // Silent failure – sidebar is non-critical
    }
  };

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    loadFeed(page + 1);
  };

  return (
    <FeaturePage
      title="Feed"
      subtitle="Mixed stream of approved events, posts, and campus announcements."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main feed */}
        <div className="lg:col-span-2 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {items.length === 0 && !loading && !error && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-600">
              No activity yet. Follow organizations and register for events to see updates here.
            </div>
          )}

          {items.map((item) =>
            item._feedType === 'event' ? (
              <EventFeedCard key={`event-${item._id}`} event={item} />
            ) : (
              <PostFeedCard key={`post-${item._id}`} post={item} />
            )
          )}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-full border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </div>

        {/* Right sidebar – upcoming events */}
        <aside className="space-y-4">
          <div className="bg-gradient-to-br from-blue-600/90 to-violet-600/90 rounded-2xl p-5 text-white shadow-lg">
            <h3 className="text-sm font-semibold tracking-wide uppercase opacity-80">
              Your campus hub
            </h3>
            <p className="mt-2 text-base font-medium">
              Stay on top of what&apos;s happening across organizations.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                Upcoming events
              </h3>
              {upcomingEvents.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                  {upcomingEvents.length} listed
                </span>
              )}
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingEvents.length === 0 && (
                <div className="px-5 py-4 text-xs text-gray-500">
                  No upcoming events found. Check back soon.
                </div>
              )}
              {upcomingEvents.map((event) => (
                <div key={event._id} className="px-5 py-4 flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-xl bg-blue-50 text-blue-600 text-[11px] font-semibold flex flex-col items-center justify-center">
                    <span>{new Date(event.startDate).toLocaleString(undefined, { month: 'short' }).toUpperCase()}</span>
                    <span className="text-[13px]">
                      {new Date(event.startDate).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {event.clubId?.name}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(event.startDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </FeaturePage>
  );
};

const EventFeedCard = ({ event }) => {
  const start = new Date(event.startDate);
  const end = event.endDate ? new Date(event.endDate) : null;

  return (
    <article className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="px-5 py-4 flex items-start gap-4">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center text-[11px] font-semibold">
          <span>{start.toLocaleString(undefined, { month: 'short' }).toUpperCase()}</span>
          <span className="text-[14px]">{start.getDate()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {event.title}
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
              Event
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">
            {event.description}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500">
            {event.clubId?.name && (
              <span className="inline-flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-blue-400" />
                {event.clubId.name}
              </span>
            )}
            <span>
              {start.toLocaleDateString()} ·{' '}
              {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {end &&
                ` – ${end.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}`}
            </span>
            {typeof event.registrationCount === 'number' && (
              <span>
                {event.registrationCount} / {event.capacity || '∞'} registered
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

const PostFeedCard = ({ post }) => {
  const author = post.authorId;

  return (
    <article className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white flex items-center justify-center text-xs font-semibold">
            {author?.profilePicUrl ? (
              <img
                src={author.profilePicUrl}
                alt={author.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              author?.name?.[0]?.toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {author?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  @{author?.username}
                </p>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-600">
                {post.postType === 'announcement' ? 'Announcement' : 'Post'}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
              {post.content}
            </p>
            {post.targetOrgId?.name && (
              <p className="mt-2 text-[11px] text-gray-500">
                Posted to <span className="font-medium">{post.targetOrgId.name}</span>
              </p>
            )}
            <div className="mt-3 flex items-center gap-4 text-[11px] text-gray-500">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-gray-100 transition-colors"
              >
                <span>👍</span>
                <span>{post.likes?.length || 0}</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-gray-100 transition-colors"
              >
                <span>💬</span>
                <span>{post.comments?.length || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default Feed;
