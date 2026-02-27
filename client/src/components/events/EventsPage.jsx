import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import EventList from './EventList';
import EventFilters from './EventFilters';

const EventsPage = () => {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    date: ''
  });

  const loadEvents = async (activeFilters, showInitialLoader = false) => {
    try {
      if (showInitialLoader) setInitialLoading(true);
      else setIsFiltering(true);
      setError('');
      const data = await api.listEvents(activeFilters);
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setEvents([]);
    } finally {
      if (showInitialLoader) setInitialLoading(false);
      else setIsFiltering(false);
    }
  };

  useEffect(() => {
    // First paint: fetch all events once with full-page loader.
    loadEvents(filters, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Live filter updates: debounce and keep existing list visible.
    const timeoutId = setTimeout(() => {
      loadEvents(filters, false);
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.search, filters.date]);

  useEffect(() => {
    // Upcoming events are independent from list filters.
    loadUpcomingEvents();
  }, []);

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
      loadEvents(filters, false);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (initialLoading) {
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">All Events</h2>
          {isFiltering && <span className="text-sm text-gray-500">Updating...</span>}
        </div>
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
