import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import type { ChatConversationResponseDTO } from '@/types/chat.types';
import MessageBubble from './MessageBubble';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import { useTranslation } from '@/hooks/useTranslation';
import Logo from '@/components/Logo';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

// Avatar component with fallback to initials
const AvatarWithFallback: React.FC<{
	imageUrl?: string;
	initials: string;
	alt: string;
	className?: string;
	avatarColor: string;
}> = ({ imageUrl, initials, alt, className, avatarColor }) => {
	const [imageError, setImageError] = useState(false);

	if (!imageUrl || imageError) {
		return (
			<div className={cn("rounded-full flex items-center justify-center", className, avatarColor)}>
				<span className="text-lg font-semibold">
					{initials}
				</span>
			</div>
		);
	}

	return (
		<div className={cn("rounded-full flex items-center justify-center overflow-hidden", className)}>
			<img 
				src={imageUrl} 
				alt={alt}
				className="h-full w-full object-cover"
				onError={() => setImageError(true)}
			/>
		</div>
	);
};

interface ChatWindowProps {
	conversation: ChatConversationResponseDTO;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation }) => {
	const { t, language } = useTranslation();
	const isRTL = language === 'ar';
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
	// For admin: show customer first name, last name, and image
	const clientName = isUserAdmin
		? (conversation.customerFirstName && conversation.customerLastName
			? `${conversation.customerFirstName} ${conversation.customerLastName}`
			: conversation.customerName || conversation.customerEmail || 'Customer')
		: (conversation.adminName || 'Admin');
	const clientImage = isUserAdmin ? conversation.customerImageUrl : undefined;
	const clientInitials = isUserAdmin && conversation.customerFirstName && conversation.customerLastName
		? `${conversation.customerFirstName.charAt(0)}${conversation.customerLastName.charAt(0)}`.toUpperCase()
		: clientName.charAt(0).toUpperCase();

	// Generate a professional color based on conversation ID
	const getAvatarColor = (id: number) => {
		const colors = [
			'bg-primary text-primary-foreground',
			'bg-blue-600 text-white',
			'bg-indigo-600 text-white',
			'bg-teal-600 text-white',
			'bg-slate-600 text-white',
		];
		return colors[id % colors.length];
	};

	// Group messages by date
	const groupedMessages = React.useMemo(() => {
		const groups: { date: Date; messages: typeof conversationMessages }[] = [];
		let currentDate: Date | null = null;
		let currentGroup: typeof conversationMessages = [];

		conversationMessages.forEach((message) => {
			const messageDate = new Date(message.createdAt);
			const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());

			if (!currentDate || !isSameDay(currentDate, messageDay)) {
				if (currentGroup.length > 0) {
					groups.push({ date: currentDate!, messages: currentGroup });
				}
				currentDate = messageDay;
				currentGroup = [message];
			} else {
				currentGroup.push(message);
			}
		});

		if (currentGroup.length > 0 && currentDate) {
			groups.push({ date: currentDate, messages: currentGroup });
		}

		return groups;
	}, [conversationMessages]);

	const formatDateHeader = (date: Date) => {
		if (isToday(date)) {
			return t('chat.today') || 'Today';
		} else if (isYesterday(date)) {
			return t('chat.yesterday') || 'Yesterday';
		} else {
			return format(date, 'EEEE, MMMM dd, yyyy');
		}
	};

	return (
		<div className="flex flex-col h-full bg-background">
			{/* Header with Logo and Client Name */}
			<div className={cn(
				"px-4 md:px-6 py-4 border-b border-border bg-card shadow-sm flex-shrink-0",
				isRTL && "text-right"
			)}>
				<div className="flex items-center gap-3">
					{/* Avatar */}
					<div className="flex-shrink-0">
						<AvatarWithFallback
							imageUrl={clientImage}
							initials={clientInitials}
							alt={clientName}
							className="h-12 w-12 ring-2 ring-offset-2 ring-offset-background shadow-sm ring-primary/20"
							avatarColor={getAvatarColor(conversation.id)}
						/>
					</div>
					{/* Client Name and Info */}
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-lg text-foreground truncate">
							{clientName}
						</h3>
						{isUserAdmin && conversation.customerEmail && conversation.customerEmail !== conversation.customerName && (
							<p className="text-sm text-muted-foreground truncate">{conversation.customerEmail}</p>
						)}
						{isTypingInThisConversation && (
							<div className="flex items-center gap-1.5 mt-1">
								<div className="flex gap-1">
									<Circle className="h-1.5 w-1.5 fill-current text-primary animate-pulse" />
									<Circle className="h-1.5 w-1.5 fill-current text-primary animate-pulse [animation-delay:0.2s]" />
									<Circle className="h-1.5 w-1.5 fill-current text-primary animate-pulse [animation-delay:0.4s]" />
								</div>
								<p className="text-sm text-muted-foreground italic">
									{t('chat.typing') || 'Typing...'}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Messages */}
			<div
				ref={messagesContainerRef}
				className={cn(
					"flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 bg-gradient-to-b from-transparent via-background to-muted/5",
					"scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
				)}
			>
				{conversationMessages.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-center px-4">
						<div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
							<Logo asLink={false} className="h-12 w-auto opacity-50" />
						</div>
						<p className="text-muted-foreground font-medium text-lg">
							{t('chat.noMessages') || 'No messages yet'}
						</p>
						<p className="text-sm text-muted-foreground/70 mt-1">
							{t('chat.startConversation') || 'Start the conversation by sending a message'}
						</p>
					</div>
				) : (
					groupedMessages.map((group, groupIndex) => (
						<div key={group.date.toISOString()} className="space-y-4">
							{/* Date Header */}
							<div className="flex items-center justify-center my-6">
								<div className="px-4 py-1.5 bg-muted/50 rounded-full border border-border">
									<p className="text-xs font-medium text-muted-foreground">
										{formatDateHeader(group.date)}
									</p>
								</div>
							</div>

							{/* Messages in this group */}
							{group.messages.map((message, messageIndex) => {
								const isOwn = message.senderId === user?.id;
								const prevMessage = messageIndex > 0 ? group.messages[messageIndex - 1] : null;
								const nextMessage = messageIndex < group.messages.length - 1 ? group.messages[messageIndex + 1] : null;
								const showSenderName = !isOwn && message.senderName &&
									(!prevMessage || prevMessage.senderId !== message.senderId ||
										new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 300000);
								const showTime = !nextMessage || nextMessage.senderId !== message.senderId ||
									new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime() > 300000;

								return (
									<div
										key={message.id}
										className={cn(
											"flex flex-col transition-opacity animate-fadeIn",
											isOwn ? 'items-end' : 'items-start'
										)}
									>
										{showSenderName && (
											<span className="text-xs text-muted-foreground mb-1.5 px-2 font-medium">
												{message.senderName}
											</span>
										)}
										<div className={cn("flex items-end gap-2", isOwn ? 'flex-row-reverse' : 'flex-row')}>
											{message.messageType === 'Text' ? (
												<MessageBubble message={message} isOwn={isOwn} showTime={showTime} />
											) : (
												<VoiceMessagePlayer message={message} isOwn={isOwn} />
											)}
										</div>
									</div>
								);
							})}
						</div>
					))
				)}
				<div ref={messagesEndRef} className="h-4" />
			</div>
		</div>
	);
};

export default ChatWindow;

