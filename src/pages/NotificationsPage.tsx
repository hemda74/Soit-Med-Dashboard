import React, { useState, useMemo } from 'react';
import {
    Bell,
    Check,
    Search,
    MoreVertical,
    Trash2,
    CheckCheck,
    AlertCircle,
    Info,
    CheckCircle,
    AlertTriangle,
    Clock,
    Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Input from '@/components/ui/template/InputField';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useNotificationStore } from '@/stores/notificationStore';
import type { NotificationType } from '@/types/notification.types';
import { cn } from '@/lib/utils';

const NotificationsPage: React.FC = () => {
    const {
        removeNotification,
        clearAllNotifications,
        markAsRead,
        markAllAsRead,
        getNotificationsForCurrentUser
    } = useNotificationStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

    // Get notifications for current user (role-based filtering)
    const userNotifications = getNotificationsForCurrentUser();

    const filteredNotifications = useMemo(() => {
        let filtered = userNotifications;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(notification =>
                notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                notification.message?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(notification => notification.type === filterType);
        }

        // Filter by status (read/unread)
        if (filterStatus !== 'all') {
            filtered = filtered.filter(notification => {
                const isRead = notification.isRead || false;
                return filterStatus === 'read' ? isRead : !isRead;
            });
        }

        // Sort notifications
        filtered.sort((a, b) => {
            if (sortBy === 'newest') {
                return b.timestamp - a.timestamp;
            } else {
                return a.timestamp - b.timestamp;
            }
        });

        return filtered;
    }, [userNotifications, searchTerm, filterType, filterStatus, sortBy]);

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'info':
                return <Info className="h-5 w-5 text-blue-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const getNotificationBadgeColor = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'error':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'info':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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

    const handleMarkAsRead = (id: string) => {
        markAsRead(id);
    };

    const handleDeleteNotification = (id: string) => {
        removeNotification(id);
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    const handleClearAll = () => {
        clearAllNotifications();
    };

    const currentUnreadCount = filteredNotifications.filter(n => !n.isRead).length;

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Bell className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                        <p className="text-muted-foreground">
                            Manage your notifications and stay updated
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {currentUnreadCount > 0 && (
                        <Badge variant="destructive" className="text-sm">
                            {currentUnreadCount} unread
                        </Badge>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        disabled={currentUnreadCount === 0}
                    >
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Mark all as read
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAll}
                        disabled={userNotifications.length === 0}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear all
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search notifications..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-10"
                                />
                            </div>
                        </div>
                        <Select value={filterType} onValueChange={(value) => setFilterType(value as NotificationType | 'all')}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'all' | 'unread' | 'read')}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="unread">Unread</SelectItem>
                                <SelectItem value="read">Read</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'oldest')}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest first</SelectItem>
                                <SelectItem value="oldest">Oldest first</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications List */}
            <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">No notifications found</h3>
                            <p className="text-muted-foreground text-center">
                                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                                    ? 'Try adjusting your filters to see more notifications.'
                                    : 'You\'re all caught up! No notifications at the moment.'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredNotifications.map((notification) => {
                        const isRead = notification.isRead || false;
                        return (
                            <Card key={notification.id} className={cn(
                                "transition-all duration-200 hover:shadow-md",
                                !isRead && "border-l-4 border-l-primary bg-primary/5"
                            )}>
                                <CardContent className="p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h3 className={cn(
                                                            "text-lg font-semibold text-foreground",
                                                            !isRead && "font-bold"
                                                        )}>
                                                            {notification.title}
                                                        </h3>
                                                        <Badge
                                                            variant="secondary"
                                                            className={cn("text-xs", getNotificationBadgeColor(notification.type))}
                                                        >
                                                            {notification.type}
                                                        </Badge>
                                                        {!isRead && (
                                                            <Badge variant="default" className="text-xs">
                                                                New
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {notification.message && (
                                                        <p className="text-muted-foreground mb-3">
                                                            {notification.message}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{formatTimestamp(notification.timestamp)}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>{new Date(notification.timestamp).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {!isRead && (
                                                            <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                                                                <Check className="h-4 w-4 mr-2" />
                                                                Mark as read
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteNotification(notification.id)}
                                                            className="text-red-600 dark:text-red-400"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Bell className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold text-foreground">{userNotifications.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Errors</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {userNotifications.filter(n => n.type === 'error').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Success</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {userNotifications.filter(n => n.type === 'success').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Info className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Info</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {userNotifications.filter(n => n.type === 'info').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default NotificationsPage;
