import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ArrowLeft, Users, Calendar, Award, MapPin, ExternalLink, Star } from 'lucide-react';
import EventList from '../events/EventList';

const ClubDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClub();
    loadClubEvents();
  }, [id]);

  const loadClub = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getClub(id);
      setClub(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadClubEvents = async () => {
    try {
      const data = await api.clubEvents(id);
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load club events:', err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Club Not Found</h1>
          <p className="text-gray-600">The club you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Clubs</span>
      </button>

      <div className="max-w-6xl mx-auto">
        {/* Club Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div
            className={`bg-gradient-to-r ${club.gradient || 'from-blue-500 to-purple-500'} p-8 relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <Users className="w-full h-full" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{club.name}</h1>
                  <p className="text-white/90 text-lg">{club.description}</p>
                </div>
                <div className="text-right text-white/90">
                  <div className="flex items-center space-x-1 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="text-2xl font-bold">{club.members}</span>
                    <span>members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-5 h-5" />
                    <span className="text-2xl font-bold">{club.events}</span>
                    <span>events</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">About {club.name}</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {club.description || 'No description available for this club.'}
                </p>

                {/* Achievements */}
                {club.achievements && club.achievements.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-yellow-500" />
                      Recent Achievements
                    </h3>
                    <div className="space-y-3">
                      {club.achievements.map((achievement, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                          <span className="text-gray-700">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h3>
                  
                  {club.contact && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-800">Contact</p>
                        <p className="text-gray-600">{club.contact}</p>
                      </div>
                    </div>
                  )}

                  {club.instagram && (
                    <div className="flex items-center space-x-3">
                      <ExternalLink className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-800">Instagram</p>
                        <a 
                          href={club.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {club.instagram}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Club Information</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Category</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {club.category?.charAt(0).toUpperCase() + club.category?.slice(1) || 'General'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Members</span>
                      <span className="font-semibold text-gray-800">{club.members}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Events</span>
                      <span className="font-semibold text-gray-800">{club.events}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    {isAuthenticated ? (
                      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200">
                        Join Club
                      </button>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-600 mb-4">Please login to join this club</p>
                        <button
                          onClick={() => navigate('/login')}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
                        >
                          Login to Join
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Club Events */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Club Events</h2>
          {events.length > 0 ? (
            <EventList 
              events={events} 
              showRegisterButton={isAuthenticated}
            />
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No events scheduled for this club yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubDetailsPage;
