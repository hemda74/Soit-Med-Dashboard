import toast from 'react-hot-toast';
import signalRService from './signalRService';
import type { NotificationData } from '@/types/signalR.types';
import { useAuthStore } from '@/stores/authStore';
import { API_ENDPOINTS } from './shared/endpoints';
import { getAuthToken } from '@/utils/authUtils';
import { getApiBaseUrl } from '@/utils/apiConfig';
import { getTranslation } from '@/utils/translations';

export interface NotificationFilter {
	roles?: string[];
	departments?: string[];
	userIds?: string[];
	types?: string[];
}

class NotificationService {
	private notifications: NotificationData[] = [];
	private unreadCount: number = 0;
	private listeners: Map<string, Function[]> = new Map();
	private isInitialized: boolean = false;
	private pollingInterval: NodeJS.Timeout | null = null;
	private isPolling: boolean = false;

	// Initialize notification service
	async initialize(): Promise<void> {
		if (this.isInitialized) return;

		// Request notification permission
		await signalRService.requestNotificationPermission();

		// Set up SignalR listeners
		// Backend sends all notifications through 'notification' event
		signalRService.addEventListener(
			'notification',
			this.handleNotification.bind(this)
		);

		// Listen for reconnection to reload notifications
		signalRService.addEventListener('reconnected', () => {
			this.loadNotifications();
		});

		// Listen for connection failures to start polling
		signalRService.addEventListener(
			'connectionError',
			(error: any) => {
				if (error?.type === 'connection') {
					console.warn(
						'⚠️ SignalR connection failed, starting polling fallback'
					);
					this.startPolling();
				}
			}
		);

		this.isInitialized = true;
	}

	// Load notifications from API
	async loadNotifications(): Promise<void> {
		try {
			const token = getAuthToken();
			if (!token) {
				console.warn(
					'No auth token available for loading notifications'
				);
				return;
			}

			const baseUrl = getApiBaseUrl();
			const endpoint = `${baseUrl}${API_ENDPOINTS.SALES.NOTIFICATION.BASE}?page=1&pageSize=50&unreadOnly=false`;

			const response = await fetch(endpoint, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			// Check if response is actually JSON before parsing
			const contentType =
				response.headers.get('content-type');
			if (
				!contentType ||
				!contentType.includes('application/json')
			) {
				const text = await response.text();
				console.error(
					'Non-JSON response from notifications:',
					text.substring(0, 200)
				);
				throw new Error(
					`Server returned non-JSON response: ${response.status} ${response.statusText}`
				);
			}

			if (!response.ok) {
				try {
					const error = await response.json();
					throw new Error(
						error.message ||
							error.error ||
							`HTTP ${response.status}: ${response.statusText}`
					);
				} catch (parseError) {
					throw new Error(
						`HTTP ${response.status}: ${response.statusText}`
					);
				}
			}

			const result = await response.json();

			if (result.success && result.data) {
				// Convert API notifications to NotificationData format (matching guide structure)
				// Guide structure: { id, title, message, type, priority, isRead, createdAt, requestWorkflowId?, activityLogId? }
				const notifications: NotificationData[] =
					Array.isArray(result.data)
						? result.data.map((n: any) => ({
								id: String(
									n.id
								),
								type:
									n.type ||
									'info',
								title:
									n.title ||
									'New Notification',
								message:
									n.message ||
									'',
								link:
									n.link ||
									null,
								data: {
									requestWorkflowId:
										n.requestWorkflowId,
									activityLogId:
										n.activityLogId,
									priority: n.priority,
									...n,
								},
								timestamp: n.createdAt
									? new Date(
											n.createdAt
									  ).getTime()
									: Date.now(),
								isRead:
									n.isRead ||
									false,
								roles: n.roles,
								departments:
									n.departments,
								userIds: n.userIds,
						  }))
						: [];

				// Clear existing and add loaded notifications (add new ones at the beginning, as per guide)
				this.notifications = notifications;
				this.unreadCount = notifications.filter(
					(n) => !n.isRead
				).length;

				// Notify listeners
				this.notifyListeners(
					'notificationsLoaded',
					notifications
				);
				this.notifyListeners(
					'unreadCountChanged',
					this.unreadCount
				);
			}
		} catch (error) {
			console.error('❌ Error loading notifications:', error);
		}
	}

	// Load unread count from API
	async loadUnreadCount(): Promise<void> {
		try {
			const token = getAuthToken();
			if (!token) return;

			const baseUrl = getApiBaseUrl();
			const endpoint = `${baseUrl}${API_ENDPOINTS.SALES.NOTIFICATION.UNREAD_COUNT}`;

			const response = await fetch(endpoint, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			// Check if response is JSON
			const contentType =
				response.headers.get('content-type');
			if (
				response.ok &&
				contentType &&
				contentType.includes('application/json')
			) {
				const result = await response.json();
				// Guide shows response format: { success: true, data: 5 } (number directly)
				if (result.success) {
					const count =
						typeof result.data === 'number'
							? result.data
							: result.data
									?.UnreadCount ||
							  0;
					this.unreadCount = count;
					this.notifyListeners(
						'unreadCountChanged',
						this.unreadCount
					);
				}
			} else if (!response.ok) {
				console.error(
					'Failed to load unread count:',
					response.status,
					response.statusText
				);
			}
		} catch (error) {
			console.error('Error loading unread count:', error);
		}
	}

	// Start polling as fallback when SignalR fails
	startPolling(interval: number = 10000): void {
		if (this.isPolling || this.pollingInterval) {
			return; // Already polling
		}

		this.isPolling = true;

		// Load immediately
		this.loadNotifications();
		this.loadUnreadCount();

		// Then poll at interval (as per guide: every 10 seconds)
		this.pollingInterval = setInterval(() => {
			this.loadNotifications();
			this.loadUnreadCount();
		}, interval);
	}

	// Stop polling
	stopPolling(): void {
		if (this.pollingInterval) {
			clearInterval(this.pollingInterval);
			this.pollingInterval = null;
			this.isPolling = false;
		}
	}

	// Mark notification as read via API
	async markAsReadAPI(notificationId: string): Promise<void> {
		try {
			const token = getAuthToken();
			if (!token) return;

			const baseUrl = getApiBaseUrl();
			const endpoint = `${baseUrl}${API_ENDPOINTS.SALES.NOTIFICATION.MARK_READ(
				Number(notificationId)
			)}`;

			const response = await fetch(endpoint, {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				// Update local state
				this.markAsRead(notificationId);
			}
		} catch (error) {
			console.error(
				'Error marking notification as read:',
				error
			);
		}
	}

	// Mark all notifications as read via API
	async markAllAsReadAPI(): Promise<void> {
		try {
			const token = getAuthToken();
			if (!token) return;

			const baseUrl = getApiBaseUrl();
			const endpoint = `${baseUrl}${API_ENDPOINTS.SALES.NOTIFICATION.MARK_ALL_READ}`;

			const response = await fetch(endpoint, {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				// Update local state
				this.markAllAsRead();
			}
		} catch (error) {
			console.error(
				'Error marking all notifications as read:',
				error
			);
		}
	}

	private getCurrentUser(): any {
		const authStore = useAuthStore.getState();
		return authStore.user;
	}

	private shouldShowNotification(
		notification: NotificationData
	): boolean {
		const currentUser = this.getCurrentUser();
		if (!currentUser) return false;

		// Check if notification is for specific users
		if (notification.userIds && notification.userIds.length > 0) {
			return notification.userIds.includes(currentUser.id);
		}

		// Check if notification is for specific roles
		if (notification.roles && notification.roles.length > 0) {
			const userRoles = Array.isArray(currentUser.roles)
				? currentUser.roles
				: [];
			return notification.roles.some((role) =>
				userRoles.includes(role)
			);
		}

		// Check if notification is for specific departments
		if (
			notification.departments &&
			notification.departments.length > 0
		) {
			const userDepartment = currentUser.department;
			return notification.departments.includes(
				userDepartment
			);
		}

		// If no specific targeting, show to all users
		return true;
	}

	private handleNotification(data: any): void {
		// Backend sends notification data matching guide structure:
		// { id, title, message, type, priority, isRead, createdAt, requestWorkflowId?, activityLogId? }
		console.log('📬 New notification received:', data);

		// Ensure message is a string
		let messageText = '';
		if (typeof data.Message === 'string') {
			messageText = data.Message;
		} else if (typeof data.message === 'string') {
			messageText = data.message;
		} else if (data.Message && typeof data.Message === 'object') {
			messageText = JSON.stringify(data.Message);
		} else if (data.message && typeof data.message === 'object') {
			messageText = JSON.stringify(data.message);
		} else {
			messageText =
				data.Title || data.title || 'New Notification';
		}

		const notification: NotificationData = {
			id: String(
				data.Id ||
					data.id ||
					`notification-${Date.now()}-${Math.random()
						.toString(36)
						.substr(2, 9)}`
			),
			type: (data.Type || data.type || 'info').toLowerCase(),
			title: data.Title || data.title || 'New Notification',
			message: messageText,
			link: data.link || null,
			data: {
				offerRequestId: data.offerRequestId,
				requestWorkflowId:
					data.RequestWorkflowId ||
					data.requestWorkflowId,
				activityLogId:
					data.ActivityLogId ||
					data.activityLogId,
				clientId: data.clientId,
				clientName: data.clientName,
				salesmanId: data.salesmanId,
				salesmanName: data.salesmanName,
				priority: data.Priority || data.priority,
				...data.data,
				...data, // Include all original data
			},
			timestamp:
				data.CreatedAt || data.createdAt
					? new Date(
							data.CreatedAt ||
								data.createdAt
					  ).getTime()
					: data.timestamp || Date.now(),
			isRead: data.IsRead || data.isRead || false,
			roles: data.roles,
			departments: data.departments,
			userIds: data.userIds,
		};

		// Backend handles filtering via groups, so we trust the notification is for us
		// Add to notifications list (at the beginning, as per guide)
		// addNotification already handles unread count increment
		this.addNotification(notification);

		// Show browser notification if permission granted (as per guide)
		if (
			'Notification' in window &&
			Notification.permission === 'granted'
		) {
			new Notification(notification.title, {
				body: notification.message,
				icon: '/notification-icon.png',
			});
		}

		// Show toast based on notification type
		const toastMessage = notification.message || notification.title;
		if (notification.type === 'success') {
			toast.success(toastMessage);
		} else if (notification.type === 'error') {
			toast.error(toastMessage);
		} else if (notification.type === 'warning') {
			toast(toastMessage, { icon: '⚠️' });
		} else {
			toast(toastMessage, { icon: 'ℹ️' });
		}

		// Stop polling if SignalR is working (as per guide)
		if (this.isPolling) {
			this.stopPolling();
		}
	}

	// Intentionally unused - for future use
	// @ts-ignore TS6133
	private _handleRoleBasedNotification(
		notification: NotificationData
	): void {
		if (this.shouldShowNotification(notification)) {
			this.addNotification(notification);
		}
	}

	// Intentionally unused - for future use
	// @ts-ignore TS6133
	private _handleNewUserRegistration(user: any): void {
		const currentUser = this.getCurrentUser();
		if (!currentUser) return;

		// Only show to Admins and super Admins
		const userRoles = Array.isArray(currentUser.roles)
			? currentUser.roles
			: [];
		if (
			userRoles.length === 0 ||
			!userRoles.some((role: any) =>
				['Admin', 'SuperAdmin'].includes(role)
			)
		) {
			return;
		}

		const notification: NotificationData = {
			id: `user-registration-${Date.now()}`,
			type: 'success',
			title: 'New User Registration',
			message: `New user ${user.firstName} ${user.lastName} has been registered with role ${user.role}`,
			data: user,
			timestamp: Date.now(),
			isRead: false,
			roles: ['Admin', 'SuperAdmin'],
		};

		this.addNotification(notification);
		toast.success(
			`New user ${user.firstName} ${user.lastName} registered`
		);
	}

	// Intentionally unused - for future use
	// @ts-ignore TS6133
	private _handleUserRoleChange(user: any): void {
		const currentUser = this.getCurrentUser();
		if (!currentUser) return;

		// Show to the user whose role changed and Admins
		const userRoles = Array.isArray(currentUser.roles)
			? currentUser.roles
			: [];
		const isAdmin =
			userRoles.length > 0 &&
			userRoles.some((role: any) =>
				['Admin', 'SuperAdmin'].includes(role)
			);
		const isAffectedUser = currentUser.id === user.id;

		if (!isAdmin && !isAffectedUser) return;

		const notification: NotificationData = {
			id: `role-change-${Date.now()}`,
			type: 'info',
			title: 'User Role Updated',
			message: `User ${user.firstName} ${user.lastName} role has been changed to ${user.newRole}`,
			data: user,
			timestamp: Date.now(),
			isRead: false,
			roles: isAdmin ? ['Admin', 'SuperAdmin'] : undefined,
			userIds: isAffectedUser ? [user.id] : undefined,
		};

		this.addNotification(notification);
		toast.success(
			`User role updated for ${user.firstName} ${user.lastName}`
		);
	}

	// Intentionally unused - for future use
	// @ts-ignore TS6133
	private _handleWeeklyPlanUpdate(plan: any): void {
		const currentUser = this.getCurrentUser();
		if (!currentUser) return;

		// Show to sales team and managers
		const userRoles = Array.isArray(currentUser.roles)
			? currentUser.roles
			: [];
		const isSalesTeam =
			userRoles.length > 0 &&
			userRoles.some((role: any) =>
				[
					'SalesMan',
					'SalesManager',
					'SuperAdmin',
				].includes(role)
			);

		if (!isSalesTeam) return;

		const notification: NotificationData = {
			id: `weekly-plan-${Date.now()}`,
			type: 'info',
			title: 'Weekly Plan Updated',
			message: `Weekly plan has been updated by ${plan.updatedBy}`,
			data: plan,
			timestamp: Date.now(),
			isRead: false,
			roles: ['SalesMan', 'SalesManager', 'SuperAdmin'],
		};

		this.addNotification(notification);
		toast.success(getTranslation('weeklyPlanUpdated'));
	}

	// Intentionally unused - for future use
	// @ts-ignore TS6133
	private _handleSystemMaintenance(maintenance: any): void {
		const notification: NotificationData = {
			id: `maintenance-${Date.now()}`,
			type: 'warning',
			title: 'System Maintenance',
			message: maintenance.message,
			data: maintenance,
			timestamp: Date.now(),
			isRead: false,
		};

		this.addNotification(notification);
		toast(maintenance.message, { icon: '⚠️' });
	}

	private addNotification(notification: NotificationData): void {
		// Check for duplicate notification by ID (prevent duplicates)
		const existingNotification = this.notifications.find(
			(n) => n.id === notification.id
		);

		if (existingNotification) {
			return; // Skip duplicate
		}

		this.notifications.unshift(notification);
		if (!notification.isRead) {
			this.unreadCount++;
		}

		// Keep only last 100 notifications
		if (this.notifications.length > 100) {
			this.notifications = this.notifications.slice(0, 100);
		}

		this.notifyListeners('notificationAdded', notification);
		this.notifyListeners('unreadCountChanged', this.unreadCount);
	}

	// Public methods
	markAsRead(notificationId: string): void {
		const notification = this.notifications.find(
			(n) => n.id === notificationId
		);
		if (notification && !notification.isRead) {
			notification.isRead = true;
			this.unreadCount--;
			this.notifyListeners('notificationRead', notification);
			this.notifyListeners(
				'unreadCountChanged',
				this.unreadCount
			);
		}
	}

	markAllAsRead(): void {
		this.notifications.forEach((notification) => {
			notification.isRead = true;
		});
		this.unreadCount = 0;
		this.notifyListeners('allNotificationsRead', null);
		this.notifyListeners('unreadCountChanged', this.unreadCount);
	}

	getNotifications(): NotificationData[] {
		return this.notifications;
	}

	getUnreadCount(): number {
		return this.unreadCount;
	}

	getUnreadNotifications(): NotificationData[] {
		return this.notifications.filter((n) => !n.isRead);
	}

	// Filter notifications by type
	getNotificationsByType(type: string): NotificationData[] {
		return this.notifications.filter((n) => n.type === type);
	}

	// Filter notifications by role
	getNotificationsByRole(role: string): NotificationData[] {
		return this.notifications.filter(
			(n) => !n.roles || n.roles.includes(role)
		);
	}

	// Filter notifications by department
	getNotificationsByDepartment(department: string): NotificationData[] {
		return this.notifications.filter(
			(n) =>
				!n.departments ||
				n.departments.includes(department)
		);
	}

	// Get notifications for current user based on their role and department
	getNotificationsForCurrentUser(): NotificationData[] {
		const currentUser = this.getCurrentUser();
		if (!currentUser) return [];

		return this.notifications.filter((notification) => {
			// Check if notification is for specific users
			if (
				notification.userIds &&
				notification.userIds.length > 0
			) {
				return notification.userIds.includes(
					currentUser.id
				);
			}

			// Check if notification is for specific roles
			if (
				notification.roles &&
				notification.roles.length > 0
			) {
				const userRoles = Array.isArray(
					currentUser.roles
				)
					? currentUser.roles
					: [];
				return (
					userRoles.length > 0 &&
					notification.roles.some((role) =>
						userRoles.includes(role)
					)
				);
			}

			// Check if notification is for specific departments
			if (
				notification.departments &&
				notification.departments.length > 0
			) {
				const userDepartment = currentUser.department;
				return notification.departments.includes(
					userDepartment
				);
			}

			// If no specific targeting, show to all users
			return true;
		});
	}

	// Clear old notifications
	clearOldNotifications(daysOld: number = 7): void {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - daysOld);

		this.notifications = this.notifications.filter(
			(n) => new Date(n.timestamp) > cutoffDate
		);

		// Recalculate unread count
		this.unreadCount = this.notifications.filter(
			(n) => !n.isRead
		).length;
		this.notifyListeners('unreadCountChanged', this.unreadCount);
	}

	// Add event listener
	addEventListener(event: string, callback: Function): void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event)!.push(callback);
	}

	// Remove event listener
	removeEventListener(event: string, callback: Function): void {
		if (this.listeners.has(event)) {
			const callbacks = this.listeners.get(event)!;
			const index = callbacks.indexOf(callback);
			if (index > -1) {
				callbacks.splice(index, 1);
			}
		}
	}

	// Notify all listeners of an event
	private notifyListeners(event: string, data: any): void {
		if (this.listeners.has(event)) {
			this.listeners.get(event)!.forEach((callback) => {
				try {
					callback(data);
				} catch (error) {
					console.error(
						'Error in notification listener:',
						error
					);
				}
			});
		}
	}

	// Create a test notification for demonstration
	createTestNotification(
		type: 'success' | 'error' | 'warning' | 'info',
		title: string,
		message: string,
		roles?: string[]
	): void {
		const notification: NotificationData = {
			id: `test-${Date.now()}`,
			type,
			title,
			message,
			timestamp: Date.now(),
			isRead: false,
			roles,
		};

		this.addNotification(notification);
	}
}

export default new NotificationService();
