import React, { useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import type { ChatConversationResponseDTO } from '@/types/chat.types';
import MessageBubble from './MessageBubble';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import { useTranslation } from '@/hooks/useTranslation';
import Logo from '@/components/Logo';

interface ChatWindowProps {
	conversation: ChatConversationResponseDTO;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation }) => {
	const { t, language } = useTranslation();
	const isArabic = language === 'ar';
	const { user } = useAuthStore();
	const {
		messages,
		typingUsers,
		loadMessages,
		sendTextMessage,
		sendTypingIndicator,
		markMessagesAsRead,
		setTypingUser,
	} = useChatStore();

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);

	const conversationMessages = messages.get(conversation.id) || [];
	const isTypingInThisConversation = typingUsers.get(conversation.id)?.size > 0;

	useEffect(() => {
		console.log('ChatWindow - Loading messages for conversation:', conversation.id);
		// Load messages immediately when conversation changes
		loadMessages(conversation.id);
		markMessagesAsRead(conversation.id);
		
		// Auto-scroll to bottom after messages load
		setTimeout(() => {
			messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
		}, 100);
	}, [conversation.id]);

	useEffect(() => {
		console.log('ChatWindow - Conversation messages updated:', conversationMessages.length, conversationMessages);
		// Auto-scroll to bottom when messages change
		setTimeout(() => {
			messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
		}, 50);
	}, [conversationMessages]);

	useEffect(() => {
		// Mark messages as read when viewing
		markMessagesAsRead(conversation.id);
	}, [conversationMessages, conversation.id]);

	// Auto-load messages on mount and when conversation changes
	useEffect(() => {
		if (conversation && conversationMessages.length === 0) {
			console.log('ChatWindow - Auto-loading messages for empty conversation');
			loadMessages(conversation.id);
		}
	}, [conversation?.id]);

	const isUserAdmin = user?.roles.some((role) => ['SuperAdmin', 'Admin', 'SalesManager', 'SalesSupport'].includes(role)) || false;
	const clientName = isUserAdmin 
		? (conversation.customerName || conversation.customerEmail || 'Customer')
		: (conversation.adminName || 'Admin');

	return (
		<div className="flex flex-col h-full">
			{/* Header with Logo and Client Name */}
			<div className="px-4 py-3 border-b bg-background">
				<div className="flex items-center gap-3">
					{/* Company Logo */}
					<div className="flex-shrink-0">
						<Logo asLink={false} className="h-10 w-auto" />
					</div>
					{/* Client Name and Info */}
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-lg truncate">
							{clientName}
						</h3>
						{isUserAdmin && conversation.customerEmail && conversation.customerEmail !== conversation.customerName && (
							<p className="text-sm text-muted-foreground truncate">{conversation.customerEmail}</p>
						)}
						{isTypingInThisConversation && (
							<p className="text-sm text-muted-foreground mt-1">{t('chat.typing') || 'Typing...'}</p>
						)}
					</div>
				</div>
			</div>

			{/* Messages */}
			<div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
				{conversationMessages.length === 0 ? (
					<div className="flex items-center justify-center h-full">
						<p className="text-muted-foreground">{t('chat.noMessages') || 'No messages yet'}</p>
					</div>
				) : (
					conversationMessages.map((message) => {
						const isOwn = message.senderId === user?.id;
						return (
							<div
								key={message.id}
								className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
							>
								{!isOwn && message.senderName && (
									<span className="text-xs text-muted-foreground mb-1 px-2">
										{message.senderName}
									</span>
								)}
								<div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
									{message.messageType === 'Text' ? (
										<MessageBubble message={message} isOwn={isOwn} />
									) : (
										<VoiceMessagePlayer message={message} isOwn={isOwn} />
									)}
								</div>
							</div>
						);
					})
				)}
				<div ref={messagesEndRef} />
			</div>
		</div>
	);
};

export default ChatWindow;

