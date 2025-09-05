import React from 'react';
import { Users, ExternalLink, MapPin, Calendar as CalendarIcon, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ClubList = ({ clubs = [] }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleJoinClub = (clubId) => {
    if (!isAuthenticated) return navigate('/login');
    alert(`You joined club ${clubId}`); // TODO: integrate join API
  };

  const handleViewEvents = (clubId) => {
    if (!isAuthenticated) return navigate('/login');
    navigate(`/clubs/${clubId}`);
  };

  if (clubs.length === 0) {
    return <div className="text-center py-20 text-gray-600">No clubs found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {clubs.map(club => {
            const Icon = club.icon || Users;
            return (
              <div
                key={club._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                <div
                  className={`bg-gradient-to-r ${club.gradient || 'from-blue-500 to-purple-500'} p-6 relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                    <Icon className="w-full h-full" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{club.name}</h3>
                    <div className="flex items-center space-x-4 text-white/80">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{club.members} members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-sm">{club.events} events</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-6 leading-relaxed">{club.description}</p>

                  {/* Achievements */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <Award className="w-4 h-4 mr-2 text-yellow-500" /> Recent Achievements
                    </h4>
                    <div className="space-y-2">
                      {club.achievements?.map((ach, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">{ach}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="text-sm">{club.contact}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <ExternalLink className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="text-sm">{club.instagram}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleJoinClub(club._id)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      Join Club
                    </button>
                    <button
                      onClick={() => handleViewEvents(club._id)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      View Events
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
    </div>
  );
};

export default ClubList;
