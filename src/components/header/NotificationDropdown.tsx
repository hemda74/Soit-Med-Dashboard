import React, { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const NotificationDropdown: React.FC = () => {
    const [notifications] = useState([
        {
            id: 1,
            title: 'New user registered',
            message: 'A new user has joined the platform',
            time: '2 minutes ago',
            unread: true,
        },
        {
            id: 2,
            title: 'System update',
            message: 'The system has been updated to version 2.1',
            time: '1 hour ago',
            unread: true,
        },
        {
            id: 3,
            title: 'Maintenance scheduled',
            message: 'Scheduled maintenance will occur tonight',
            time: '3 hours ago',
            unread: false,
        },
    ]);

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative w-10 h-10 p-0">
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
            <DropdownMenuContent align="end" className="w-80">
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                        <DropdownMenuItem key={notification.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div className="flex items-start gap-3 w-full">
                                <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        {notification.time}
                                    </p>
                                </div>
                                {notification.unread && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                    >
                                        <Check className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </DropdownMenuItem>
                    ))}
                </div>
                <div className="p-2 border-t">
                    <Button variant="ghost" className="w-full text-sm">
                        View all notifications
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationDropdown;
