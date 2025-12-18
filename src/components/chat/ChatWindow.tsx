import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import type { ChatConversationResponseDTO } from '@/types/chat.types';
import MessageBubble from './MessageBubble';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import { useTranslation } from '@/hooks/useTranslation';
import Logo from '@/components/Logo';
import { Circle, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

// Constant empty array to avoid creating new references
const EMPTY_MESSAGES: never[] = [];

// Create a stable selector function factory
const createMessagesSelector = (conversationId: number) => {
	return (state: ReturnType<typeof useChatStore.getState>) => {
		return state.messages.get(conversationId) || EMPTY_MESSAGES;
	};
};

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation }) => {
	const { t, language } = useTranslation();
	const isRTL = language === 'ar';
	const { user } = useAuthStore();
	const conversationId = conversation.id;
	
	// Get messages using a memoized selector
	const messagesSelector = useMemo(
		() => createMessagesSelector(conversationId),
		[conversationId]
	);
	const conversationMessages = useChatStore(messagesSelector);
	
	// Get typing status with a simple selector
	const typingUsersMap = useChatStore((state) => state.typingUsers);
	const isTypingInThisConversation = useMemo(() => {
		const typingSet = typingUsersMap.get(conversationId);
		return (typingSet?.size || 0) > 0;
	}, [typingUsersMap, conversationId]);
	
	const loadMessages = useChatStore((state) => state.loadMessages);
	const markMessagesAsRead = useChatStore((state) => state.markMessagesAsRead);
	const sendTypingIndicator = useChatStore((state) => state.sendTypingIndicator);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const loadedConversationIdRef = useRef<number | null>(null);

	useEffect(() => {
		// Only load messages if this is a different conversation
		if (loadedConversationIdRef.current !== conversationId) {
			loadedConversationIdRef.current = conversationId;
			console.log('ChatWindow - Conversation changed, loading messages for:', conversationId);
			loadMessages(conversationId, 1);
			markMessagesAsRead(conversationId);

			// Auto-scroll to bottom after messages load
			setTimeout(() => {
				messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
			}, 300);
		}
	}, [conversationId, loadMessages, markMessagesAsRead]);

	useEffect(() => {
		// Auto-scroll to bottom when messages change
		if (conversationMessages.length > 0) {
			setTimeout(() => {
				messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
			}, 100);
		}
	}, [conversationMessages.length]);

	useEffect(() => {
		// Mark messages as read when viewing
		if (conversationMessages.length > 0) {
			markMessagesAsRead(conversationId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [conversationMessages.length, conversationId]);

	const isUserAdmin = user?.roles.some((role) => ['SuperAdmin', 'Admin', 'SalesManager', 'SalesSupport', 'MaintenanceSupport'].includes(role)) || false;
	const isSuperAdmin = user?.roles.includes('SuperAdmin') || false;
	const isAdmin = user?.roles.includes('Admin') || false;
	const isSalesSupport = user?.roles.includes('SalesSupport') || false;
	const isMaintenanceSupport = user?.roles.includes('MaintenanceSupport') || false;
	// For Admin: show customer first name, last name, and image
	const clientName = isUserAdmin
		? (conversation.customerFirstName && conversation.customerLastName
			? `${conversation.customerFirstName} ${conversation.customerLastName}`
			: conversation.customerName || conversation.customerEmail || 'Customer')
		: (conversation.AdminName || 'Admin');
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
			return t('chatMessages.today') || 'Today';
		} else if (isYesterday(date)) {
			return t('chatMessages.yesterday') || 'Yesterday';
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
						<div className="flex items-center gap-2 flex-wrap">
							<h3 className="font-semibold text-lg text-foreground truncate">
								{clientName}
							</h3>
							{/* Show chat type badge for SuperAdmin, Admin, and Support roles */}
							{(isSuperAdmin || isAdmin || isSalesSupport || isMaintenanceSupport) && conversation.chatTypeName && (
								<Badge
									variant="outline"
									className={cn(
										"h-5 px-1.5 text-xs font-medium",
										conversation.chatTypeName === 'Support' && "border-blue-500 text-blue-700 dark:text-blue-400",
										conversation.chatTypeName === 'Sales' && "border-green-500 text-green-700 dark:text-green-400",
										conversation.chatTypeName === 'Maintenance' && "border-orange-500 text-orange-700 dark:text-orange-400"
									)}
								>
									<Tag className="h-3 w-3 mr-1" />
									{conversation.chatTypeName}
								</Badge>
							)}
						</div>
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
									{t('chatMessages.typing') || 'Typing...'}
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
							{t('chatMessages.noMessages') || 'No messages yet'}
						</p>
						<p className="text-sm text-muted-foreground/70 mt-1">
							{t('chatMessages.startConversation') || 'Start the conversation by sending a message'}
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
											) : message.messageType === 'Voice' ? (
												<VoiceMessagePlayer message={message} isOwn={isOwn} />
											) : message.messageType === 'Image' ? (
												<div className={cn(
													"rounded-lg overflow-hidden max-w-xs",
													isOwn ? "bg-primary/10" : "bg-muted"
												)}>
													{message.imageFileUrl ? (
														<img
															src={message.imageFileUrl}
															alt={message.imageFileName || 'Image'}
															className="w-full h-auto max-h-64 object-cover"
														/>
													) : message.imageFilePath ? (
														<img
															src={`${import.meta.env.VITE_API_BASE_URL || ''}/${message.imageFilePath}`}
															alt={message.imageFileName || 'Image'}
															className="w-full h-auto max-h-64 object-cover"
														/>
													) : null}
												</div>
											) : null}
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

