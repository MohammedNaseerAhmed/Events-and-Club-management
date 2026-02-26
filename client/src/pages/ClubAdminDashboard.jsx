import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, Users, Award, Plus, Edit, Trash2, Eye, UserPlus, Save, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ClubAdminDashboard = () => {
  const { user, status } = useAuth();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingClub, setEditingClub] = useState(false);
  const [showRecruitmentForm, setShowRecruitmentForm] = useState(false);
  const [clubFormData, setClubFormData] = useState({});
  const [uploadingPoster, setUploadingPoster] = useState(false);

  useEffect(() => {
    if (user && user.role === 'club_admin') {
      loadClubData();
    }
  }, [user]);

  const loadClubData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load club details and events using club admin specific APIs
      const [clubData, eventsData] = await Promise.all([
        api.getClubAdminClub().catch(() => null),
        api.getClubAdminEvents().catch(() => [])
      ]);

      setClub(clubData);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      
      // Initialize club form data
      if (clubData) {
        setClubFormData({
          name: clubData.name || '',
          description: clubData.description || '',
          contact: clubData.contact || '',
          instagram: clubData.instagram || '',
          achievements: clubData.achievements || []
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      await api.createClubEvent(eventData);
      await loadClubData();
      setShowEventForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateEvent = async (eventId, eventData) => {
    try {
      await api.updateClubEvent(eventId, eventData);
      await loadClubData();
      setEditingEvent(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await api.deleteClubEvent(eventId);
      await loadClubData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateClub = async () => {
    try {
      await api.updateClubDetails(clubFormData);
      await loadClubData();
      setEditingClub(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRecruitUser = async (userData) => {
    try {
      await api.recruitUser(userData);
      setShowRecruitmentForm(false);
      alert('User recruitment email sent successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePosterUpload = async (eventId, file) => {
    try {
      setUploadingPoster(true);
      const formData = new FormData();
      formData.append('poster', file);
      
      const response = await api.uploadEventPoster(eventId, formData);
      await loadClubData(); // Reload events to show updated poster
      alert('Event poster uploaded successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingPoster(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'club_admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in as a club admin to access this page.</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Club Not Found</h1>
          <p className="text-gray-600">Unable to load club information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{club.name} Dashboard</h1>
          <p className="text-gray-600">Manage your club's events and details</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Club Members</p>
                <p className="text-2xl font-semibold text-gray-900">{club.members || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-semibold text-gray-900">{events.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Award className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {events.filter(event => event.startDate && new Date(event.startDate) > new Date()).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Event Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Event Management</h2>
            <button
              onClick={() => setShowEventForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </button>
          </div>

          {showEventForm && (
            <EventForm
              onSubmit={handleCreateEvent}
              onCancel={() => setShowEventForm(false)}
            />
          )}

          {editingEvent && (
            <EventForm
              event={editingEvent}
              onSubmit={(data) => handleUpdateEvent(editingEvent._id, data)}
              onCancel={() => setEditingEvent(null)}
            />
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venue
                  </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendees
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Poster
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.startDate
                        ? new Date(event.startDate).toLocaleDateString()
                        : 'TBA'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.venue || 'TBA'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof event.registrationCount === 'number'
                        ? event.registrationCount
                        : 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.poster ? (
                        <div className="flex items-center space-x-2">
                          <img 
                            src={`${API_BASE_URL}/uploads/${event.poster}`} 
                            alt="Event poster" 
                            className="w-12 h-12 object-cover rounded"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files[0] && handlePosterUpload(event._id, e.target.files[0])}
                            className="hidden"
                            id={`poster-upload-${event._id}`}
                          />
                          <label
                            htmlFor={`poster-upload-${event._id}`}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer text-xs"
                          >
                            {uploadingPoster ? 'Uploading...' : 'Change'}
                          </label>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files[0] && handlePosterUpload(event._id, e.target.files[0])}
                            className="hidden"
                            id={`poster-upload-${event._id}`}
                          />
                          <label
                            htmlFor={`poster-upload-${event._id}`}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer text-xs"
                          >
                            {uploadingPoster ? 'Uploading...' : 'Upload Poster'}
                          </label>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {events.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No events found. Create your first event!
            </div>
          )}
        </div>

        {/* Club Details Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Club Details</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowRecruitmentForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Recruit Users</span>
              </button>
              <button
                onClick={() => setEditingClub(!editingClub)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>{editingClub ? 'Cancel' : 'Edit Club'}</span>
              </button>
            </div>
          </div>

          {showRecruitmentForm && (
            <RecruitmentForm
              onSubmit={handleRecruitUser}
              onCancel={() => setShowRecruitmentForm(false)}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Club Name</label>
              <input
                type="text"
                value={editingClub ? clubFormData.name : club.name}
                onChange={editingClub ? (e) => setClubFormData({...clubFormData, name: e.target.value}) : undefined}
                disabled={!editingClub}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${editingClub ? 'bg-white' : 'bg-gray-50'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
              <input
                type="text"
                value={editingClub ? clubFormData.contact : (club.contact || '')}
                onChange={editingClub ? (e) => setClubFormData({...clubFormData, contact: e.target.value}) : undefined}
                disabled={!editingClub}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${editingClub ? 'bg-white' : 'bg-gray-50'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
              <input
                type="text"
                value={editingClub ? clubFormData.instagram : (club.instagram || '')}
                onChange={editingClub ? (e) => setClubFormData({...clubFormData, instagram: e.target.value}) : undefined}
                disabled={!editingClub}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${editingClub ? 'bg-white' : 'bg-gray-50'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Members Count</label>
              <input
                type="number"
                value={club.members || 0}
                disabled
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={editingClub ? clubFormData.description : (club.description || '')}
                onChange={editingClub ? (e) => setClubFormData({...clubFormData, description: e.target.value}) : undefined}
                disabled={!editingClub}
                rows={3}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${editingClub ? 'bg-white' : 'bg-gray-50'}`}
              />
            </div>
          </div>

          {editingClub && (
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingClub(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleUpdateClub}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Event Form Component
const EventForm = ({ event, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    startDate: event?.startDate
      ? new Date(event.startDate).toISOString().slice(0, 16)
      : '',
    endDate: event?.endDate
      ? new Date(event.endDate).toISOString().slice(0, 16)
      : '',
    venue: event?.venue || '',
    capacity: event?.capacity || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {event ? 'Edit Event' : 'Create New Event'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {event ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Recruitment Form Component
const RecruitmentForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recruit New Users</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recruitment Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Join our amazing club! We have exciting events and activities planned..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Send Recruitment Email
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClubAdminDashboard;
