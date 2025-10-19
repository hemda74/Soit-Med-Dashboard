export interface NotificationData {
	id: string;
	type: 'success' | 'error' | 'warning' | 'info';
	title: string;
	message: string;
	link?: string;
	data?: any;
	timestamp: number;
	isRead: boolean;
	roles?: string[];
	departments?: string[];
	userIds?: string[];
}

export interface ConnectionStatus {
	isConnected: boolean;
	isReconnecting: boolean;
	reconnectAttempts: number;
}
