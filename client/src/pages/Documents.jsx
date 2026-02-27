import React, { useEffect, useState } from 'react';
import FeaturePage from '../components/layout/FeaturePage';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [orgId, setOrgId] = useState('');
  const [eventId, setEventId] = useState('');
  const [organizations, setOrganizations] = useState([]);

  const canUpload = user?.role === 'admin' || user?.role === 'clubHead';

  useEffect(() => {
    loadDocuments();
    if (canUpload) {
      loadOrganizations();
    }
  }, [orgId, eventId, canUpload]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (orgId) params.orgId = orgId;
      if (eventId) params.eventId = eventId;
      const res = await api.get('/documents', { params });
      setDocuments(res.data?.data?.documents || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const res = await api.get('/organizations');
      setOrganizations(res.data?.data?.organizations || []);
    } catch {
      // non-critical
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) return;
    try {
      setUploading(true);
      setError('');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      if (orgId) formData.append('orgId', orgId);
      if (eventId) formData.append('eventId', eventId);

      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTitle('');
      setFile(null);
      // reload list
      loadDocuments();
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const groupedByOrg = documents.reduce((acc, doc) => {
    const key = doc.orgId?.name || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {});

  return (
    <FeaturePage
      title="Documents"
      subtitle="Browse shared resources by organization and event."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: filters + upload */}
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Filters</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Organization
                </label>
                <select
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Event (optional)
                </label>
                <input
                  type="text"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  placeholder="Paste event ID if needed"
                  className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {canUpload && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Upload document
              </h3>
              {error && (
                <p className="text-[11px] text-red-600 mb-2">{error}</p>
              )}
              <form onSubmit={handleUpload} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full mt-1 text-sm rounded-lg bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading…' : 'Upload'}
                </button>
              </form>
            </div>
          )}
        </aside>

        {/* Right: folder-like list */}
        <section className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Documents</h3>
              <span className="text-[11px] text-gray-500">
                {documents.length} file{documents.length === 1 ? '' : 's'}
              </span>
            </div>
            {loading ? (
              <div className="px-5 py-10 flex justify-center">
                <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="px-5 py-8 text-sm text-gray-500">
                No documents found for the selected filters.
              </div>
            ) : (
              <div className="px-4 py-4 space-y-4">
                {Object.entries(groupedByOrg).map(([orgName, docs]) => (
                  <div key={orgName} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-700">
                        {orgName}
                      </p>
                      <span className="text-[10px] text-gray-400">
                        {docs.length} item{docs.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {docs.map((doc) => (
                        <li
                          key={doc._id}
                          className="px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50"
                        >
                          <FileTypeIcon fileType={doc.fileType} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {doc.title}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {doc.fileName}{' '}
                              {doc.fileSize
                                ? `· ${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`
                                : ''}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Uploaded by {doc.uploadedBy?.name || 'Unknown'} ·{' '}
                              {doc.createdAt
                                ? new Date(doc.createdAt).toLocaleDateString()
                                : ''}
                            </p>
                          </div>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-blue-600 hover:text-blue-800"
                          >
                            Open
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </FeaturePage>
  );
};

const FileTypeIcon = ({ fileType }) => {
  const type = (fileType || '').toLowerCase();
  let label = 'DOC';
  let color = 'bg-slate-100 text-slate-700';

  if (type.includes('pdf')) {
    label = 'PDF';
    color = 'bg-red-50 text-red-600';
  } else if (type.includes('image')) {
    label = 'IMG';
    color = 'bg-amber-50 text-amber-600';
  } else if (type.includes('sheet') || type.includes('excel')) {
    label = 'XLS';
    color = 'bg-emerald-50 text-emerald-600';
  } else if (type.includes('presentation') || type.includes('powerpoint')) {
    label = 'PPT';
    color = 'bg-orange-50 text-orange-600';
  }

  return (
    <div
      className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-semibold ${color}`}
    >
      {label}
    </div>
  );
};

export default Documents;
