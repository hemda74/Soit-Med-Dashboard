import * as signalR from '@microsoft/signalr';
import { getAuthToken } from '@/utils/authUtils';
import { getApiBaseUrl } from '@/utils/apiConfig';
import type { ChatMessageResponseDTO, TypingIndicator } from '@/types/chat.types';

class ChatSignalRService {
	private connection: signalR.HubConnection | null = null;
	private isConnected: boolean = false;
	private listeners: Map<string, Function[]> = new Map();

	private getAuthToken(): string | null {
		try {
			return getAuthToken();
		} catch {
			return null;
		}
	}

	async connect(): Promise<void> {
		try {
			if (this.isConnected && this.connection?.state === 'Connected') {
				return;
			}

			const token = this.getAuthToken();
			if (!token) {
				throw new Error('No authentication token found');
			}

			const baseUrl = import.meta.env.VITE_SIGNALR_URL || getApiBaseUrl();
			const hubUrl = `${baseUrl}/chatHub`;

			this.connection = new signalR.HubConnectionBuilder()
				.withUrl(hubUrl, {
					accessTokenFactory: () => token || '',
					headers: {
						Authorization: `Bearer ${token}`,
					},
					withCredentials: false,
				})
				.withAutomaticReconnect({
					nextRetryDelayInMilliseconds: (retryContext) => {
						if (retryContext.previousRetryCount === 0) return 0;
						if (retryContext.previousRetryCount === 1) return 2000;
						if (retryContext.previousRetryCount === 2) return 10000;
						return 30000;
					},
				})
				.configureLogging(signalR.LogLevel.Information)
				.build();

			this.setupEventHandlers();

			await this.connection.start();
			this.isConnected = true;
			console.log('✅ Chat SignalR connected');
		} catch (error) {
			console.error('Chat SignalR Connection Error:', error);
			this.isConnected = false;
			throw error;
		}
	}

	private setupEventHandlers(): void {
		if (!this.connection) return;

		// Handle new messages
		this.connection.on('ReceiveMessage', (message: ChatMessageResponseDTO) => {
			this.notifyListeners('message', message);
		});

		// Handle typing indicators
		this.connection.on('UserTyping', (data: TypingIndicator) => {
			this.notifyListeners('typing', data);
		});

		// Handle read receipts
		this.connection.on('MessagesRead', (data: { conversationId: number; userId: string; readAt: string }) => {
			this.notifyListeners('messagesRead', data);
		});

		// Handle conversation updates
		this.connection.on('ConversationUpdated', (data: any) => {
			this.notifyListeners('conversationUpdated', data);
		});

		// Handle conversation assignment
		this.connection.on('ConversationAssigned', (data: { conversationId: number; customerId: string }) => {
			this.notifyListeners('conversationAssigned', data);
		});

		// Connection events
		this.connection.onreconnecting(() => {
			this.isConnected = false;
			this.notifyListeners('connectionStatus', { isConnected: false, isReconnecting: true });
		});

		this.connection.onreconnected(() => {
			this.isConnected = true;
			this.notifyListeners('connectionStatus', { isConnected: true, isReconnecting: false });
		});

		this.connection.onclose(() => {
			this.isConnected = false;
			this.notifyListeners('connectionStatus', { isConnected: false, isReconnecting: false });
		});
	}

	async disconnect(): Promise<void> {
		if (this.connection) {
			await this.connection.stop();
			this.connection = null;
			this.isConnected = false;
		}
	}

	async joinConversation(conversationId: number): Promise<void> {
		if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
			await this.connect();
		}
		await this.connection!.invoke('JoinConversation', conversationId);
	}

	async leaveConversation(conversationId: number): Promise<void> {
		if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
			await this.connection.invoke('LeaveConversation', conversationId);
		}
	}

	async sendTypingIndicator(conversationId: number, isTyping: boolean): Promise<void> {
		if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
			await this.connection.invoke('Typing', conversationId, isTyping);
		}
	}

	addEventListener(event: string, callback: Function): void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event)!.push(callback);
	}

	removeEventListener(event: string, callback: Function): void {
		const callbacks = this.listeners.get(event);
		if (callbacks) {
			const index = callbacks.indexOf(callback);
			if (index > -1) {
				callbacks.splice(index, 1);
			}
		}
	}

	private notifyListeners(event: string, data: any): void {
		const callbacks = this.listeners.get(event);
		if (callbacks) {
			callbacks.forEach((callback) => {
				try {
					callback(data);
				} catch (error) {
					console.error(`Error in chat event listener for ${event}:`, error);
				}
			});
		}
	}

	getConnectionState(): signalR.HubConnectionState {
		return this.connection?.state || signalR.HubConnectionState.Disconnected;
	}
}

export default new ChatSignalRService();

