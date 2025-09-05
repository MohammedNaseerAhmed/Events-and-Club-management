import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import axios from 'axios'; // or use your preferred fetch method

const CalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventDates, setEventDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch events for the current month from backend
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError("");
      try {
        // Extract year and month (1-based) from currentMonth
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;

        // Replace with your backend events monthly API endpoint
        const response = await axios.get(`/api/calendar/monthly?year=${year}&month=${month}`);
        
        // Expected response: array of events with date, title, time, and type
        // Transform to match structure: [{ date: number, events: [...] }, ...]
        const eventsByDate = response.data.data.reduce((acc, event) => {
          const eventDate = new Date(event.date).getDate();
          const existing = acc.find(e => e.date === eventDate);
          if (existing) {
            existing.events.push({
              title: event.title,
              time: new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: event.type || 'technical'
            });
          } else {
            acc.push({
              date: eventDate,
              events: [{
                title: event.title,
                time: new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: event.type || 'technical'
              }]
            });
          }
          return acc;
        }, []);
        
        setEventDates(eventsByDate);
      } catch (err) {
        setError("Failed to load events.");
      }
      setLoading(false);
    };

    fetchEvents();
  }, [currentMonth]);

  // (Keep your existing helper functions like getDaysInMonth, getFirstDayOfMonth, hasEvents, getEventsForDate, getEventTypeColor)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const hasEvents = (date) => {
    return eventDates.some(eventDate => eventDate.date === date);
  };

  const getEventsForDate = (date) => {
    return eventDates.find(eventDate => eventDate.date === date)?.events || [];
  };

  const getEventTypeColor = (type) => {
    const colors = {
      technical: 'bg-blue-500',
      cultural: 'bg-purple-500',
      sports: 'bg-green-500',
      workshop: 'bg-orange-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <section id="calendar" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Event Calendar
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with all upcoming events and important dates
          </p>
          {error && <p className="text-red-600 mt-2">{error}</p>}
          {loading && <p className="text-gray-500 mt-2">Loading events...</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={previousMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h3 className="text-2xl font-bold text-gray-800">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center py-3 font-semibold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty days */}
                {emptyDays.map((_, index) => (
                  <div key={`empty-${index}`} className="h-12"></div>
                ))}

                {/* Days with dates */}
                {days.map((day) => (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`h-12 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 relative ${
                      selectedDate === day
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : hasEvents(day)
                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {day}
                    {hasEvents(day) && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center space-x-2 mb-6">
                <CalendarIcon className="w-6 h-6" />
                <h3 className="text-xl font-bold">
                  {selectedDate ? `Events on ${selectedDate}` : 'Select a Date'}
                </h3>
              </div>

              {selectedDate ? (
                <div className="space-y-4">
                  {getEventsForDate(selectedDate).length > 0 ? (
                    getEventsForDate(selectedDate).map((event, index) => (
                      <div key={index} className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white">{event.title}</h4>
                          <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`}></div>
                        </div>
                        <div className="flex items-center text-blue-100">
                          <Clock className="w-4 h-4 mr-2" />
                          <span className="text-sm">{event.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-blue-100">No events scheduled for this date</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-blue-200" />
                  <p className="text-blue-100">Click on a date to view events</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">This Month</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Events</span>
                  <span className="font-bold text-blue-600">{eventDates.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Technical Events</span>
                  <span className="font-bold text-blue-600">
                    {eventDates.filter(e => e.events.some(ev => ev.type === 'technical')).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Free Events</span>
                  <span className="font-bold text-green-600">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalendarView;
