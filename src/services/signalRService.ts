import {
	HubConnectionBuilder,
	LogLevel,
	HubConnection,
} from '@microsoft/signalr';
import type { NotificationData, ConnectionStatus } from '@/types/signalR.types';
import { getApiBaseUrl } from '@/utils/apiConfig';

export type { NotificationData, ConnectionStatus };

class SignalRService {
	private connection: HubConnection | null = null;
	private isConnected: boolean = false;
	private reconnectAttempts: number = 0;
	private maxReconnectAttempts: number = 5;
	private reconnectTimer: NodeJS.Timeout | null = null;
	private isReconnecting: boolean = false;
	private listeners: Map<string, Function[]> = new Map();
	private joinedGroups: Set<string> = new Set();

	async connect(): Promise<void> {
		try {
			// Prevent multiple connections
			if (this.isReconnecting) return;
			if (
				this.isConnected &&
				this.connection?.state === 'Connected'
			) {
				console.log(
					'SignalR already connected, skipping'
				);
				return;
			}

			const token = this.getAuthToken();
			if (!token) {
				throw new Error(
					'No authentication token found'
				);
			}

			// Build SignalR URL - uses VITE_SIGNALR_URL or falls back to VITE_API_BASE_URL
			// Format: http://localhost:5117/notificationHub or http://10.10.9.102:5117/notificationHub
			const baseUrl =
				import.meta.env.VITE_SIGNALR_URL ||
				getApiBaseUrl();
			const hubUrl = `${baseUrl}/notificationHub`;

			// Build connection with token in both accessTokenFactory and headers (as per guide)
			this.connection = new HubConnectionBuilder()
				.withUrl(hubUrl, {
					accessTokenFactory: () => token || '',
					headers: {
						Authorization: `Bearer ${token}`,
					},
					withCredentials: false,
				})
				.withAutomaticReconnect({
					nextRetryDelayInMilliseconds: (
						retryContext
					) => {
						// Exponential backoff: 0s, 2s, 10s, 30s, then 30s intervals (as per guide)
						if (
							retryContext.previousRetryCount ===
							0
						)
							return 0;
						if (
							retryContext.previousRetryCount ===
							1
						)
							return 2000;
						if (
							retryContext.previousRetryCount ===
							2
						)
							return 10000;
						return 30000;
					},
				})
				.configureLogging(LogLevel.Information)
				.build();

			// Set up event handlers
			this.setupEventHandlers();

			// Start connection
			await this.connection.start();
			this.isConnected = true;
			this.reconnectAttempts = 0;
			this.isReconnecting = false;

			this.notifyListeners('connectionStatus', {
				isConnected: true,
				isReconnecting: false,
				reconnectAttempts: 0,
			});
		} catch (error) {
			console.error('SignalR Connection Error:', error);

			// Check for authentication errors
			if (
				error instanceof Error &&
				error.message.includes('401')
			) {
				console.error(
					'Authentication failed - token may be invalid'
				);
				this.notifyListeners('connectionError', {
					type: 'auth',
					message: 'Authentication failed - please login again',
				});
			} else if (
				error instanceof Error &&
				error.message.includes('Failed to connect')
			) {
				console.error(
					'Connection failed - check server status'
				);
				this.notifyListeners('connectionError', {
					type: 'connection',
					message: 'Failed to connect to server',
				});
			}

			this.isReconnecting = true;
			this.handleReconnect();
		}
	}

	private setupEventHandlers(): void {
		if (!this.connection) return;

		// Handle personal notifications - Updated to match backend signature (single data parameter)
		this.connection.on('ReceiveNotification', (data: any) => {
			this.handleNotification(data);
		});

		// Handle role-based broadcasts (NewRequest event)
		this.connection.on('NewRequest', (request: any) => {
			// Convert request to notification format
			const notificationData = {
				title: 'New Request',
				message: request.equipmentDetails
					? `New ${request.requestType} request for ${request.clientName}: ${request.equipmentDetails}`
					: `New ${request.requestType} request for ${request.clientName}`,
				type: 'info',
				data: request,
				timestamp: request.createdAt || Date.now(),
			};
			this.handleNotification(notificationData);
		});

		// Connection events
		this.connection.onreconnecting(() => {
			this.isReconnecting = true;
			this.notifyListeners('connectionStatus', {
				isConnected: false,
				isReconnecting: true,
				reconnectAttempts: this.reconnectAttempts,
			});
		});

		this.connection.onreconnected((connectionId) => {
			this.isConnected = true;
			this.isReconnecting = false;
			this.reconnectAttempts = 0;
			// Clear joined groups on reconnect - will rejoin them via connectionStatus handler
			this.joinedGroups.clear();
			this.notifyListeners('connectionStatus', {
				isConnected: true,
				isReconnecting: false,
				reconnectAttempts: 0,
			});
			// Notify listeners that we should reload notifications (as per guide)
			this.notifyListeners('reconnected', { connectionId });
		});

		this.connection.onclose((error) => {
			console.warn('⚠️ SignalR connection closed:', error);
			this.isConnected = false;
			this.isReconnecting = false;
			this.joinedGroups.clear(); // Clear joined groups on close
			this.notifyListeners('connectionStatus', {
				isConnected: false,
				isReconnecting: false,
				reconnectAttempts: this.reconnectAttempts,
			});

			// Attempt to reconnect (automatic reconnect is handled by SignalR)
			if (
				this.reconnectAttempts <
				this.maxReconnectAttempts
			) {
				this.handleReconnect();
			}
		});
	}

	private handleNotification(data: any): void {
		// Handle different notification data structures
		// Backend may send just the data object with all notification info
		const notificationData =
			typeof data === 'object'
				? data
				: {
						title: 'New Notification',
						message: data,
						data: data,
				  };

		// Show browser notification if permission is granted
		this.showBrowserNotification(
			notificationData.title || 'New Notification',
			notificationData.message || String(data),
			notificationData.link || null,
			notificationData
		);

		// Notify listeners
		this.notifyListeners('notification', notificationData);
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

	// Join a specific group
	async joinGroup(groupName: string): Promise<void> {
		// Prevent duplicate joins
		if (this.joinedGroups.has(groupName)) {
			return;
		}

		if (this.connection && this.isConnected) {
			// Check if connection is actually in Connected state
			if (this.connection.state !== 'Connected') {
				console.warn(
					`Cannot join group ${groupName}: Connection is in state ${this.connection.state}`
				);
				return;
			}

			try {
				await this.connection.invoke(
					'JoinGroup',
					groupName
				);
				this.joinedGroups.add(groupName);
			} catch (error) {
				console.error(
					`Error joining group ${groupName}:`,
					error
				);
			}
		} else {
			console.warn(
				`Cannot join group ${groupName}: Connection not available or not connected`
			);
		}
	}

	// Leave a group
	async leaveGroup(groupName: string): Promise<void> {
		if (this.connection && this.isConnected) {
			// Check if connection is actually in Connected state
			if (this.connection.state !== 'Connected') {
				console.warn(
					`Cannot leave group ${groupName}: Connection is in state ${this.connection.state}`
				);
				return;
			}

			try {
				await this.connection.invoke(
					'LeaveGroup',
					groupName
				);
				console.log(`Left group: ${groupName}`);
			} catch (error) {
				console.error(
					`Error leaving group ${groupName}:`,
					error
				);
			}
		} else {
			console.warn(
				`Cannot leave group ${groupName}: Connection not available or not connected`
			);
		}
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
			this.joinedGroups.clear(); // Clear joined groups on disconnect
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
		// Try to get token from localStorage (persisted Zustand store)
		const persistedState = localStorage.getItem('auth-storage');
		if (persistedState) {
			try {
				const parsed = JSON.parse(persistedState);
				return parsed.state?.user?.token || null;
			} catch {
				return null;
			}
		}
		return null;
	}
}

export default new SignalRService();
