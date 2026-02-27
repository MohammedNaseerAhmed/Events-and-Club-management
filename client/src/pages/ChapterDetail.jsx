import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FeaturePage from '../components/layout/FeaturePage';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft, Users, Calendar, Mail, Instagram, Linkedin, Twitter, Youtube,
  Target, Image as ImageIcon, UserPlus, Loader2,   ExternalLink, UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const joinSchema = z.object({
  name: z.string().min(2, 'Name is required').max(120),
  rollNumber: z.string().max(40).optional(),
  email: z.string().min(1, 'Email is required').email('Valid email required'),
  phone: z.string().max(20).optional(),
  branch: z.string().max(80).optional(),
  year: z.string().max(20).optional(),
  whyJoin: z.string().max(2000).optional(),
});

const SOCIAL_ICONS = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube,
  email: Mail,
};

export default function ChapterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [chapter, setChapter] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      rollNumber: '', phone: '', branch: '', year: '', whyJoin: '',
    },
  });

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        setError('');
        const data = await api.getChapter(id);
        if (cancelled) return;
        setChapter(data.chapter);
        setUpcomingEvents(data.upcomingEvents || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error?.message || err.message || 'Failed to load');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  const onJoinSubmit = async (formData) => {
    setJoinSubmitting(true);
    try {
      await api.submitJoinRequest(id, formData);
      setJoinSuccess(true);
      showToast('Join request submitted successfully.', 'success');
    } catch (err) {
      showToast(err.response?.data?.error?.message || err.message || 'Request failed', 'error');
    } finally {
      setJoinSubmitting(false);
    }
  };

  if (loading) {
    return (
      <FeaturePage title="Loading…" subtitle="">
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      </FeaturePage>
    );
  }

  if (error || !chapter) {
    return (
      <FeaturePage title="Not found" subtitle="">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">{error || 'This chapter or club could not be found.'}</p>
          <button
            type="button"
            onClick={() => navigate('/chapters')}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Chapters
          </button>
        </div>
      </FeaturePage>
    );
  }

  const socialLinks = chapter.socialLinks || {};
  const isHead = user && [].concat(user.organizationsOwned || []).some((oid) => (oid?._id || oid)?.toString() === id);

  return (
    <FeaturePage title={chapter.name} subtitle={chapter.shortName || chapter.type || 'Chapter'}>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <ArrowLeft size={18} /> Back
          </button>
          {isHead && (
            <div className="flex items-center gap-2">
              <Link
                to={`/chapters/${id}/requests`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                <UserCheck size={18} /> Join requests
              </Link>
            </div>
          )}
        </div>

        {/* Banner / Hero */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-[21/9] max-h-64">
          {chapter.bannerUrl ? (
            <img src={chapter.bannerUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {chapter.logoUrl ? (
                <img src={chapter.logoUrl} alt="" className="max-h-24 object-contain" />
              ) : (
                <Users className="w-16 h-16 text-slate-400" />
              )}
            </div>
          )}
        </div>

        {/* About */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">About</h2>
          {chapter.mission && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Mission</h3>
              <p className="text-slate-700 dark:text-slate-300">{chapter.mission}</p>
            </div>
          )}
          {chapter.vision && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Vision</h3>
              <p className="text-slate-700 dark:text-slate-300">{chapter.vision}</p>
            </div>
          )}
          {chapter.description && (
            <p className="text-slate-700 dark:text-slate-300">{chapter.description}</p>
          )}
          {chapter.history && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">History</h3>
              <p className="text-slate-700 dark:text-slate-300">{chapter.history}</p>
            </div>
          )}
          {chapter.impact && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Impact</h3>
              <p className="text-slate-700 dark:text-slate-300">{chapter.impact}</p>
            </div>
          )}
        </section>

        {/* Objectives */}
        {chapter.objectives && chapter.objectives.length > 0 && (
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Target size={20} /> Objectives
            </h2>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              {chapter.objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Upcoming events */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar size={20} /> Events & Activities
          </h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">No upcoming events at the moment.</p>
          ) : (
            <ul className="space-y-3">
              {upcomingEvents.map((ev) => (
                <li key={ev._id}>
                  <Link
                    to={`/events/${ev._id}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <span className="font-medium text-slate-900 dark:text-white">{ev.title}</span>
                    <span className="text-sm text-slate-500">
                      {new Date(ev.startDate).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Social */}
        {(Object.keys(socialLinks).length > 0 && Object.values(socialLinks).some(Boolean)) && (
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Connect</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(socialLinks).map(([key, value]) => {
                if (!value) return null;
                const Icon = SOCIAL_ICONS[key];
                const href = key === 'email' ? `mailto:${value}` : value;
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                  >
                    {Icon && <Icon size={18} />}
                    <span className="capitalize">{key}</span>
                    <ExternalLink size={14} />
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Committee */}
        {chapter.committee && chapter.committee.length > 0 && (
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users size={20} /> Committee
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapter.committee.map((member, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4"
                >
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium">
                      {member.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{member.name}</p>
                    {member.role && <p className="text-sm text-slate-500 dark:text-slate-400">{member.role}</p>}
                    {member.contact && <p className="text-xs text-slate-500">{member.contact}</p>}
                    {member.linkedIn && (
                      <a href={member.linkedIn} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                        LinkedIn <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {chapter.gallery && chapter.gallery.length > 0 && (
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon size={20} /> Gallery
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {chapter.gallery.map((img, i) => (
                <a
                  key={i}
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-90"
                >
                  <img src={img.url} alt={img.caption || 'Gallery'} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Join */}
        {chapter.joinEnabled && (
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <UserPlus size={20} /> Join Us
            </h2>
            {joinSuccess ? (
              <p className="text-emerald-600 dark:text-emerald-400 font-medium">Your request has been submitted. The team will get back to you soon.</p>
            ) : (
              <form onSubmit={handleSubmit(onJoinSubmit)} className="max-w-xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
                    <input {...register('name')} className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2" />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Roll Number</label>
                    <input {...register('rollNumber')} className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                    <input type="email" {...register('email')} className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2" />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                    <input {...register('phone')} className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Branch</label>
                    <input {...register('branch')} className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Year</label>
                    <input {...register('year')} className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Why do you want to join?</label>
                  <textarea {...register('whyJoin')} rows={3} className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2" />
                </div>
                <button
                  type="submit"
                  disabled={joinSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {joinSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Submit Request
                </button>
              </form>
            )}
          </section>
        )}
      </div>
    </FeaturePage>
  );
}
