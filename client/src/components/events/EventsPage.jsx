import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import EventList from './EventList';
import EventFilters from './EventFilters';

const EventsPage = () => {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    date: ''
  });

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.listEvents(filters);
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadEvents();
    }, 300);
    
    loadUpcomingEvents();
    
    return () => clearTimeout(timeoutId);
  }, [filters, loadEvents]);

  const loadUpcomingEvents = async () => {
    try {
      const data = await api.upcomingEvents();
      setUpcomingEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load upcoming events:', err.message);
    }
  };

  const handleRegisterEvent = async (eventId) => {
    if (!isAuthenticated) {
      setError('Please login to register for events');
      return;
    }

    try {
      await api.registerForEvent(eventId);
      // Reload events to update registration status
      loadEvents();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Events</h1>
        <p className="text-gray-600">Discover and join exciting events happening around campus</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <EventFilters filters={filters} onFiltersChange={setFilters} />

      {upcomingEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Events</h2>
          <EventList 
            events={upcomingEvents} 
            onRegister={handleRegisterEvent}
            showRegisterButton={isAuthenticated}
          />
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">All Events</h2>
        <EventList 
          events={events} 
          onRegister={handleRegisterEvent}
          showRegisterButton={isAuthenticated}
        />
      </div>
    </div>
  );
};

export default EventsPage;
