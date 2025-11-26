import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { chatApi } from '@/services/chat/chatApi';
import chatSignalRService from '@/services/chat/chatSignalRService';
import type { ChatConversationResponseDTO, ChatMessageResponseDTO, TypingIndicator } from '@/types/chat.types';
import { useAuthStore } from '@/stores/authStore';

export interface ChatState {
	conversations: ChatConversationResponseDTO[];
	currentConversation: ChatConversationResponseDTO | null;
	messages: Map<number, ChatMessageResponseDTO[]>; // conversationId -> messages
	typingUsers: Map<number, Set<string>>; // conversationId -> set of userIds typing
	loading: boolean;
	error: string | null;
	isConnected: boolean;

	// Actions
	setConversations: (conversations: ChatConversationResponseDTO[]) => void;
	setCurrentConversation: (conversation: ChatConversationResponseDTO | null) => void;
	addMessage: (conversationId: number, message: ChatMessageResponseDTO) => void;
	setMessages: (conversationId: number, messages: ChatMessageResponseDTO[]) => void;
	setTypingUser: (conversationId: number, userId: string, isTyping: boolean) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	setIsConnected: (isConnected: boolean) => void;

	// API calls
	loadConversations: () => Promise<void>;
	loadMessages: (conversationId: number, page?: number) => Promise<void>;
	sendTextMessage: (conversationId: number, content: string) => Promise<void>;
	sendVoiceMessage: (conversationId: number, file: File, duration: number) => Promise<void>;
	markMessagesAsRead: (conversationId: number) => Promise<void>;
	joinConversation: (conversationId: number) => Promise<void>;
	leaveConversation: (conversationId: number) => Promise<void>;
	sendTypingIndicator: (conversationId: number, isTyping: boolean) => Promise<void>;

	// SignalR setup
	initialize: () => Promise<void>;
	disconnect: () => Promise<void>;
}

export const useChatStore = create<ChatState>()(
	subscribeWithSelector((set, get) => ({
		conversations: [],
		currentConversation: null,
		messages: new Map(),
		typingUsers: new Map(),
		loading: false,
		error: null,
		isConnected: false,

		setConversations: (conversations) => set({ conversations }),

		setCurrentConversation: (conversation) => {
			set({ currentConversation: conversation });
			if (conversation) {
				get().joinConversation(conversation.id);
			}
		},

		addMessage: (conversationId, message) => {
			const messages = get().messages;
			const conversationMessages = messages.get(conversationId) || [];
			// Check if message already exists (avoid duplicates)
			if (!conversationMessages.find((m) => m.id === message.id)) {
				conversationMessages.push(message);
				messages.set(conversationId, conversationMessages);
				set({ messages: new Map(messages) });

				// Update conversation last message
				const conversations = get().conversations;
				const conversation = conversations.find((c) => c.id === conversationId);
				if (conversation) {
					conversation.lastMessageAt = message.createdAt;
					conversation.lastMessagePreview = message.messageType === 'Text' ? message.content : 'Voice message';
					if (message.senderId !== useAuthStore.getState().user?.id) {
						conversation.unreadCount++;
					}
					set({ conversations: [...conversations] });
				}
			}
		},

		setMessages: (conversationId, messages) => {
			const messagesMap = get().messages;
			messagesMap.set(conversationId, messages);
			set({ messages: new Map(messagesMap) });
		},

		setTypingUser: (conversationId, userId, isTyping) => {
			const typingUsers = get().typingUsers;
			if (!typingUsers.has(conversationId)) {
				typingUsers.set(conversationId, new Set());
			}
			const users = typingUsers.get(conversationId)!;
			if (isTyping) {
				users.add(userId);
			} else {
				users.delete(userId);
			}
			set({ typingUsers: new Map(typingUsers) });
		},

		setLoading: (loading) => set({ loading }),

		setError: (error) => set({ error }),

		setIsConnected: (isConnected) => set({ isConnected }),

		loadConversations: async () => {
			try {
				set({ loading: true, error: null });
				const response = await chatApi.getConversations();
				set({ conversations: response.data, loading: false });
			} catch (error: any) {
				set({ error: error.message || 'Failed to load conversations', loading: false });
			}
		},

		loadMessages: async (conversationId, page = 1) => {
			try {
				set({ loading: true, error: null });
				const response = await chatApi.getMessages(conversationId, page);
				const existingMessages = get().messages.get(conversationId) || [];
				const newMessages = response.data;

				// Merge messages, avoiding duplicates
				const mergedMessages = [...existingMessages];
				newMessages.forEach((msg) => {
					if (!mergedMessages.find((m) => m.id === msg.id)) {
						mergedMessages.push(msg);
					}
				});

				// Sort by createdAt
				mergedMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

				get().setMessages(conversationId, mergedMessages);
				set({ loading: false });
			} catch (error: any) {
				set({ error: error.message || 'Failed to load messages', loading: false });
			}
		},

		sendTextMessage: async (conversationId, content) => {
			try {
				const response = await chatApi.sendTextMessage(conversationId, content);
				get().addMessage(conversationId, response.data);
			} catch (error: any) {
				set({ error: error.message || 'Failed to send message' });
				throw error;
			}
		},

		sendVoiceMessage: async (conversationId, file, duration) => {
			try {
				const response = await chatApi.sendVoiceMessage(conversationId, file, duration);
				get().addMessage(conversationId, response.data);
			} catch (error: any) {
				set({ error: error.message || 'Failed to send voice message' });
				throw error;
			}
		},

		markMessagesAsRead: async (conversationId) => {
			try {
				await chatApi.markMessagesAsRead(conversationId);
				// Update local state
				const messages = get().messages.get(conversationId) || [];
				const userId = useAuthStore.getState().user?.id;
				if (userId) {
					messages.forEach((msg) => {
						if (msg.senderId !== userId) {
							msg.isRead = true;
							msg.readAt = new Date().toISOString();
						}
					});
					get().setMessages(conversationId, messages);

					// Update conversation unread count
					const conversations = get().conversations;
					const conversation = conversations.find((c) => c.id === conversationId);
					if (conversation) {
						conversation.unreadCount = 0;
						set({ conversations: [...conversations] });
					}
				}
			} catch (error: any) {
				console.error('Failed to mark messages as read:', error);
			}
		},

		joinConversation: async (conversationId) => {
			try {
				await chatSignalRService.joinConversation(conversationId);
			} catch (error) {
				console.error('Failed to join conversation:', error);
			}
		},

		leaveConversation: async (conversationId) => {
			try {
				await chatSignalRService.leaveConversation(conversationId);
			} catch (error) {
				console.error('Failed to leave conversation:', error);
			}
		},

		sendTypingIndicator: async (conversationId, isTyping) => {
			try {
				await chatSignalRService.sendTypingIndicator(conversationId, isTyping);
			} catch (error) {
				console.error('Failed to send typing indicator:', error);
			}
		},

		initialize: async () => {
			try {
				await chatSignalRService.connect();
				set({ isConnected: true });

				// Set up event listeners
				chatSignalRService.addEventListener('message', (message: ChatMessageResponseDTO) => {
					get().addMessage(message.conversationId, message);
				});

				chatSignalRService.addEventListener('typing', (data: TypingIndicator) => {
					get().setTypingUser(data.conversationId, data.userId, data.isTyping);
				});

				chatSignalRService.addEventListener('messagesRead', (data: { conversationId: number; userId: string }) => {
					const messages = get().messages.get(data.conversationId) || [];
					messages.forEach((msg) => {
						if (msg.senderId === data.userId) {
							msg.isRead = true;
						}
					});
					get().setMessages(data.conversationId, messages);
				});

				chatSignalRService.addEventListener('connectionStatus', (status: { isConnected: boolean }) => {
					set({ isConnected: status.isConnected });
				});
			} catch (error: any) {
				set({ error: error.message || 'Failed to initialize chat', isConnected: false });
			}
		},

		disconnect: async () => {
			await chatSignalRService.disconnect();
			set({ isConnected: false });
		},
	}))
);

