import React from 'react';
import { Calendar, Clock, MapPin, Users, Star, ArrowRight } from 'lucide-react';

const EventCard = ({ event, onRegister, showRegisterButton = false }) => {
  const getCategoryColor = (category) => {
    const colors = {
      technical: 'bg-blue-100 text-blue-800',
      cultural: 'bg-purple-100 text-purple-800',
      sports: 'bg-green-100 text-green-800',
      workshop: 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const start = event.startDate ? new Date(event.startDate) : null;

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group ${
        event.featured ? 'ring-2 ring-purple-200' : ''
      }`}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image || '/placeholder.png'}
          alt={event.title || 'Event'}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        {event.featured && (
          <div className="absolute top-4 left-4 flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            <Star className="w-4 h-4" />
            <span>Featured</span>
          </div>
        )}
        <div
          className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(event.category)}`}
        >
          {event.category ? event.category.charAt(0).toUpperCase() + event.category.slice(1) : 'General'}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-200">
          {event.title || 'Untitled Event'}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description || 'No description available'}</p>
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            <span className="text-sm">
              {start ? start.toLocaleDateString() : 'TBA'}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-purple-500" />
            <span className="text-sm">
              {start
                ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'To be announced'}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-green-500" />
            <span className="text-sm">{event.venue || 'Venue TBA'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2 text-orange-500" />
            <span className="text-sm">
              {event.clubId?.name || event.organizer || 'Organizer TBA'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-green-600">Free</div>
          {showRegisterButton && onRegister && (
            <button 
              onClick={() => onRegister(event._id)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <span>Register</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const EventList = ({ events, onRegister, showRegisterButton = false }) => {
  if (events.length === 0)
    return <p className="text-center text-gray-600 mt-8">No events found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map(event => (
        <EventCard 
          key={event._id} 
          event={event} 
          onRegister={onRegister}
          showRegisterButton={showRegisterButton}
        />
      ))}
    </div>
  );
};

export default EventList;
