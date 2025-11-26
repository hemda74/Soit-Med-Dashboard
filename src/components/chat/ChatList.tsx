import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { ChatConversationResponseDTO } from '@/types/chat.types';
import { useTranslation } from '@/hooks/useTranslation';

interface ChatListProps {
	conversations: ChatConversationResponseDTO[];
	currentConversationId?: number;
	onSelectConversation: (conversation: ChatConversationResponseDTO) => void;
	isAdmin: boolean;
}

const ChatList: React.FC<ChatListProps> = ({
	conversations,
	currentConversationId,
	onSelectConversation,
	isAdmin,
}) => {
	const { t, language } = useTranslation();
	const isArabic = language === 'ar';

	if (conversations.length === 0) {
		return (
			<div className="p-4 text-center text-muted-foreground">
				<p>{t('chat.noConversations') || 'No conversations yet'}</p>
			</div>
		);
	}

	return (
		<div className="h-full overflow-y-auto">
			<div className="p-4 border-b">
				<h2 className="text-lg font-semibold">{t('chat.conversations') || 'Conversations'}</h2>
			</div>
			<div className="divide-y">
				{conversations.map((conversation) => {
					const isSelected = conversation.id === currentConversationId;
					const displayName = isAdmin ? conversation.customerName || conversation.customerEmail : conversation.adminName || 'Admin';

					return (
						<Card
							key={conversation.id}
							className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
								isSelected ? 'bg-muted' : ''
							}`}
							onClick={() => onSelectConversation(conversation)}
						>
							<div className="flex items-start justify-between gap-2">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<p className="font-medium truncate">{displayName}</p>
										{conversation.unreadCount > 0 && (
											<Badge variant="destructive" className="ml-auto">
												{conversation.unreadCount}
											</Badge>
										)}
									</div>
									{conversation.lastMessagePreview && (
										<p className="text-sm text-muted-foreground truncate">
											{conversation.lastMessagePreview}
										</p>
									)}
									<p className="text-xs text-muted-foreground mt-1">
										{format(new Date(conversation.lastMessageAt), 'MMM dd, HH:mm')}
									</p>
								</div>
							</div>
						</Card>
					);
				})}
			</div>
		</div>
	);
};

export default ChatList;

