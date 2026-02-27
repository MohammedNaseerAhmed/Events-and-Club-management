import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import FeaturePage from '../components/layout/FeaturePage';
import api from '../services/api';
import { Search, Users, Calendar, ArrowRight, Building2, Sparkles } from 'lucide-react';

const TABS = [
  { id: '', label: 'All' },
  { id: 'chapter', label: 'Professional Chapters' },
  { id: 'society', label: 'Societies' },
  { id: 'club', label: 'Clubs' },
  { id: 'celebration', label: 'Campus Celebrations' },
];

function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
      <div className="h-32 bg-slate-200 dark:bg-slate-700" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        <div className="flex gap-4 pt-2">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
}

function ChapterCard({ item }) {
  const typeLabel = item.type || 'Club';
  return (
    <Link
      to={`/chapters/${item._id}`}
      className="group block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200"
    >
      <div className="aspect-[2/1] bg-gradient-to-br from-blue-500/20 to-violet-500/20 dark:from-blue-600/30 dark:to-violet-600/30 relative overflow-hidden">
        {item.bannerUrl ? (
          <img src={item.bannerUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {item.logoUrl ? (
              <img src={item.logoUrl} alt="" className="w-16 h-16 object-contain" />
            ) : (
              <Building2 className="w-16 h-16 text-slate-400 dark:text-slate-500" />
            )}
          </div>
        )}
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300">
          {typeLabel}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
          {item.name}
        </h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">
          {item.description || 'No description.'}
        </p>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Users size={14} /> {item.activeMembersCount ?? 0} members
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} /> {item.upcomingEventsCount ?? 0} upcoming
          </span>
        </div>
        <div className="mt-4 flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium">
          View Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

export default function Chapters() {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const result = await api.listChapters({
        category: category || undefined,
        search: search || undefined,
        page,
        limit: 24,
      });
      setData(result);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to load');
      setData({ items: [], total: 0, page: 1, pages: 0 });
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    load(1);
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <FeaturePage
      title="Chapters & Clubs"
      subtitle="Discover professional chapters, societies, clubs, and campus celebrations."
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="search"
              placeholder="Search by name or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search chapters"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Category filter">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={category === tab.id}
              onClick={() => setCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                category === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center">
            <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No chapters or clubs match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((item) => (
              <ChapterCard key={item._id} item={item} />
            ))}
          </div>
        )}

        {!loading && data.pages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              type="button"
              disabled={data.page <= 1}
              onClick={() => load(data.page - 1)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-slate-600 dark:text-slate-400">
              Page {data.page} of {data.pages}
            </span>
            <button
              type="button"
              disabled={data.page >= data.pages}
              onClick={() => load(data.page + 1)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </FeaturePage>
  );
}
