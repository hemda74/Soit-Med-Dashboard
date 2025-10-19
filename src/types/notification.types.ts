export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
	id: string;
	type: NotificationType;
	title: string;
	message?: string;
	duration?: number;
	persistent?: boolean;
	timestamp: number;
	isRead?: boolean;
	link?: string;
	data?: any;
	roles?: string[];
	departments?: string[];
	userIds?: string[];
}
