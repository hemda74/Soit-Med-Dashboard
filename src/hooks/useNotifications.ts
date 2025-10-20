import { useEffect, useState } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import type {
	Notification,
	NotificationType,
} from '@/types/notification.types';

export const useNotifications = () => {
	const {
		notifications,
		unreadCount,
		connectionStatus,
		loading,
		error,
		markAsRead,
		markAllAsRead,
		getNotificationsForCurrentUser,
		getNotificationsByRole,
		getNotificationsByType,
		getUnreadNotifications,
		initialize,
		disconnect,
	} = useNotificationStore();

	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		if (!isInitialized) {
			initialize().then(() => {
				setIsInitialized(true);
			});
		}

		return () => {
			disconnect();
		};
	}, [initialize, disconnect, isInitialized]);

	const getNotificationsByRoleAndType = (
		role: string,
		type: NotificationType
	) => {
		const roleNotifications = getNotificationsByRole(role);
		return roleNotifications.filter((n) => n.type === type);
	};

	const getRecentNotifications = (limit: number = 5) => {
		return getNotificationsForCurrentUser()
			.sort((a, b) => b.timestamp - a.timestamp)
			.slice(0, limit);
	};

	const getUnreadNotificationsByType = (type: NotificationType) => {
		return getUnreadNotifications().filter((n) => n.type === type);
	};

	const hasUnreadNotifications = () => {
		return unreadCount > 0;
	};

	const isConnected = () => {
		return connectionStatus.isConnected;
	};

	const isReconnecting = () => {
		return connectionStatus.isReconnecting;
	};

	return {
		// Data
		notifications,
		unreadCount,
		connectionStatus,
		loading,
		error,
		isInitialized,

		// Actions
		markAsRead,
		markAllAsRead,

		// Filtered data
		getNotificationsForCurrentUser,
		getNotificationsByRole,
		getNotificationsByType,
		getUnreadNotifications,
		getNotificationsByRoleAndType,
		getRecentNotifications,
		getUnreadNotificationsByType,

		// Status checks
		hasUnreadNotifications,
		isConnected,
		isReconnecting,

		// Service methods
		initialize,
		disconnect,
	};
};
