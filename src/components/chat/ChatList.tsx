import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format, isToday, isYesterday } from 'date-fns';
import type { ChatConversationResponseDTO } from '@/types/chat.types';
import { useTranslation } from '@/hooks/useTranslation';
import { Search, MessageSquare, Users, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

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
				<span className="text-sm font-semibold">
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

interface ChatListProps {
	conversations: ChatConversationResponseDTO[];
	currentConversationId?: number;
	onSelectConversation: (conversation: ChatConversationResponseDTO) => void;
	isAdmin: boolean;
	isSuperAdmin?: boolean;
	userRole?: string;
}

const ChatList: React.FC<ChatListProps> = ({
	conversations,
	currentConversationId,
	onSelectConversation,
	isAdmin,
	isSuperAdmin = false,
	userRole = 'Customer',
}) => {
	const { t, language } = useTranslation();
	const isRTL = language === 'ar';
	const [searchQuery, setSearchQuery] = useState('');

	// Ensure conversations is always an array
	const safeConversations = conversations || [];

	// Filter conversations based on search query
	const filteredConversations = useMemo(() => {
		if (!searchQuery.trim()) return safeConversations;

		const query = searchQuery.toLowerCase();
		return safeConversations.filter((conv) => {
			const displayName = isAdmin
				? (conv.customerName || conv.customerEmail || '')
				: (conv.adminName || 'Admin');
			const email = isAdmin ? (conv.customerEmail || '') : '';
			const preview = conv.lastMessagePreview || '';

			return (
				displayName.toLowerCase().includes(query) ||
				email.toLowerCase().includes(query) ||
				preview.toLowerCase().includes(query)
			);
		});
	}, [safeConversations, searchQuery, isAdmin]);

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

	const formatMessageTime = (date: Date) => {
		if (isToday(date)) {
			return format(date, 'HH:mm');
		} else if (isYesterday(date)) {
			return t('chat.yesterday') || 'Yesterday';
		} else {
			return format(date, 'MMM dd');
		}
	};

	return (
		<div className="h-full flex flex-col">
			{/* Header */}
			<div className={cn(
				"p-4 border-b border-border bg-card flex-shrink-0",
				isRTL && "text-right"
			)}>
					<div className="flex items-center gap-2 mb-3">
					<MessageSquare className="h-5 w-5 text-primary" />
					<h2 className="text-lg font-semibold text-foreground">
						{isSuperAdmin 
							? (t('chat.allConversations') || 'All Conversations')
							: isAdmin
							? (t('chat.supportConversations') || 'Support Chats')
							: userRole === 'SalesSupport'
							? (t('chat.salesConversations') || 'Sales Chats')
							: userRole === 'MaintenanceSupport'
							? (t('chat.maintenanceConversations') || 'Maintenance Chats')
							: (t('chat.conversations') || 'Conversations')
						}
					</h2>
					{safeConversations.length > 0 && (
						<Badge variant="secondary" className="ml-auto">
							{safeConversations.length}
						</Badge>
					)}
				</div>

				{/* Search Input */}
				{safeConversations.length > 0 && (
					<div className="relative">
						<Search className={cn(
							"absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
							isRTL ? "right-3" : "left-3"
						)} />
						<Input
							type="text"
							placeholder={t('chat.searchConversations') || 'Search conversations...'}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className={cn(
								"w-full pl-9 pr-3 bg-background border-border focus:bg-background",
								"focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all",
								isRTL && "pr-9 pl-3"
							)}
						/>
					</div>
				)}
			</div>

			{/* Conversations List */}
			<div className="flex-1 overflow-y-auto">
				{safeConversations.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full p-8 text-center">
						<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
							<Users className="h-8 w-8 text-muted-foreground" />
						</div>
						<p className="text-muted-foreground font-medium">
							{t('chat.noConversations') || 'No conversations yet'}
						</p>
						<p className="text-sm text-muted-foreground/70 mt-1">
							{isAdmin 
								? (t('chat.waitForCustomer') || 'Wait for customers to start conversations. You can respond to existing conversations.')
								: (t('chat.startConversation') || 'Start a new conversation to begin chatting')
							}
						</p>
					</div>
				) : filteredConversations.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full p-8 text-center">
						<Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
						<p className="text-muted-foreground font-medium">
							{t('chat.noResults') || 'No conversations found'}
						</p>
						<p className="text-sm text-muted-foreground/70 mt-1">
							{t('chat.tryDifferentSearch') || 'Try a different search term'}
						</p>
					</div>
				) : (
					<div className="divide-y divide-border/50">
						{filteredConversations.map((conversation) => {
							const isSelected = conversation.id === currentConversationId;
							// For admin: show customer first name, last name, and image
							const displayName = isAdmin
								? (conversation.customerFirstName && conversation.customerLastName
									? `${conversation.customerFirstName} ${conversation.customerLastName}`
									: conversation.customerName || conversation.customerEmail || 'Customer')
								: (conversation.adminName || 'Admin');
							const hasUnread = conversation.unreadCount > 0;
							const customerImage = isAdmin ? conversation.customerImageUrl : undefined;
							const initials = isAdmin && conversation.customerFirstName && conversation.customerLastName
								? `${conversation.customerFirstName.charAt(0)}${conversation.customerLastName.charAt(0)}`.toUpperCase()
								: displayName.charAt(0).toUpperCase();

							return (
								<div
									key={conversation.id}
									onClick={() => onSelectConversation(conversation)}
									className={cn(
										"p-4 cursor-pointer transition-all duration-200 border-l-4",
										"hover:bg-muted/50 active:bg-muted/70",
										isSelected
											? "bg-primary/5 border-primary"
											: "border-transparent hover:border-primary/20",
										isRTL && "border-l-0 border-r-4"
									)}
								>
									<div className="flex items-start justify-between gap-3">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1.5">
												<AvatarWithFallback
													imageUrl={customerImage}
													initials={initials}
													alt={displayName}
													className={cn(
														"h-10 w-10 flex-shrink-0 shadow-sm",
														hasUnread && "ring-2 ring-primary/30"
													)}
													avatarColor={getAvatarColor(conversation.id)}
												/>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 flex-wrap">
														<p className={cn(
															"font-semibold truncate",
															hasUnread ? "text-foreground" : "text-foreground/80"
														)}>
															{displayName}
														</p>
														{/* Show chat type badge for SuperAdmin */}
														{isSuperAdmin && conversation.chatTypeName && (
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
														{hasUnread && (
															<Badge
																variant="destructive"
																className="h-5 min-w-5 px-1.5 flex items-center justify-center text-xs font-bold"
															>
																{conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
															</Badge>
														)}
													</div>
													{conversation.lastMessagePreview && (
														<p className={cn(
															"text-sm truncate mt-0.5",
															hasUnread
																? "text-foreground font-medium"
																: "text-muted-foreground"
														)}>
															{conversation.lastMessagePreview}
														</p>
													)}
												</div>
											</div>
											<p className={cn(
												"text-xs mt-1.5",
												hasUnread ? "text-primary font-medium" : "text-muted-foreground"
											)}>
												{formatMessageTime(new Date(conversation.lastMessageAt))}
											</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default ChatList;

