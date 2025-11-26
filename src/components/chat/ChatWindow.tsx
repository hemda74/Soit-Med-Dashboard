import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Send, Mic } from 'lucide-react';
import type { ChatConversationResponseDTO } from '@/types/chat.types';
import MessageBubble from './MessageBubble';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import { useTranslation } from '@/hooks/useTranslation';

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

	const [messageText, setMessageText] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const typingTimeoutRef = useRef<NodeJS.Timeout>();

	const conversationMessages = messages.get(conversation.id) || [];
	const isTypingInThisConversation = typingUsers.get(conversation.id)?.size > 0;

	useEffect(() => {
		loadMessages(conversation.id);
		markMessagesAsRead(conversation.id);
	}, [conversation.id]);

	useEffect(() => {
		// Scroll to bottom when new messages arrive
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [conversationMessages]);

	useEffect(() => {
		// Mark messages as read when viewing
		markMessagesAsRead(conversation.id);
	}, [conversationMessages, conversation.id]);

	const handleSendMessage = async () => {
		if (!messageText.trim()) return;

		const content = messageText.trim();
		setMessageText('');
		setIsTyping(false);
		sendTypingIndicator(conversation.id, false);

		try {
			await sendTextMessage(conversation.id, content);
		} catch (error) {
			console.error('Failed to send message:', error);
		}
	};

	const handleTyping = (value: string) => {
		setMessageText(value);

		if (!isTyping && value.trim()) {
			setIsTyping(true);
			sendTypingIndicator(conversation.id, true);
		}

		// Clear existing timeout
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}

		// Set timeout to stop typing indicator
		typingTimeoutRef.current = setTimeout(() => {
			setIsTyping(false);
			sendTypingIndicator(conversation.id, false);
		}, 3000);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="p-4 border-b bg-background">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="font-semibold">
							{conversation.customerName || conversation.customerEmail || 'Customer'}
						</h3>
						{isTypingInThisConversation && (
							<p className="text-sm text-muted-foreground">{t('chat.typing') || 'Typing...'}</p>
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
					conversationMessages.map((message) => (
						<div
							key={message.id}
							className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
						>
							{message.messageType === 'Text' ? (
								<MessageBubble message={message} isOwn={message.senderId === user?.id} />
							) : (
								<VoiceMessagePlayer message={message} isOwn={message.senderId === user?.id} />
							)}
						</div>
					))
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input Area */}
			<div className="p-4 border-t bg-background">
				<div className="flex gap-2">
					<Input
						value={messageText}
						onChange={(e) => handleTyping(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder={t('chat.typeMessage') || 'Type a message...'}
						className="flex-1"
					/>
					<Button onClick={handleSendMessage} disabled={!messageText.trim()}>
						<Send className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ChatWindow;

