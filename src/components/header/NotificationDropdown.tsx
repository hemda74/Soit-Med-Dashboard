import React, { useState, useEffect } from 'react';
import { Bell, Clock, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotificationStore } from '@/stores/notificationStore';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@/types/notification.types';

const NotificationDropdown: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        unreadCount,
        connectionStatus,
        loading,
        getNotificationsForCurrentUser,
        markAsRead,
        initialize
    } = useNotificationStore();

    const [isInitialized, setIsInitialized] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Initialize notifications on component mount
    useEffect(() => {
        if (!isInitialized) {
            initialize().then(() => {
                setIsInitialized(true);
            });
        }
    }, [initialize, isInitialized]);

    // Get notifications for current user (role-based filtering)
    const userNotifications = getNotificationsForCurrentUser();
    const lastNotifications = userNotifications
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 3);

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />;
            case 'error':
                return <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />;
            case 'warning':
                return <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />;
            case 'info':
                return <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />;
            default:
                return <div className="w-2 h-2 rounded-full bg-gray-500 mt-2" />;
        }
    };

    const formatTimestamp = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const handleNotificationClick = (notification: Notification) => {
        // Close dropdown first
        setDropdownOpen(false);

        // Mark as read
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        // Navigate based on notification data (same logic as NotificationsPage)
        if (notification.data) {
            // Handle offer notifications - navigate to offer details page
            if (notification.data.offerId) {
                const offerId = notification.data.offerId;
                navigate(`/sales-support?offerId=${offerId}`);
                return;
            }

            // Handle offer request notifications - navigate directly to the request
            if (notification.data.offerRequestId || notification.data.requestWorkflowId) {
                const requestId = notification.data.offerRequestId || notification.data.requestWorkflowId;
                navigate(`/sales-support/requests?requestId=${requestId}`);
                return;
            }

            // Handle client-related notifications
            if (notification.data.clientId) {
                navigate(`/sales-support?clientId=${notification.data.clientId}`);
                return;
            }

            // Handle task progress notifications
            if (notification.data.taskProgressId) {
                navigate(`/dashboard?taskProgressId=${notification.data.taskProgressId}`);
                return;
            }
        }

        // If notification has a custom link, navigate to it
        if (notification.link) {
            navigate(notification.link);
            return;
        }

        // Fallback: Navigate to notifications page
        // Store notification ID in sessionStorage to potentially highlight it
        if (notification.id) {
            sessionStorage.setItem('highlightNotificationId', notification.id);
        }
        navigate('/notifications');
    };

    const getConnectionStatusIcon = () => {
        if (connectionStatus.isConnected) {
            return <Wifi className="h-3 w-3 text-green-500" />;
        } else if (connectionStatus.isReconnecting) {
            return <Loader2 className="h-3 w-3 text-yellow-500 animate-spin" />;
        } else {
            return <WifiOff className="h-3 w-3 text-red-500" />;
        }
    };

    const getConnectionStatusText = () => {
        if (connectionStatus.isConnected) {
            return 'Connected';
        } else if (connectionStatus.isReconnecting) {
            return 'Reconnecting...';
        } else {
            return 'Disconnected';
        }
    };

    return (
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="relative w-10 h-10 p-0 hover:bg-primary/10 transition-colors"
                >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 z-[10000]">
                {/* Header */}
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{t('notifications')}</h3>
                        <div className="flex items-center gap-2">
                            {getConnectionStatusIcon()}
                            <span className="text-xs text-muted-foreground">
                                {getConnectionStatusText()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-muted-foreground">
                            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                            <p className="text-sm">Loading notifications...</p>
                        </div>
                    ) : lastNotifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        lastNotifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "p-4 hover:bg-muted/50 cursor-pointer",
                                    !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
                                )}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start gap-3 w-full">
                                    {getNotificationIcon(notification.type)}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className={cn(
                                                "text-sm font-medium truncate",
                                                !notification.isRead ? "text-foreground font-semibold" : "text-muted-foreground"
                                            )}>
                                                {notification.title}
                                            </p>
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                            )}
                                        </div>
                                        {notification.message && (
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>{formatTimestamp(notification.timestamp)}</span>
                                        </div>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>

                {/* Footer with View All Link */}
                <div className="p-2 border-t">
                    <Link to="/notifications">
                        <Button
                            variant="ghost"
                            className="w-full text-sm hover:bg-primary/10 transition-colors"
                        >
                            View all notifications
                        </Button>
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationDropdown;
