import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface ChatInputAreaProps {
	conversationId: number;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({ conversationId }) => {
	const { sendTextMessage, sendTypingIndicator } = useChatStore();
	const { t, language } = useTranslation();
	const isRTL = language === 'ar';
	const [messageText, setMessageText] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const typingTimeoutRef = useRef<NodeJS.Timeout>();
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-resize textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = 'auto';
			textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
		}
	}, [messageText]);

	const handleSendMessage = async () => {
		if (!messageText.trim()) return;

		const content = messageText.trim();
		setMessageText('');
		setIsTyping(false);
		sendTypingIndicator(conversationId, false);

		// Reset textarea height
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
		}

		try {
			await sendTextMessage(conversationId, content);
		} catch (error) {
			console.error('Failed to send message:', error);
			// Restore message on error
			setMessageText(content);
		}
	};

	const handleTyping = (value: string) => {
		setMessageText(value);

		if (!isTyping && value.trim()) {
			setIsTyping(true);
			sendTypingIndicator(conversationId, true);
		}

		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}

		typingTimeoutRef.current = setTimeout(() => {
			setIsTyping(false);
			sendTypingIndicator(conversationId, false);
		}, 3000);
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	return (
		<div className={cn(
			"flex items-end gap-3 p-3 rounded-xl border border-border bg-background shadow-sm",
			"focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all",
			isRTL && "flex-row-reverse"
		)}>
			<Textarea
				ref={textareaRef}
				value={messageText}
				onChange={(e) => handleTyping(e.target.value)}
				onKeyDown={handleKeyPress}
				placeholder={t('chatTranslations.typeMessage') || 'Type a message...'}
				className={cn(
					"flex-1 min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent",
					"focus-visible:ring-0 focus-visible:ring-offset-0",
					"placeholder:text-muted-foreground/60",
					"text-base leading-relaxed"
				)}
				rows={1}
			/>
			<Button
				onClick={handleSendMessage}
				disabled={!messageText.trim()}
				size="icon"
				className={cn(
					"h-10 w-10 rounded-full flex-shrink-0",
					"bg-primary hover:bg-primary/90",
					"disabled:opacity-50 disabled:cursor-not-allowed",
					"transition-all duration-200",
					"shadow-md hover:shadow-lg",
					messageText.trim() && "scale-105"
				)}
			>
				<Send className="h-4 w-4" />
			</Button>
		</div>
	);
};

export default ChatInputArea;

