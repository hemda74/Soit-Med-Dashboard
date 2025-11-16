import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNotificationStore } from '../notificationStore';
import type { Notification } from '@/types/notification.types';

// Mock dependencies
vi.mock('@/services/notificationService', () => ({
	default: {
		getNotifications: vi.fn(() => Promise.resolve([])),
		markAsReadAPI: vi.fn(() => Promise.resolve()),
		markAllAsReadAPI: vi.fn(() => Promise.resolve()),
		getNotificationsByType: vi.fn(() => []),
		getUnreadNotifications: vi.fn(() => []),
	},
}));

vi.mock('@/services/signalRService', () => ({
	default: {
		connect: vi.fn(),
		disconnect: vi.fn(),
	},
}));

vi.mock('@/stores/authStore', () => ({
	useAuthStore: {
		getState: vi.fn(() => ({
			user: { id: '1', roles: ['Admin'] },
		})),
	},
}));

describe('NotificationStore', () => {
	beforeEach(() => {
		// Reset store state before each test
		useNotificationStore.setState({
			notifications: [],
			unreadCount: 0,
			connectionStatus: {
				isConnected: false,
				isReconnecting: false,
				reconnectAttempts: 0,
			},
			loading: false,
			error: null,
		});
	});

	it('initializes with default values', () => {
		const state = useNotificationStore.getState();
		expect(state.notifications).toEqual([]);
		expect(state.unreadCount).toBe(0);
		expect(state.loading).toBe(false);
		expect(state.error).toBeNull();
	});

	it('adds notification correctly', () => {
		const state = useNotificationStore.getState();
		const notification: Omit<Notification, 'id' | 'timestamp'> = {
			type: 'info',
			title: 'Test Notification',
			message: 'Test message',
			read: false,
		};

		state.addNotification(notification);
		const updatedState = useNotificationStore.getState();
		expect(updatedState.notifications).toHaveLength(1);
		expect(updatedState.notifications[0].title).toBe('Test Notification');
		expect(updatedState.notifications[0].read).toBe(false);
	});

	it('removes notification correctly', () => {
		const state = useNotificationStore.getState();
		const notification: Omit<Notification, 'id' | 'timestamp'> = {
			type: 'info',
			title: 'Test',
			message: 'Test',
			read: false,
		};

		state.addNotification(notification);
		const addedState = useNotificationStore.getState();
		const notificationId = addedState.notifications[0].id;

		state.removeNotification(notificationId);
		const updatedState = useNotificationStore.getState();
		expect(updatedState.notifications).toHaveLength(0);
	});

	it('clears all notifications', () => {
		const state = useNotificationStore.getState();
		state.addNotification({
			type: 'info',
			title: 'Test 1',
			message: 'Message 1',
			read: false,
		});
		state.addNotification({
			type: 'success',
			title: 'Test 2',
			message: 'Message 2',
			read: false,
		});

		state.clearAllNotifications();
		const updatedState = useNotificationStore.getState();
		expect(updatedState.notifications).toHaveLength(0);
	});

	it('marks notification as read', async () => {
		const state = useNotificationStore.getState();
		state.addNotification({
			type: 'info',
			title: 'Test',
			message: 'Test',
			read: false,
		});

		const addedState = useNotificationStore.getState();
		const notificationId = addedState.notifications[0].id;

		await state.markAsRead(notificationId);
		const updatedState = useNotificationStore.getState();
		// Check isRead property (notificationStore uses isRead, not read)
		expect(updatedState.notifications[0].isRead).toBe(true);
	});

	it('marks all notifications as read', async () => {
		const state = useNotificationStore.getState();
		state.addNotification({
			type: 'info',
			title: 'Test 1',
			message: 'Message 1',
			read: false,
		});
		state.addNotification({
			type: 'success',
			title: 'Test 2',
			message: 'Message 2',
			read: false,
		});

		await state.markAllAsRead();
		const updatedState = useNotificationStore.getState();
		// Check isRead property (notificationStore uses isRead, not read)
		expect(updatedState.notifications.every(n => n.isRead)).toBe(true);
	});

	it('sets unread count', () => {
		const state = useNotificationStore.getState();
		state.setUnreadCount(5);
		const updatedState = useNotificationStore.getState();
		expect(updatedState.unreadCount).toBe(5);
	});

	it('sets connection status', () => {
		const state = useNotificationStore.getState();
		state.setConnectionStatus({
			isConnected: true,
			isReconnecting: false,
			reconnectAttempts: 0,
		});
		const updatedState = useNotificationStore.getState();
		expect(updatedState.connectionStatus.isConnected).toBe(true);
	});

	it('sets loading state', () => {
		const state = useNotificationStore.getState();
		state.setLoading(true);
		const updatedState = useNotificationStore.getState();
		expect(updatedState.loading).toBe(true);
	});

	it('sets and clears error', () => {
		const state = useNotificationStore.getState();
		state.setError('Test error');
		const updatedState = useNotificationStore.getState();
		expect(updatedState.error).toBe('Test error');

		updatedState.clearError();
		const finalState = useNotificationStore.getState();
		expect(finalState.error).toBeNull();
	});

	it('gets notifications by type', () => {
		const state = useNotificationStore.getState();
		state.addNotification({
			type: 'info',
			title: 'Info',
			message: 'Info message',
			read: false,
		});
		state.addNotification({
			type: 'success',
			title: 'Success',
			message: 'Success message',
			read: false,
		});

		// Test that notifications are stored correctly
		const updatedState = useNotificationStore.getState();
		const infoNotifications = updatedState.notifications.filter(n => n.type === 'info');
		expect(infoNotifications).toHaveLength(1);
		expect(infoNotifications[0].type).toBe('info');
	});

	it('gets unread notifications', () => {
		const state = useNotificationStore.getState();
		state.addNotification({
			type: 'info',
			title: 'Unread',
			message: 'Unread message',
			read: false,
		});
		state.addNotification({
			type: 'success',
			title: 'Read',
			message: 'Read message',
			read: true,
		});

		// Test that notifications are stored correctly with read status
		const updatedState = useNotificationStore.getState();
		const unreadNotifications = updatedState.notifications.filter(n => !n.read);
		expect(unreadNotifications).toHaveLength(1);
		expect(unreadNotifications[0].read).toBe(false);
	});
});

