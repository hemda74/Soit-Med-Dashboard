import { apiClient } from '../api';
import type { ChatConversationResponseDTO, ChatMessageResponseDTO, SendTextMessageDTO, SendVoiceMessageDTO } from '@/types/chat.types';

export const chatApi = {
	/**
	 * Get all conversations (admin) or user's conversation (customer)
	 */
	async getConversations(): Promise<{ data: ChatConversationResponseDTO[] }> {
		const response = await apiClient.get('/Chat/conversations');
		return response.data;
	},

	/**
	 * Get or create conversation
	 */
	async getOrCreateConversation(customerId?: string, adminId?: string): Promise<{ data: ChatConversationResponseDTO }> {
		const response = await apiClient.post('/Chat/conversations', {
			customerId,
			adminId,
		});
		return response.data;
	},

	/**
	 * Get conversation by ID
	 */
	async getConversation(id: number): Promise<{ data: ChatConversationResponseDTO }> {
		const response = await apiClient.get(`/Chat/conversations/${id}`);
		return response.data;
	},

	/**
	 * Assign admin to conversation
	 */
	async assignAdmin(conversationId: number, adminId: string): Promise<{ data: ChatConversationResponseDTO }> {
		const response = await apiClient.put(`/Chat/conversations/${conversationId}/assign`, {
			adminId,
		});
		return response.data;
	},

	/**
	 * Get messages for a conversation
	 */
	async getMessages(conversationId: number, page: number = 1, pageSize: number = 50): Promise<{ data: ChatMessageResponseDTO[] }> {
		const response = await apiClient.get(`/Chat/conversations/${conversationId}/messages`, {
			params: { page, pageSize },
		});
		return response.data;
	},

	/**
	 * Send text message
	 */
	async sendTextMessage(conversationId: number, content: string): Promise<{ data: ChatMessageResponseDTO }> {
		const response = await apiClient.post('/Chat/messages', {
			conversationId,
			content,
		});
		return response.data;
	},

	/**
	 * Send voice message
	 */
	async sendVoiceMessage(conversationId: number, file: File, voiceDuration: number): Promise<{ data: ChatMessageResponseDTO }> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('conversationId', conversationId.toString());
		formData.append('voiceDuration', voiceDuration.toString());

		const response = await apiClient.post('/Chat/messages/voice', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	},

	/**
	 * Mark messages as read
	 */
	async markMessagesAsRead(conversationId: number): Promise<void> {
		await apiClient.put(`/Chat/conversations/${conversationId}/read`);
	},

	/**
	 * Get unread message count
	 */
	async getUnreadCount(conversationId: number): Promise<{ data: { UnreadCount: number } }> {
		const response = await apiClient.get(`/Chat/conversations/${conversationId}/unread-count`);
		return response.data;
	},
};

