export type ChatType = 'Support' | 'Sales' | 'Maintenance';

export interface ChatConversationResponseDTO {
	id: number;
	customerId: string;
	customerName?: string;
	customerFirstName?: string;
	customerLastName?: string;
	customerEmail?: string;
	customerImageUrl?: string;
	adminId?: string;
	adminName?: string;
	chatType: number; // 0 = Support, 1 = Sales, 2 = Maintenance
	chatTypeName: string; // "Support", "Sales", "Maintenance"
	lastMessageAt: string;
	lastMessagePreview?: string;
	isActive: boolean;
	unreadCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface ChatMessageResponseDTO {
	id: number;
	conversationId: number;
	senderId: string;
	senderName?: string;
	messageType: 'Text' | 'Voice';
	content?: string;
	voiceFilePath?: string;
	voiceFileUrl?: string;
	voiceDuration?: number;
	isRead: boolean;
	readAt?: string;
	createdAt: string;
}

export interface SendTextMessageDTO {
	conversationId: number;
	content: string;
}

export interface SendVoiceMessageDTO {
	conversationId: number;
	file: File;
	voiceDuration: number;
}

export interface TypingIndicator {
	conversationId: number;
	userId: string;
	isTyping: boolean;
}

