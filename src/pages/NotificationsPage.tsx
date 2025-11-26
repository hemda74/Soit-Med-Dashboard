import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerformance } from '@/hooks/usePerformance';
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
    Calendar,
    Sparkles,
    Filter,
    ArrowRight,
    FileText,
    User,
    Target
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
    usePerformance('NotificationsPage');
    const navigate = useNavigate();
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

    // Highlight notification if coming from dropdown
    React.useEffect(() => {
        const highlightId = sessionStorage.getItem('highlightNotificationId');
        if (highlightId) {
            sessionStorage.removeItem('highlightNotificationId');
            // Scroll to notification if it exists
            setTimeout(() => {
                const element = document.querySelector(`[data-notification-id="${highlightId}"]`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Add a temporary highlight class
                    element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
                    setTimeout(() => {
                        element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
                    }, 2000);
                }
            }, 100);
        }
    }, []);

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

    const getNotificationIcon = (type: NotificationType, size: 'sm' | 'md' = 'md') => {
        const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
        const baseClasses = cn(iconSize, "transition-transform duration-200");
        
        switch (type) {
            case 'success':
                return <CheckCircle className={cn(baseClasses, "text-green-500")} />;
            case 'error':
                return <AlertCircle className={cn(baseClasses, "text-red-500")} />;
            case 'warning':
                return <AlertTriangle className={cn(baseClasses, "text-yellow-500")} />;
            case 'info':
                return <Info className={cn(baseClasses, "text-blue-500")} />;
            default:
                return <Bell className={cn(baseClasses, "text-gray-500")} />;
        }
    };

    const getNotificationIconBg = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30';
            case 'error':
                return 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30';
            case 'warning':
                return 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30';
            case 'info':
                return 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30';
            default:
                return 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30';
        }
    };

    const getNotificationActionIcon = (notification: any) => {
        if (notification.data?.offerId) {
            return <FileText className="h-4 w-4" />;
        }
        if (notification.data?.offerRequestId || notification.data?.requestWorkflowId) {
            return <FileText className="h-4 w-4" />;
        }
        if (notification.data?.clientId) {
            return <User className="h-4 w-4" />;
        }
        if (notification.data?.taskProgressId) {
            return <Target className="h-4 w-4" />;
        }
        return <ArrowRight className="h-4 w-4" />;
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

    const handleNotificationClick = (notification: any) => {
        // Mark as read
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        // Navigate based on notification data
        if (notification.data) {
            // Handle offer notifications - navigate to offer details page
            if (notification.data.offerId) {
                const offerId = notification.data.offerId;
                navigate(`/dashboard?tab=my-offers&offerId=${offerId}`);
                return;
            }

            // Handle offer request notifications
            if (notification.data.offerRequestId || notification.data.requestWorkflowId) {
                const requestId = notification.data.offerRequestId || notification.data.requestWorkflowId;
                navigate(`/dashboard?tab=requests&requestId=${requestId}`);
                return;
            }

            // Handle client-related notifications
            if (notification.data.clientId) {
                navigate(`/dashboard?tab=clients&clientId=${notification.data.clientId}`);
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
        }
    };

    const currentUnreadCount = filteredNotifications.filter(n => !n.isRead).length;

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-7xl">
            {/* Header with Gradient Background */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 mb-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl" />
                            <div className="relative bg-gradient-to-br from-primary to-primary/80 p-3 rounded-xl shadow-lg">
                                <Bell className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    Notifications
                                </h1>
                                {currentUnreadCount > 0 && (
                                    <Badge 
                                        variant="destructive" 
                                        className="text-sm px-3 py-1 animate-pulse shadow-lg"
                                    >
                                        {currentUnreadCount} new
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground mt-1 text-lg">
                                Stay updated with real-time notifications
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            disabled={currentUnreadCount === 0}
                            className="shadow-sm hover:shadow-md transition-all"
                        >
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Mark all as read
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearAll}
                            disabled={userNotifications.length === 0}
                            className="shadow-sm hover:shadow-md transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear all
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="border-b bg-gradient-to-r from-background to-muted/30">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg font-semibold">Filters & Search</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[250px]">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Search notifications..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-11 border-2 focus:border-primary transition-all"
                                />
                            </div>
                        </div>
                        <Select value={filterType} onValueChange={(value) => setFilterType(value as NotificationType | 'all')}>
                            <SelectTrigger className="w-[160px] h-11 border-2">
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
                            <SelectTrigger className="w-[160px] h-11 border-2">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="unread">Unread</SelectItem>
                                <SelectItem value="read">Read</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'oldest')}>
                            <SelectTrigger className="w-[160px] h-11 border-2">
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
            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <Card className="border-2 border-dashed shadow-lg">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
                                <Bell className="relative h-16 w-16 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">No notifications found</h3>
                            <p className="text-muted-foreground text-center max-w-md">
                                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                                    ? 'Try adjusting your filters to see more notifications.'
                                    : 'You\'re all caught up! No notifications at the moment.'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredNotifications.map((notification, index) => {
                        const isRead = notification.isRead || false;
                        const hasNavigationData = notification.data?.offerId ||
                            notification.data?.offerRequestId ||
                            notification.data?.requestWorkflowId ||
                            notification.data?.clientId ||
                            notification.data?.taskProgressId ||
                            notification.link;
                        return (
                            <Card
                                key={notification.id}
                                data-notification-id={notification.id}
                                className={cn(
                                    "transition-all duration-300 group",
                                    "hover:shadow-xl hover:scale-[1.01]",
                                    !isRead && "border-l-4 border-l-primary shadow-lg bg-gradient-to-r from-primary/5 via-primary/5 to-transparent",
                                    isRead && "border-l-4 border-l-transparent hover:border-l-primary/30",
                                    hasNavigationData && "cursor-pointer hover:bg-primary/5"
                                )}
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                    animation: 'fadeInUp 0.5s ease-out'
                                }}
                                onClick={() => hasNavigationData && handleNotificationClick(notification)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Icon with gradient background */}
                                        <div className={cn(
                                            "flex-shrink-0 mt-1 p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                                            getNotificationIconBg(notification.type)
                                        )}>
                                            {getNotificationIcon(notification.type, 'md')}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center flex-wrap gap-2 mb-2">
                                                        <h3 className={cn(
                                                            "text-lg font-semibold text-foreground transition-colors",
                                                            !isRead && "font-bold text-foreground"
                                                        )}>
                                                            {notification.title}
                                                        </h3>
                                                        {!isRead && (
                                                            <div className="relative">
                                                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm" />
                                                                <Badge 
                                                                    variant="default" 
                                                                    className="text-xs relative animate-pulse shadow-md"
                                                                >
                                                                    <Sparkles className="h-3 w-3 mr-1" />
                                                                    New
                                                                </Badge>
                                                            </div>
                                                        )}
                                                        <Badge
                                                            variant="secondary"
                                                            className={cn(
                                                                "text-xs font-medium",
                                                                getNotificationBadgeColor(notification.type)
                                                            )}
                                                        >
                                                            {notification.type}
                                                        </Badge>
                                                    </div>
                                                    
                                                    {notification.message && (
                                                        <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                    )}
                                                    
                                                    <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="h-4 w-4" />
                                                            <span className="font-medium">{formatTimestamp(notification.timestamp)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>{new Date(notification.timestamp).toLocaleDateString()}</span>
                                                        </div>
                                                        {hasNavigationData && (
                                                            <div className="flex items-center gap-1.5 text-primary font-medium group-hover:gap-2 transition-all">
                                                                {getNotificationActionIcon(notification)}
                                                                <span className="text-xs">View details</span>
                                                                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                        {!isRead && (
                                                            <DropdownMenuItem onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMarkAsRead(notification.id);
                                                            }}>
                                                                <Check className="h-4 w-4 mr-2" />
                                                                Mark as read
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteNotification(notification.id);
                                                            }}
                                                            className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Total</p>
                                <p className="text-3xl font-bold text-foreground">{userNotifications.length}</p>
                            </div>
                            <div className="p-3 bg-primary/20 rounded-xl">
                                <Bell className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-2 border-red-200/50 dark:border-red-800/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Errors</p>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                    {userNotifications.filter(n => n.type === 'error').length}
                                </p>
                            </div>
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200/50 dark:border-green-800/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Success</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {userNotifications.filter(n => n.type === 'success').length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Info</p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {userNotifications.filter(n => n.type === 'info').length}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add CSS animation */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default NotificationsPage;
