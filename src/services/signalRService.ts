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

			// Build SignalR URL - use environment variable or default to localhost:5117
			// Format: http://localhost:5117/notificationHub
			const baseUrl =
				import.meta.env.VITE_SIGNALR_URL ||
				'http://localhost:5117';
			const hubUrl = `${baseUrl}/notificationHub`;

			this.connection = new HubConnectionBuilder()
				.withUrl(hubUrl, {
					accessTokenFactory: () => token,
					withCredentials: false,
				})
				.withAutomaticReconnect([0, 2000, 10000, 30000])
				.configureLogging(LogLevel.Information)
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

		// Handle new notifications - Updated to match backend signature (single data parameter)
		this.connection.on('ReceiveNotification', (data: any) => {
			console.log('Received Notification:', data);
			this.handleNotification(data);
		});

		// Connection events
		this.connection.onreconnecting(() => {
			console.log('SignalR Reconnecting...');
			this.isReconnecting = true;
			this.notifyListeners('connectionStatus', {
				isConnected: false,
				isReconnecting: true,
				reconnectAttempts: this.reconnectAttempts,
			});
		});

		this.connection.onreconnected(() => {
			console.log('SignalR Reconnected!');
			this.isConnected = true;
			this.isReconnecting = false;
			this.reconnectAttempts = 0;
			this.notifyListeners('connectionStatus', {
				isConnected: true,
				isReconnecting: false,
				reconnectAttempts: 0,
			});
		});

		this.connection.onclose((error) => {
			console.log('SignalR Closed!', error);
			this.isConnected = false;
			this.isReconnecting = false;
			this.notifyListeners('connectionStatus', {
				isConnected: false,
				isReconnecting: false,
				reconnectAttempts: this.reconnectAttempts,
			});

			// Attempt to reconnect
			if (
				this.reconnectAttempts <
				this.maxReconnectAttempts
			) {
				this.handleReconnect();
			}
		});
	}

	private handleNotification(data: any): void {
		console.log('Received Notification Data:', data);

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
		if (this.connection && this.isConnected) {
			try {
				await this.connection.invoke(
					'JoinGroup',
					groupName
				);
				console.log(`Joined group: ${groupName}`);
			} catch (error) {
				console.error(
					`Error joining group ${groupName}:`,
					error
				);
			}
		}
	}

	// Leave a group
	async leaveGroup(groupName: string): Promise<void> {
		if (this.connection && this.isConnected) {
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
