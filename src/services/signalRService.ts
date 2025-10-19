import {
	HubConnectionBuilder,
	LogLevel,
	HubConnection,
} from '@microsoft/signalr';
import type { NotificationData, ConnectionStatus } from '@/types/signalR.types';

export type { NotificationData, ConnectionStatus };

class SignalRService {
	private connection: HubConnection | null = null;
	private isConnected: boolean = false;
	private reconnectAttempts: number = 0;
	private maxReconnectAttempts: number = 5;
	private reconnectTimer: NodeJS.Timeout | null = null;
	private isReconnecting: boolean = false;
	private listeners: Map<string, Function[]> = new Map();

	async connect(): Promise<void> {
		try {
			if (this.isReconnecting) return;

			const token = this.getAuthToken();
			if (!token) {
				throw new Error(
					'No authentication token found'
				);
			}

			this.connection = new HubConnectionBuilder()
				.withUrl(
					`${
						import.meta.env
							.VITE_SIGNALR_URL ||
						'https://localhost:5001/notificationHub'
					}`,
					{
						accessTokenFactory: () => token,
					}
				)
				.configureLogging(LogLevel.Information)
				.withAutomaticReconnect({
					nextRetryDelayInMilliseconds: (
						retryContext
					) => {
						return Math.min(
							1000 *
								Math.pow(
									2,
									retryContext.previousRetryCount
								),
							30000
						);
					},
				})
				.build();

			// Set up event handlers
			this.setupEventHandlers();

			// Start connection
			await this.connection.start();
			this.isConnected = true;
			this.reconnectAttempts = 0;
			this.isReconnecting = false;

			console.log('SignalR Connected');
			this.notifyListeners('connectionStatus', {
				isConnected: true,
				isReconnecting: false,
				reconnectAttempts: 0,
			});
		} catch (error) {
			console.error('SignalR Connection Error:', error);
			this.isReconnecting = true;
			this.handleReconnect();
		}
	}

	private setupEventHandlers(): void {
		if (!this.connection) return;

		// Handle new notifications
		this.connection.on(
			'ReceiveNotification',
			(message: string, link: string, data: any) => {
				this.handleNotification(message, link, data);
			}
		);

		// Handle role-based notifications
		this.connection.on(
			'ReceiveRoleBasedNotification',
			(notification: NotificationData) => {
				this.handleRoleBasedNotification(notification);
			}
		);

		// Handle new user registrations
		this.connection.on('NewUserRegistered', (user: any) => {
			this.handleNewUserRegistration(user);
		});

		// Handle user role changes
		this.connection.on('UserRoleChanged', (user: any) => {
			this.handleUserRoleChange(user);
		});

		// Handle weekly plan updates
		this.connection.on('WeeklyPlanUpdated', (plan: any) => {
			this.handleWeeklyPlanUpdate(plan);
		});

		// Handle sales report updates
		this.connection.on('SalesReportUpdated', (report: any) => {
			this.handleSalesReportUpdate(report);
		});

		// Handle system maintenance
		this.connection.on('SystemMaintenance', (maintenance: any) => {
			this.handleSystemMaintenance(maintenance);
		});

		// Handle connection events
		this.connection.onclose((error) => {
			console.log('SignalR Connection Closed:', error);
			this.isConnected = false;
			this.isReconnecting = false;
			this.notifyListeners('connectionStatus', {
				isConnected: false,
				isReconnecting: false,
				reconnectAttempts: this.reconnectAttempts,
			});
			this.handleReconnect();
		});

		this.connection.onreconnecting((error) => {
			console.log('SignalR Reconnecting:', error);
			this.isReconnecting = true;
			this.notifyListeners('connectionStatus', {
				isConnected: false,
				isReconnecting: true,
				reconnectAttempts: this.reconnectAttempts,
			});
		});

		this.connection.onreconnected((connectionId?: string) => {
			console.log('SignalR Reconnected:', connectionId);
			this.isConnected = true;
			this.isReconnecting = false;
			this.reconnectAttempts = 0;
			this.notifyListeners('connectionStatus', {
				isConnected: true,
				isReconnecting: false,
				reconnectAttempts: 0,
			});
		});
	}

	private handleNotification(
		message: string,
		link: string,
		data: any
	): void {
		console.log('Received Notification:', { message, link, data });

		// Show browser notification if permission is granted
		this.showBrowserNotification(
			'New Notification',
			message,
			link,
			data
		);

		// Notify listeners
		this.notifyListeners('notification', { message, link, data });
	}

	private handleRoleBasedNotification(
		notification: NotificationData
	): void {
		console.log('Received Role-Based Notification:', notification);

		// Show browser notification if permission is granted
		this.showBrowserNotification(
			notification.title,
			notification.message,
			notification.link || null,
			notification
		);

		// Notify listeners
		this.notifyListeners('roleBasedNotification', notification);
	}

	private handleNewUserRegistration(user: any): void {
		console.log('New User Registered:', user);

		this.showBrowserNotification(
			'New User Registration',
			`New user ${user.firstName} ${user.lastName} has been registered with role ${user.role}`,
			null,
			{ type: 'userRegistration', ...user }
		);

		this.notifyListeners('newUserRegistration', user);
	}

	private handleUserRoleChange(user: any): void {
		console.log('User Role Changed:', user);

		this.showBrowserNotification(
			'User Role Updated',
			`User ${user.firstName} ${user.lastName} role has been changed to ${user.newRole}`,
			null,
			{ type: 'userRoleChange', ...user }
		);

		this.notifyListeners('userRoleChange', user);
	}

	private handleWeeklyPlanUpdate(plan: any): void {
		console.log('Weekly Plan Updated:', plan);

		this.showBrowserNotification(
			'Weekly Plan Updated',
			`Weekly plan has been updated by ${plan.updatedBy}`,
			null,
			{ type: 'weeklyPlanUpdate', ...plan }
		);

		this.notifyListeners('weeklyPlanUpdate', plan);
	}

	private handleSalesReportUpdate(report: any): void {
		console.log('Sales Report Updated:', report);

		this.showBrowserNotification(
			'Sales Report Updated',
			`New sales report has been generated for ${report.period}`,
			null,
			{ type: 'salesReportUpdate', ...report }
		);

		this.notifyListeners('salesReportUpdate', report);
	}

	private handleSystemMaintenance(maintenance: any): void {
		console.log('System Maintenance:', maintenance);

		this.showBrowserNotification(
			'System Maintenance',
			maintenance.message,
			null,
			{ type: 'systemMaintenance', ...maintenance }
		);

		this.notifyListeners('systemMaintenance', maintenance);
	}

	private showBrowserNotification(
		title: string,
		message: string,
		link: string | null,
		data: any
	): void {
		if (
			'Notification' in window &&
			Notification.permission === 'granted'
		) {
			const notification = new Notification(title, {
				body: message,
				icon: '/favicon.ico',
				badge: '/favicon.ico',
				tag: data?.type || 'default',
				data: data,
			});

			notification.onclick = () => {
				window.focus();
				if (link) {
					window.location.href = link;
				}
				notification.close();
			};

			// Auto close after 5 seconds
			setTimeout(() => {
				notification.close();
			}, 5000);
		}
	}

	// Request notification permission
	async requestNotificationPermission(): Promise<boolean> {
		if ('Notification' in window) {
			const permission =
				await Notification.requestPermission();
			return permission === 'granted';
		}
		return false;
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
						'Error in event listener:',
						error
					);
				}
			});
		}
	}

	private async handleReconnect(): Promise<void> {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error('Max reconnection attempts reached');
			this.isReconnecting = false;
			this.notifyListeners('connectionStatus', {
				isConnected: false,
				isReconnecting: false,
				reconnectAttempts: this.reconnectAttempts,
			});
			return;
		}

		this.reconnectAttempts++;
		const delay = Math.min(
			1000 * Math.pow(2, this.reconnectAttempts),
			30000
		);

		console.log(
			`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
		);

		this.reconnectTimer = setTimeout(() => {
			this.connect();
		}, delay);
	}

	async disconnect(): Promise<void> {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}

		if (this.connection) {
			await this.connection.stop();
			this.isConnected = false;
			this.isReconnecting = false;
		}
	}

	// Send message to hub
	async sendMessage(methodName: string, ...args: any[]): Promise<void> {
		if (this.connection && this.isConnected) {
			try {
				await this.connection.invoke(
					methodName,
					...args
				);
			} catch (error) {
				console.error('Error sending message:', error);
			}
		}
	}

	// Get connection status
	getConnectionStatus(): ConnectionStatus {
		return {
			isConnected: this.isConnected,
			isReconnecting: this.isReconnecting,
			reconnectAttempts: this.reconnectAttempts,
		};
	}

	private getAuthToken(): string | null {
		return localStorage.getItem('authToken');
	}
}

export default new SignalRService();
