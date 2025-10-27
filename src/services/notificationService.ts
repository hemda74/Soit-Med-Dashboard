import toast from 'react-hot-toast';
import signalRService from './signalRService';
import type { NotificationData } from '@/types/signalR.types';
import { useAuthStore } from '@/stores/authStore';

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

		this.isInitialized = true;
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
			const userRoles = currentUser.roles || [];
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
		// Backend sends notification data with all fields
		const notification: NotificationData = {
			id:
				data.id ||
				`notification-${Date.now()}-${Math.random()
					.toString(36)
					.substr(2, 9)}`,
			type: data.type || 'info',
			title: data.title || 'New Notification',
			message: data.message || String(data),
			link: data.link,
			data: data.data || data,
			timestamp: data.timestamp || Date.now(),
			isRead: data.isRead || false,
			roles: data.roles,
			departments: data.departments,
			userIds: data.userIds,
		};

		// Backend handles filtering via groups
		this.addNotification(notification);

		// Show toast based on notification type
		if (notification.type === 'success') {
			toast.success(notification.message);
		} else if (notification.type === 'error') {
			toast.error(notification.message);
		} else if (notification.type === 'warning') {
			toast(notification.message, { icon: '⚠️' });
		} else {
			toast(notification.message, { icon: 'ℹ️' });
		}
	}

	private handleRoleBasedNotification(
		notification: NotificationData
	): void {
		if (this.shouldShowNotification(notification)) {
			this.addNotification(notification);
		}
	}

	private handleNewUserRegistration(user: any): void {
		const currentUser = this.getCurrentUser();
		if (!currentUser) return;

		// Only show to admins and super admins
		const userRoles = currentUser.roles || [];
		if (
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

	private handleUserRoleChange(user: any): void {
		const currentUser = this.getCurrentUser();
		if (!currentUser) return;

		// Show to the user whose role changed and admins
		const userRoles = currentUser.roles || [];
		const isAdmin = userRoles.some((role: any) =>
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

	private handleWeeklyPlanUpdate(plan: any): void {
		const currentUser = this.getCurrentUser();
		if (!currentUser) return;

		// Show to sales team and managers
		const userRoles = currentUser.roles || [];
		const isSalesTeam = userRoles.some((role: any) =>
			['Salesman', 'SalesManager', 'SuperAdmin'].includes(
				role
			)
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
			roles: ['Salesman', 'SalesManager', 'SuperAdmin'],
		};

		this.addNotification(notification);
		toast.success('Weekly plan has been updated');
	}

	private handleSalesReportUpdate(report: any): void {
		const currentUser = this.getCurrentUser();
		if (!currentUser) return;

		// Show to sales team and managers
		const userRoles = currentUser.roles || [];
		const isSalesTeam = userRoles.some((role: any) =>
			['Salesman', 'SalesManager', 'SuperAdmin'].includes(
				role
			)
		);

		if (!isSalesTeam) return;

		const notification: NotificationData = {
			id: `sales-report-${Date.now()}`,
			type: 'success',
			title: 'Sales Report Updated',
			message: `New sales report has been generated for ${report.period}`,
			data: report,
			timestamp: Date.now(),
			isRead: false,
			roles: ['Salesman', 'SalesManager', 'SuperAdmin'],
		};

		this.addNotification(notification);
		toast.success('New sales report available');
	}

	private handleSystemMaintenance(maintenance: any): void {
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
				const userRoles = currentUser.roles || [];
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
