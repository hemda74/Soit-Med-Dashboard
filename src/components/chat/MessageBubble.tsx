import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import type { ChatMessageResponseDTO } from '@/types/chat.types';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
	message: ChatMessageResponseDTO;
	isOwn: boolean;
	showTime?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, showTime = true }) => {

	return (
		<div className={cn('flex flex-col max-w-[75%] md:max-w-[65%]', isOwn ? 'items-end' : 'items-start')}>
			<div
				className={cn(
					'relative px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200',
					'break-words whitespace-pre-wrap',
					isOwn
						? 'bg-primary text-primary-foreground rounded-br-md'
						: 'bg-card border border-border text-foreground rounded-bl-md',
					'hover:shadow-md'
				)}
			>
				<p className={cn("text-sm leading-relaxed", isOwn && "text-primary-foreground")}>{message.content}</p>

				{/* Tail indicator */}
				<div
					className={cn(
						'absolute bottom-0 w-3 h-3',
						isOwn
							? 'right-0 translate-x-full bg-primary'
							: 'left-0 -translate-x-full bg-card border-l border-b border-border'
					)}
					style={{
						clipPath: isOwn
							? 'polygon(0 0, 100% 0, 0 100%)'
							: 'polygon(100% 0, 100% 100%, 0 0)'
					}}
				/>
			</div>

			{showTime && (
				<div className={cn(
					"flex items-center gap-1.5 mt-1.5 px-2",
					isOwn && "flex-row-reverse"
				)}>
					<span className="text-xs text-muted-foreground">
						{format(new Date(message.createdAt), 'HH:mm')}
					</span>
					{isOwn && (
						<span className="flex items-center">
							{message.isRead ? (
								<CheckCheck className="h-3.5 w-3.5 text-primary drop-shadow-sm" />
							) : (
								<Check className="h-3.5 w-3.5 text-muted-foreground" />
							)}
						</span>
					)}
				</div>
			)}
		</div>
	);
};

export default MessageBubble;

