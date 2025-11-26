export interface ChatConversationResponseDTO {
	id: number;
	customerId: string;
	customerName?: string;
	customerEmail?: string;
	adminId?: string;
	adminName?: string;
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

