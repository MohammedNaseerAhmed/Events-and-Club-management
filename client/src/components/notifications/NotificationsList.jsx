import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import NotificationItem from './NotificationItem';

const NotificationsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.recentNotifications(10)
      .then((data) => {
        // Ensure we have an array
        setItems(Array.isArray(data) ? data : []);
      })
      .catch((e) => setError(e.message || 'Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {Array.isArray(items) && items.length > 0 ? (
          items.map((notification) => (
            <NotificationItem key={notification._id} notification={notification} />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No notifications available
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-200">
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationsList;
