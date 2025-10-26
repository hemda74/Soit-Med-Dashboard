import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import toast from 'react-hot-toast';
import type {
	Notification,
	NotificationType,
} from '@/types/notification.types';

// Export types for external use
export type { Notification, NotificationType };
import notificationService from '@/services/notificationService';
import signalRService from '@/services/signalRService';

export interface NotificationState {
	notifications: Notification[];
	unreadCount: number;
	connectionStatus: {
		isConnected: boolean;
		isReconnecting: boolean;
		reconnectAttempts: number;
	};
	loading: boolean;
	error: string | null;

	// Actions
	addNotification: (
		notification: Omit<Notification, 'id' | 'timestamp'>
	) => void;
	removeNotification: (id: string) => void;
	clearAllNotifications: () => void;
	markAsRead: (id: string) => void;
	markAllAsRead: () => void;
	setUnreadCount: (count: number) => void;
	setConnectionStatus: (status: {
		isConnected: boolean;
		isReconnecting: boolean;
		reconnectAttempts: number;
	}) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	clearError: () => void;

	// Role-based methods
	getNotificationsForCurrentUser: () => Notification[];
	getNotificationsByRole: (role: string) => Notification[];
	getNotificationsByType: (type: NotificationType) => Notification[];
	getUnreadNotifications: () => Notification[];

	// Convenience methods
	success: (
		title: string,
		message?: string,
		options?: {
			duration?: number;
			persistent?: boolean;
			roles?: string[];
		}
	) => void;
	errorNotification: (
		title: string,
		message?: string,
		options?: {
			duration?: number;
			persistent?: boolean;
			roles?: string[];
		}
	) => void;
	warning: (
		title: string,
		message?: string,
		options?: {
			duration?: number;
			persistent?: boolean;
			roles?: string[];
		}
	) => void;
	info: (
		title: string,
		message?: string,
		options?: {
			duration?: number;
			persistent?: boolean;
			roles?: string[];
		}
	) => void;

	// Toast integration
	showToast: (
		type: NotificationType,
		title: string,
		message?: string
	) => void;

	// Service integration
	initialize: () => Promise<void>;
	disconnect: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
	subscribeWithSelector((set, get) => ({
		notifications: [],
		unreadCount: 0,
		connectionStatus: {
			isConnected: false,
			isReconnecting: false,
			reconnectAttempts: 0,
		},
		loading: false,
		error: null,

		addNotification: (notification) => {
			const id = `notification-${Date.now()}-${Math.random()
				.toString(36)
				.substr(2, 9)}`;
			const newNotification: Notification = {
				...notification,
				id,
				timestamp: Date.now(),
			};

			set((state) => ({
				notifications: [
					newNotification,
					...state.notifications,
				],
				unreadCount:
					state.unreadCount +
					(notification.isRead ? 0 : 1),
			}));

			// Auto-remove non-persistent notifications
			if (!notification.persistent) {
				const duration = notification.duration || 5000;
				setTimeout(() => {
					get().removeNotification(id);
				}, duration);
			}

			// Show toast
			get().showToast(
				notification.type,
				notification.title,
				notification.message
			);

			return id;
		},

		removeNotification: (id: string) => {
			set((state) => {
				const notification = state.notifications.find(
					(n) => n.id === id
				);
				const wasUnread =
					notification && !notification.isRead;
				return {
					notifications:
						state.notifications.filter(
							(n) => n.id !== id
						),
					unreadCount: wasUnread
						? state.unreadCount - 1
						: state.unreadCount,
				};
			});
		},

		clearAllNotifications: () => {
			set({ notifications: [], unreadCount: 0 });
		},

		markAsRead: (id: string) => {
			set((state) => {
				const notification = state.notifications.find(
					(n) => n.id === id
				);
				if (notification && !notification.isRead) {
					notification.isRead = true;
					return {
						unreadCount:
							state.unreadCount - 1,
					};
				}
				return state;
			});
		},

		markAllAsRead: () => {
			set((state) => ({
				notifications: state.notifications.map((n) => ({
					...n,
					isRead: true,
				})),
				unreadCount: 0,
			}));
		},

		setUnreadCount: (count: number) => {
			set({ unreadCount: count });
		},

		setConnectionStatus: (status) => {
			set({ connectionStatus: status });
		},

		setLoading: (loading: boolean) => {
			set({ loading });
		},

		setError: (error: string | null) => {
			set({ error });
		},

		clearError: () => {
			set({ error: null });
		},

		// Role-based methods
		getNotificationsForCurrentUser: () => {
			return notificationService.getNotificationsForCurrentUser();
		},

		getNotificationsByRole: (role: string) => {
			return notificationService.getNotificationsByRole(role);
		},

		getNotificationsByType: (type: NotificationType) => {
			return notificationService.getNotificationsByType(type);
		},

		getUnreadNotifications: () => {
			return notificationService.getUnreadNotifications();
		},

		// Convenience methods
		success: (title: string, message?: string, options = {}) => {
			get().addNotification({
				type: 'success',
				title,
				message,
				...options,
			});
		},

		errorNotification: (
			title: string,
			message?: string,
			options = {}
		) => {
			get().addNotification({
				type: 'error',
				title,
				message,
				persistent: true, // Errors are persistent by default
				...options,
			});
		},

		warning: (title: string, message?: string, options = {}) => {
			get().addNotification({
				type: 'warning',
				title,
				message,
				...options,
			});
		},

		info: (title: string, message?: string, options = {}) => {
			get().addNotification({
				type: 'info',
				title,
				message,
				...options,
			});
		},

		// Toast integration
		showToast: (
			type: NotificationType,
			title: string,
			message?: string
		) => {
			const content = message
				? `${title}: ${message}`
				: title;

			switch (type) {
				case 'success':
					toast.success(content);
					break;
				case 'error':
					toast.error(content);
					break;
				case 'warning':
					toast(content, { icon: '⚠️' });
					break;
				case 'info':
					toast(content, { icon: 'ℹ️' });
					break;
			}
		},

		// Service integration
		initialize: async () => {
			try {
				set({ loading: true, error: null });
				await notificationService.initialize();
				await signalRService.connect();

				// Set up listeners
				notificationService.addEventListener(
					'notificationAdded',
					(notification: any) => {
						get().addNotification(
							notification
						);
					}
				);

				notificationService.addEventListener(
					'unreadCountChanged',
					(count: number) => {
						get().setUnreadCount(count);
					}
				);

				signalRService.addEventListener(
					'connectionStatus',
					(status: any) => {
						get().setConnectionStatus(
							status
						);
					}
				);

				set({ loading: false });
			} catch (error) {
				set({
					loading: false,
					error:
						error instanceof Error
							? error.message
							: 'Failed to initialize notifications',
				});
			}
		},

		disconnect: async () => {
			try {
				await signalRService.disconnect();
				set({
					connectionStatus: {
						isConnected: false,
						isReconnecting: false,
						reconnectAttempts: 0,
					},
				});
			} catch (error) {
				console.error(
					'Error disconnecting SignalR:',
					error
				);
			}
		},
	}))
);
