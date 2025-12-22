import React, { useEffect, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import ChatList from '@/components/chat/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatInputArea from '@/components/chat/ChatInputArea';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { MessageSquare, WifiOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChatPage: React.FC = () => {
	const { t, language } = useTranslation();
	const isRTL = language === 'ar';
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

	const [userRoles, setUserRoles] = useState<string[]>([]);
	const [isSuperAdmin, setIsSuperAdmin] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [isSalesSupport, setIsSalesSupport] = useState(false);
	const [isMaintenanceSupport, setIsMaintenanceSupport] = useState(false);

	useEffect(() => {
		// Get user roles
		const roles = user?.roles || [];
		setUserRoles(roles);

		// Check specific roles
		const superAdmin = roles.includes('SuperAdmin');
		const Admin = roles.includes('Admin');
		const salesSupport = roles.includes('SalesSupport');
		const maintenanceSupport = roles.includes('MaintenanceSupport');

		setIsSuperAdmin(superAdmin);
		setIsAdmin(Admin);
		setIsSalesSupport(salesSupport);
		setIsMaintenanceSupport(maintenanceSupport);

		console.log('ChatPage - User:', user?.id, 'Roles:', roles);

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

	// Monitor connection status and attempt to reconnect if needed
	useEffect(() => {
		if (!isConnected && user) {
			// If disconnected and user is logged in, try to reconnect
			const reconnectTimer = setTimeout(() => {
				console.log('Attempting to reconnect to chat...');
				initialize();
			}, 3000); // Wait 3 seconds before attempting reconnect

			return () => clearTimeout(reconnectTimer);
		}
	}, [isConnected, user]);

	if (loading && (!conversations || conversations.length === 0)) {
		return (
			<div className="flex items-center justify-center h-screen bg-background">
				<div className="text-center space-y-4">
					<div className="relative">
						<div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary mx-auto"></div>
						<MessageSquare className="absolute inset-0 m-auto h-6 w-6 text-primary" />
					</div>
					<p className="text-muted-foreground text-lg font-medium">
						{t('chatTranslations.loading') || 'Loading chat...'}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className={cn(
			"flex flex-col h-[calc(100vh-5rem)] bg-background",
			"-mx-4 md:-mx-6 px-4 md:px-6",
			"relative",
			isRTL && "rtl"
		)}>
			<div className="flex-1 flex overflow-hidden min-h-0 gap-0">
				{/* Chat List Sidebar */}
				<div className={cn(
					"w-full md:w-80 lg:w-96 border-r border-border bg-card flex-shrink-0 flex flex-col shadow-sm",
					isRTL && "border-l border-r-0"
				)}>
					<ChatList
						conversations={conversations}
						currentConversationId={currentConversation?.id}
						onSelectConversation={(conversation) => setCurrentConversation(conversation)}
						isAdmin={isAdmin || isSalesSupport || isMaintenanceSupport || isSuperAdmin}
						isSuperAdmin={isSuperAdmin}
						userRole={isSuperAdmin ? 'SuperAdmin' : isAdmin ? 'Admin' : isSalesSupport ? 'SalesSupport' : isMaintenanceSupport ? 'MaintenanceSupport' : 'Customer'}
					/>
				</div>

				{/* Chat Window */}
				<div className="flex-1 flex flex-col min-w-0 bg-background">
					{currentConversation ? (
						<ChatWindow conversation={currentConversation} />
					) : (
						<div className="flex-1 flex items-center justify-center bg-muted/30">
							<Card className="p-12 text-center max-w-md mx-4 shadow-md border border-border">
								<div className="space-y-4">
									<div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
										<MessageSquare className="h-8 w-8 text-primary" />
									</div>
									<div className="space-y-2">
										<h3 className="text-xl font-semibold text-foreground">
											{t('chatTranslations.welcome') || 'Welcome to Chat'}
										</h3>
										<p className="text-muted-foreground">
											{isSuperAdmin
												? (t('chatTranslations.selectConversationSuperAdmin') || 'Select a conversation from the sidebar to view and respond. You can see all chat types.')
												: (isAdmin || isSalesSupport || isMaintenanceSupport)
													? (t('chatTranslations.selectConversationAdmin') || 'Select a conversation from the sidebar to respond to customer messages')
													: (t('chatTranslations.selectConversation') || 'Select a conversation from the sidebar to start chatting')
											}
										</p>
									</div>
								</div>
							</Card>
						</div>
					)}
				</div>
			</div>

			{/* Input Area - Fixed at bottom */}
			{currentConversation && currentConversation.id && (
				<div className={cn(
					"w-full px-4 md:px-6 py-4 border-t border-border bg-card/95 backdrop-blur-sm shadow-lg flex-shrink-0 relative z-10",
					isRTL && "border-t"
				)}>
					<div className="max-w-7xl mx-auto">
						<ChatInputArea conversationId={currentConversation.id} />
					</div>
				</div>
			)}

			{/* Connection Status */}
			{!isConnected && (
				<div className={cn(
					"bg-yellow-500/10 border-t border-yellow-500/30 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2 backdrop-blur-sm",
					isRTL && "flex-row-reverse"
				)}>
					<WifiOff className="h-4 w-4 flex-shrink-0" />
					<span>{t('chatTranslations.disconnected')}</span>
				</div>
			)}

			{error && (
				<div className={cn(
					"bg-destructive/10 border-t border-destructive/30 px-4 py-3 text-sm text-destructive flex items-center gap-2 backdrop-blur-sm",
					isRTL && "flex-row-reverse"
				)}>
					<AlertCircle className="h-4 w-4 flex-shrink-0" />
					<span>{error}</span>
				</div>
			)}
		</div>
	);
};

export default ChatPage;

