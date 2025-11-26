import React, { useEffect, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import ChatList from '@/components/chat/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

const ChatPage: React.FC = () => {
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const {
		conversations,
		currentConversation,
		isConnected,
		loading,
		error,
		loadConversations,
		setCurrentConversation,
		initialize,
		disconnect,
	} = useChatStore();

	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		// Check if user is admin
		const adminRoles = ['SuperAdmin', 'SalesManager', 'SalesSupport'];
		setIsAdmin(user?.roles.some((role) => adminRoles.includes(role)) || false);

		// Initialize chat
		initialize();
		loadConversations();

		// Cleanup on unmount
		return () => {
			disconnect();
		};
	}, [user]);

	useEffect(() => {
		// Refresh conversations periodically
		const interval = setInterval(() => {
			loadConversations();
		}, 30000); // Every 30 seconds

		return () => clearInterval(interval);
	}, []);

	if (loading && conversations.length === 0) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">{t('chat.loading') || 'Loading chat...'}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-[calc(100vh-4rem)] flex flex-col">
			<div className="flex-1 flex overflow-hidden">
				{/* Chat List Sidebar */}
				<div className="w-80 border-r bg-background">
					<ChatList
						conversations={conversations}
						currentConversationId={currentConversation?.id}
						onSelectConversation={(conversation) => setCurrentConversation(conversation)}
						isAdmin={isAdmin}
					/>
				</div>

				{/* Chat Window */}
				<div className="flex-1 flex flex-col">
					{currentConversation ? (
						<ChatWindow conversation={currentConversation} />
					) : (
						<div className="flex-1 flex items-center justify-center bg-muted/30">
							<Card className="p-8 text-center">
								<p className="text-muted-foreground text-lg">
									{t('chat.selectConversation') || 'Select a conversation to start chatting'}
								</p>
							</Card>
						</div>
					)}
				</div>
			</div>

			{/* Connection Status */}
			{!isConnected && (
				<div className="bg-yellow-500/10 border-t border-yellow-500/20 px-4 py-2 text-sm text-yellow-600 dark:text-yellow-400">
					{t('chat.disconnected') || 'Disconnected from chat server. Reconnecting...'}
				</div>
			)}

			{error && (
				<div className="bg-destructive/10 border-t border-destructive/20 px-4 py-2 text-sm text-destructive">
					{error}
				</div>
			)}
		</div>
	);
};

export default ChatPage;

