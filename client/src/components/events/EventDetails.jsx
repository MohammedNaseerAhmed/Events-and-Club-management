import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import axios from 'axios';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`/api/events/${id}`);
        setEvent(response.data.data);
      } catch {
        setError('Failed to load event details.');
      }
      setLoading(false);
    };

    fetchEvent();
  }, [id]);

  if (loading) return <p className="text-center py-20">Loading event details...</p>;
  if (error) return <p className="text-center py-20 text-red-500">{error}</p>;
  if (!event) return <p className="text-center py-20">Event not found.</p>;

  return (
    <section id="event-details" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-6">{event.title}</h1>
        {event.image && (
          <img
            src={event.image}
            alt={event.title}
            className="w-full rounded-lg shadow mb-8 object-cover max-h-96"
          />
        )}
        <p className="text-lg text-gray-700 mb-8">{event.description || 'No description available.'}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-500" />
            <span>{event.date ? new Date(event.date).toLocaleDateString() : 'Date TBA'}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-purple-500" />
            <span>{event.time || 'Time TBA'}</span>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-green-500" />
            <span>{event.venue || 'Venue TBA'}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-orange-500" />
            <span>{event.organizer || 'Organizer TBA'}</span>
          </div>
        </div>
        <button
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
          onClick={() => alert('Register functionality coming soon!')}
        >
          <span>Register</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

export default EventDetails;
