import { apiClient } from '../api';
import { getAuthToken } from '@/utils/authUtils';
import type {
	ChatConversationResponseDTO,
	ChatMessageResponseDTO,
	SendTextMessageDTO,
	SendVoiceMessageDTO,
} from '@/types/chat.types';

export const chatApi = {
	/**
	 * Get all conversations (Admin) or user's conversation (customer)
	 */
	async getConversations(): Promise<{
		data: ChatConversationResponseDTO[];
	}> {
		const token = getAuthToken();
		if (!token) {
			throw new Error(
				'No authentication session. Please log in.'
			);
		}
		const response = await apiClient.get(
			'/Chat/conversations',
			token
		);

		// Backend returns: { success: true, data: [...], message: "...", timestamp: "..." }
		// apiClient.get() returns the parsed JSON response directly
		console.log('Chat API - getConversations response:', response);

		if (response && typeof response === 'object') {
			// Check if response has 'data' property (standard API response format)
			if ('data' in response) {
				const data = (response as any).data;
				if (Array.isArray(data)) {
					return { data };
				}
			}
			// If response itself is an array (unlikely but possible)
			if (Array.isArray(response)) {
				return { data: response };
			}
		}

		// Fallback: return empty array
		console.warn(
			'Unexpected response format from getConversations:',
			response
		);
		return { data: [] };
	},

	/**
	 * Get or create conversation
	 */
	async getOrCreateConversation(
		customerId?: string,
		AdminId?: string
	): Promise<{ data: ChatConversationResponseDTO }> {
		const token = getAuthToken();
		if (!token) {
			throw new Error('No active session. Please log in.');
		}
		const response = await apiClient.post(
			'/Chat/conversations',
			{
				customerId,
				AdminId,
			},
			token
		);
		return response.data;
	},

	/**
	 * Get conversation by ID
	 */
	async getConversation(
		id: number
	): Promise<{ data: ChatConversationResponseDTO }> {
		const token = getAuthToken();
		if (!token) {
			throw new Error('No active session. Please log in.');
		}
		const response = await apiClient.get(
			`/Chat/conversations/${id}`,
			token
		);
		return response.data;
	},

	/**
	 * Assign Admin to conversation
	 */
	async assignAdmin(
		conversationId: number,
		AdminId: string
	): Promise<{ data: ChatConversationResponseDTO }> {
		const token = getAuthToken();
		if (!token) {
			throw new Error('No active session. Please log in.');
		}
		const response = await apiClient.put(
			`/Chat/conversations/${conversationId}/assign`,
			{
				AdminId,
			},
			token
		);
		return response.data;
	},

	/**
	 * Get messages for a conversation
	 */
	async getMessages(
		conversationId: number,
		page: number = 1,
		pageSize: number = 50
	): Promise<{ data: ChatMessageResponseDTO[] }> {
		const token = getAuthToken();
		if (!token) {
			throw new Error('No active session. Please log in.');
		}
		const queryParams = new URLSearchParams();
		queryParams.append('page', page.toString());
		queryParams.append('pageSize', pageSize.toString());
		const response = await apiClient.get(
			`/Chat/conversations/${conversationId}/messages?${queryParams.toString()}`,
			token
		);

		console.log('Chat API - getMessages response:', response);

		// Handle response structure
		if (response && typeof response === 'object') {
			if ('data' in response) {
				const data = (response as any).data;
				if (Array.isArray(data)) {
					return { data };
				}
			}
			if (Array.isArray(response)) {
				return { data: response };
			}
		}

		console.warn(
			'Unexpected response format from getMessages:',
			response
		);
		return { data: [] };
	},

	/**
	 * Send text message
	 */
	async sendTextMessage(
		conversationId: number,
		content: string
	): Promise<{ data: ChatMessageResponseDTO }> {
		const token = getAuthToken();
		if (!token) {
			throw new Error('No active session. Please log in.');
		}
		const response = await apiClient.post(
			'/Chat/messages',
			{
				conversationId,
				content,
			},
			token
		);

		// Log response for debugging
		console.log('Chat API - sendTextMessage response:', response);

		// Handle different response structures
		if (response && typeof response === 'object') {
			// If response has 'data' property (standard API response format)
			if ('data' in response) {
				const data = (response as any).data;
				// If data itself has a 'data' property (nested structure)
				if (
					data &&
					typeof data === 'object' &&
					'data' in data
				) {
					return { data: data.data };
				}
				// If data is the message object directly
				if (
					data &&
					typeof data === 'object' &&
					'id' in data
				) {
					return { data };
				}
			}
			// If response itself is the message object
			if ('id' in response) {
				return {
					data: response as ChatMessageResponseDTO,
				};
			}
		}

		// Fallback: return response.data or throw error
		if (response && (response as any).data) {
			return { data: (response as any).data };
		}

		throw new Error(
			'Invalid response structure from sendTextMessage API'
		);
	},

	/**
	 * Send voice message
	 */
	async sendVoiceMessage(
		conversationId: number,
		file: File,
		voiceDuration: number
	): Promise<{ data: ChatMessageResponseDTO }> {
		const token = getAuthToken();
		if (!token) {
			throw new Error('No active session. Please log in.');
		}

		// Use apiRequest for FormData since userApiClient doesn't handle it well
		const { apiRequest } = await import('../shared/apiClient');
		const { getApiUrl } = await import('@/config/api');

		const url = getApiUrl('/Chat/messages/voice');
		const formData = new FormData();
		formData.append('file', file);
		formData.append('conversationId', conversationId.toString());
		formData.append('voiceDuration', voiceDuration.toString());

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				// Don't set Content-Type - browser sets it automatically with boundary
			},
			body: formData,
		});

		if (!response.ok) {
			const errorText = await response.text();
			let errorData: any;
			try {
				errorData = JSON.parse(errorText);
			} catch {
				errorData = {
					message:
						errorText ||
						`HTTP ${response.status}: Request failed`,
				};
			}
			throw errorData;
		}

		const responseData = await response.json();
		return responseData;
	},

	/**
	 * Send image message
	 */
	async sendImageMessage(
		conversationId: number,
		file: File
	): Promise<{ data: ChatMessageResponseDTO }> {
		const token = getAuthToken();
		if (!token) {
			throw new Error('No active session. Please log in.');
		}

		const { getApiUrl } = await import('@/config/api');

		const url = getApiUrl('/Chat/messages/image');
		const formData = new FormData();
		formData.append('file', file);
		formData.append('conversationId', conversationId.toString());

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				// Don't set Content-Type - browser sets it automatically with boundary
			},
			body: formData,
		});

		if (!response.ok) {
			const errorText = await response.text();
			let errorData: any;
			try {
				errorData = JSON.parse(errorText);
			} catch {
				errorData = {
					message:
						errorText ||
						`HTTP ${response.status}: Request failed`,
				};
			}
			throw errorData;
		}

		const responseData = await response.json();
		return responseData;
	},

	/**
	 * Mark messages as read
	 */
	async markMessagesAsRead(conversationId: number): Promise<void> {
		const token = getAuthToken();
		if (!token) {
			throw new Error('No active session. Please log in.');
		}
		await apiClient.put(
			`/Chat/conversations/${conversationId}/read`,
			undefined,
			token
		);
	},

	/**
	 * Get unread message count
	 */
	async getUnreadCount(
		conversationId: number
	): Promise<{ data: { UnreadCount: number } }> {
		const token = getAuthToken();
		if (!token) {
			throw new Error('No active session. Please log in.');
		}
		const response = await apiClient.get(
			`/Chat/conversations/${conversationId}/unread-count`,
			token
		);
		return response.data;
	},
};
