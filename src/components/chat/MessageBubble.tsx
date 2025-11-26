import React from 'react';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import type { ChatMessageResponseDTO } from '@/types/chat.types';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
	message: ChatMessageResponseDTO;
	isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
	return (
		<div className={cn('flex flex-col max-w-[70%]', isOwn ? 'items-end' : 'items-start')}>
			<Card
				className={cn(
					'px-4 py-2',
					isOwn
						? 'bg-primary text-primary-foreground'
						: 'bg-muted text-muted-foreground'
				)}
			>
				<p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
			</Card>
			<div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
				<span>{format(new Date(message.createdAt), 'HH:mm')}</span>
				{isOwn && (
					<span>
						{message.isRead ? (
							<CheckCheck className="h-3 w-3 text-blue-500" />
						) : (
							<Check className="h-3 w-3" />
						)}
					</span>
				)}
			</div>
		</div>
	);
};

export default MessageBubble;

