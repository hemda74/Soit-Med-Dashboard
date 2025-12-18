import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as signalR from '@microsoft/signalr';
import { chatApi } from '@/services/chat/chatApi';
import chatSignalRService from '@/services/chat/chatSignalRService';
import type {
	ChatConversationResponseDTO,
	ChatMessageResponseDTO,
	TypingIndicator,
} from '@/types/chat.types';
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
	setConversations: (
		conversations: ChatConversationResponseDTO[]
	) => void;
	setCurrentConversation: (
		conversation: ChatConversationResponseDTO | null
	) => Promise<void>;
	addMessage: (
		conversationId: number,
		message: ChatMessageResponseDTO
	) => void;
	setMessages: (
		conversationId: number,
		messages: ChatMessageResponseDTO[]
	) => void;
	setTypingUser: (
		conversationId: number,
		userId: string,
		isTyping: boolean
	) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	setIsConnected: (isConnected: boolean) => void;

	// API calls
	loadConversations: () => Promise<void>;
	loadMessages: (conversationId: number, page?: number) => Promise<void>;
	sendTextMessage: (
		conversationId: number,
		content: string
	) => Promise<void>;
	sendVoiceMessage: (
		conversationId: number,
		file: File,
		duration: number
	) => Promise<void>;
	sendImageMessage: (
		conversationId: number,
		file: File
	) => Promise<void>;
	markMessagesAsRead: (conversationId: number) => Promise<void>;
	joinConversation: (conversationId: number) => Promise<void>;
	leaveConversation: (conversationId: number) => Promise<void>;
	sendTypingIndicator: (
		conversationId: number,
		isTyping: boolean
	) => Promise<void>;

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

		setCurrentConversation: async (conversation) => {
			set({ currentConversation: conversation });
			if (conversation) {
				// Ensure connection is established before joining
				const currentState = chatSignalRService.getConnectionState();
				if (currentState !== signalR.HubConnectionState.Connected) {
					try {
						await chatSignalRService.connect();
						set({ isConnected: true });
					} catch (error) {
						console.warn('Failed to connect SignalR, continuing anyway:', error);
					}
				}
				// Join conversation group
				await get().joinConversation(conversation.id);
				// Auto-load messages when conversation is selected
				get().loadMessages(conversation.id);
			}
		},

		addMessage: (conversationId, message) => {
			// Validate message exists and has required properties
			if (!message || !message.id) {
				console.error(
					'Invalid message provided to addMessage:',
					message
				);
				return;
			}

			const messages = get().messages;
			const conversationMessages =
				messages.get(conversationId) || [];
			// Check if message already exists (avoid duplicates)
			if (
				!conversationMessages.find(
					(m) => m.id === message.id
				)
			) {
				// Create a new array instead of mutating the existing one
				const updatedMessages = [...conversationMessages, message];
				// Sort by createdAt to ensure proper ordering
				updatedMessages.sort(
					(a, b) =>
						new Date(a.createdAt).getTime() -
						new Date(b.createdAt).getTime()
				);
				const newMessagesMap = new Map(messages);
				newMessagesMap.set(
					conversationId,
					updatedMessages
				);
				set({ messages: newMessagesMap });

				// Update conversation last message
				const conversations = get().conversations;
				const conversation = conversations.find(
					(c) => c.id === conversationId
				);
				if (conversation) {
					conversation.lastMessageAt =
						message.createdAt;
					conversation.lastMessagePreview =
						message.messageType === 'Text'
							? message.content
							: 'Voice message';
					if (
						message.senderId !==
						useAuthStore.getState().user?.id
					) {
						conversation.unreadCount++;
					}
					set({
						conversations: [
							...conversations,
						],
					});
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
				const response =
					await chatApi.getConversations();
				// Ensure conversations is always an array
				const conversationsList = Array.isArray(
					response.data
				)
					? response.data
					: [];
				console.log(
					'Loaded conversations:',
					conversationsList.length,
					conversationsList
				);
				set({
					conversations: conversationsList,
					loading: false,
				});
			} catch (error: any) {
				console.error(
					'Error loading conversations:',
					error
				);
				set({
					error:
						error.message ||
						'Failed to load conversations',
					loading: false,
					conversations: [],
				});
			}
		},

		loadMessages: async (conversationId, page = 1) => {
			try {
				set({ loading: true, error: null });
				const response = await chatApi.getMessages(
					conversationId,
					page
				);
				const existingMessages =
					get().messages.get(conversationId) ||
					[];

				// Ensure newMessages is always an array
				const newMessages = Array.isArray(
					response?.data
				)
					? response.data
					: [];
				console.log('Chat Store - loadMessages:', {
					conversationId,
					existingCount: existingMessages.length,
					newCount: newMessages.length,
					response: response,
				});

				// Merge messages, avoiding duplicates
				const mergedMessages = [...existingMessages];
				if (
					Array.isArray(newMessages) &&
					newMessages.length > 0
				) {
					newMessages.forEach((msg) => {
						if (
							!mergedMessages.find(
								(m) =>
									m.id ===
									msg.id
							)
						) {
							mergedMessages.push(
								msg
							);
						}
					});
				}

				// Sort by createdAt
				mergedMessages.sort(
					(a, b) =>
						new Date(
							a.createdAt
						).getTime() -
						new Date(b.createdAt).getTime()
				);

				get().setMessages(
					conversationId,
					mergedMessages
				);
				set({ loading: false });
			} catch (error: any) {
				console.error('Error loading messages:', error);
				set({
					error:
						error.message ||
						'Failed to load messages',
					loading: false,
				});
			}
		},

		sendTextMessage: async (conversationId, content) => {
			try {
				const response = await chatApi.sendTextMessage(
					conversationId,
					content
				);

				// Validate response structure
				if (!response || !response.data) {
					console.error(
						'Invalid response from sendTextMessage:',
						response
					);
					throw new Error(
						'Invalid response from server'
					);
				}

				// Ensure the message has required properties
				const message = response.data;
				if (!message.id) {
					console.error(
						'Message missing required id:',
						message
					);
					throw new Error(
						'Message data is incomplete'
					);
				}

				get().addMessage(conversationId, message);
			} catch (error: any) {
				console.error(
					'Error sending text message:',
					error
				);
				set({
					error:
						error.message ||
						'Failed to send message',
				});
				throw error;
			}
		},

		sendVoiceMessage: async (conversationId, file, duration) => {
			try {
				const response = await chatApi.sendVoiceMessage(
					conversationId,
					file,
					duration
				);

				// Validate response structure
				if (!response || !response.data) {
					console.error(
						'Invalid response from sendVoiceMessage:',
						response
					);
					throw new Error(
						'Invalid response from server'
					);
				}

				// Ensure the message has required properties
				const message = response.data;
				if (!message.id) {
					console.error(
						'Message missing required id:',
						message
					);
					throw new Error(
						'Message data is incomplete'
					);
				}

				get().addMessage(conversationId, message);
			} catch (error: any) {
				console.error(
					'Error sending voice message:',
					error
				);
				set({
					error:
						error.message ||
						'Failed to send voice message',
				});
				throw error;
			}
		},

		sendImageMessage: async (conversationId, file) => {
			try {
				const response = await chatApi.sendImageMessage(
					conversationId,
					file
				);

				// Validate response structure
				if (!response || !response.data) {
					console.error(
						'Invalid response from sendImageMessage:',
						response
					);
					throw new Error(
						'Invalid response from server'
					);
				}

				// Ensure the message has required properties
				const message = response.data;
				if (!message.id) {
					console.error(
						'Message missing required id:',
						message
					);
					throw new Error(
						'Message data is incomplete'
					);
				}

				get().addMessage(conversationId, message);
			} catch (error: any) {
				console.error(
					'Error sending image message:',
					error
				);
				set({
					error:
						error.message ||
						'Failed to send image message',
				});
				throw error;
			}
		},

		markMessagesAsRead: async (conversationId) => {
			try {
				await chatApi.markMessagesAsRead(
					conversationId
				);
				// Update local state
				const messages =
					get().messages.get(conversationId) ||
					[];
				const userId = useAuthStore.getState().user?.id;
				if (userId) {
					messages.forEach((msg) => {
						if (msg.senderId !== userId) {
							msg.isRead = true;
							msg.readAt =
								new Date().toISOString();
						}
					});
					get().setMessages(
						conversationId,
						messages
					);

					// Update conversation unread count
					const conversations =
						get().conversations;
					const conversation = conversations.find(
						(c) => c.id === conversationId
					);
					if (conversation) {
						conversation.unreadCount = 0;
						set({
							conversations: [
								...conversations,
							],
						});
					}
				}
			} catch (error: any) {
				console.error(
					'Failed to mark messages as read:',
					error
				);
			}
		},

		joinConversation: async (conversationId) => {
			try {
				await chatSignalRService.joinConversation(
					conversationId
				);
			} catch (error) {
				console.error(
					'Failed to join conversation:',
					error
				);
			}
		},

		leaveConversation: async (conversationId) => {
			try {
				await chatSignalRService.leaveConversation(
					conversationId
				);
			} catch (error) {
				console.error(
					'Failed to leave conversation:',
					error
				);
			}
		},

		sendTypingIndicator: async (conversationId, isTyping) => {
			try {
				await chatSignalRService.sendTypingIndicator(
					conversationId,
					isTyping
				);
			} catch (error) {
				console.error(
					'Failed to send typing indicator:',
					error
				);
			}
		},

		initialize: async () => {
			try {
				// Check connection state before connecting
				const currentState =
					chatSignalRService.getConnectionState();
				if (
					currentState ===
					signalR.HubConnectionState.Connected
				) {
					set({ isConnected: true });
				} else if (
					currentState !==
					signalR.HubConnectionState.Connecting
				) {
					try {
						await chatSignalRService.connect();
						set({ isConnected: true });
					} catch (signalRError: any) {
						console.warn(
							'SignalR connection failed, continuing without real-time updates:',
							signalRError
						);
						set({ isConnected: false });
						// Continue anyway - user can still send messages via REST API
					}
				}

				// Set up event listeners
				chatSignalRService.addEventListener(
					'message',
					(message: ChatMessageResponseDTO) => {
						if (
							message &&
							message.id &&
							message.conversationId
						) {
							get().addMessage(
								message.conversationId,
								message
							);
						} else {
							console.warn(
								'Invalid message received from SignalR:',
								message
							);
						}
					}
				);

				chatSignalRService.addEventListener(
					'typing',
					(data: TypingIndicator) => {
						if (
							data &&
							data.conversationId &&
							data.userId
						) {
							get().setTypingUser(
								data.conversationId,
								data.userId,
								data.isTyping
							);
						}
					}
				);

				chatSignalRService.addEventListener(
					'messagesRead',
					(data: {
						conversationId: number;
						userId: string;
					}) => {
						if (
							data &&
							data.conversationId &&
							data.userId
						) {
							const messages =
								get().messages.get(
									data.conversationId
								) || [];
							messages.forEach(
								(msg) => {
									if (
										msg.senderId ===
										data.userId
									) {
										msg.isRead =
											true;
									}
								}
							);
							get().setMessages(
								data.conversationId,
								messages
							);
						}
					}
				);

				chatSignalRService.addEventListener(
					'connectionStatus',
					(status: { isConnected: boolean; isReconnecting?: boolean }) => {
						if (
							status &&
							typeof status.isConnected ===
								'boolean'
						) {
							set({
								isConnected:
									status.isConnected,
							});
							
							// When reconnected, re-join the current conversation
							if (status.isConnected && !status.isReconnecting) {
								const currentConversation = get().currentConversation;
								if (currentConversation) {
									// Re-join the conversation group after reconnection
									setTimeout(() => {
										get().joinConversation(currentConversation.id);
									}, 500);
								}
							}
						}
					}
				);
			} catch (error: any) {
				set({
					error:
						error.message ||
						'Failed to initialize chat',
					isConnected: false,
				});
			}
		},

		disconnect: async () => {
			await chatSignalRService.disconnect();
			set({ isConnected: false });
		},
	}))
);
