import React from 'react';
import { useNotificationStore } from '../data/stores/notification.store';

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount } = useNotificationStore();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <p className="text-gray-600 mb-4">
        You have {unreadCount} unread notifications
      </p>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border rounded-lg ${
              notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
            }`}
          >
            <h3 className="font-semibold">{notification.title}</h3>
            <p className="text-gray-600">{notification.message}</p>
            <p className="text-sm text-gray-400 mt-2">
              {new Date(notification.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;

