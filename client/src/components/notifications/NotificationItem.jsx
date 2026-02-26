import React from 'react';
import { Clock, Calendar, Users } from 'lucide-react';

const iconMap = {
  event_approved: Calendar,
  event_rejected: Calendar,
  event_registration: Users,
  invite: Users,
  invite_accepted: Users,
  message: Clock,
  announcement: Calendar,
};

const NotificationItem = ({ notification }) => {
  const IconComponent = iconMap[notification.type] || Clock;

  return (
    <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <IconComponent className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
          {notification.body && (
            <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
