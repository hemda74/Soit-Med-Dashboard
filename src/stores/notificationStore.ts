import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import toast from 'react-hot-toast';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
	id: string;
	type: NotificationType;
	title: string;
	message?: string;
	duration?: number;
	persistent?: boolean;
	timestamp: number;
}

export interface NotificationState {
	notifications: Notification[];

	// Actions
	addNotification: (
		notification: Omit<Notification, 'id' | 'timestamp'>
	) => void;
	removeNotification: (id: string) => void;
	clearAllNotifications: () => void;

	// Convenience methods
	success: (
		title: string,
		message?: string,
		options?: { duration?: number; persistent?: boolean }
	) => void;
	error: (
		title: string,
		message?: string,
		options?: { duration?: number; persistent?: boolean }
	) => void;
	warning: (
		title: string,
		message?: string,
		options?: { duration?: number; persistent?: boolean }
	) => void;
	info: (
		title: string,
		message?: string,
		options?: { duration?: number; persistent?: boolean }
	) => void;

	// Toast integration
	showToast: (
		type: NotificationType,
		title: string,
		message?: string
	) => void;
}

export const useNotificationStore = create<NotificationState>()(
	subscribeWithSelector((set, get) => ({
		notifications: [],

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
			set((state) => ({
				notifications: state.notifications.filter(
					(n) => n.id !== id
				),
			}));
		},

		clearAllNotifications: () => {
			set({ notifications: [] });
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

		error: (title: string, message?: string, options = {}) => {
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
	}))
);
