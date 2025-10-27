import React, { useState } from 'react';
import { useSignalR } from '@/hooks/useSignalR';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/stores/notificationStore';
import signalRService from '@/services/signalRService';
import SendTestNotification from './SendTestNotification';

const SignalRTestPanel: React.FC = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const { user } = useAuthStore();
    const { notifications: storeNotifications } = useNotificationStore();

    const { connectionStatus, isConnected, error, joinGroup, leaveGroup } = useSignalR({
        onConnected: () => {
            console.log('SignalR Connected!');
            setNotifications(prev => [...prev, {
                timestamp: new Date(),
                type: 'success',
                message: 'SignalR Connected Successfully'
            }]);
        },
        onDisconnected: () => {
            console.log('SignalR Disconnected!');
            setNotifications(prev => [...prev, {
                timestamp: new Date(),
                type: 'warning',
                message: 'SignalR Disconnected'
            }]);
        },
        onNotification: (data: any) => {
            console.log('Received Notification:', data);
            setNotifications(prev => [...prev, {
                timestamp: new Date(),
                type: 'info',
                message: JSON.stringify(data, null, 2)
            }]);
        }
    });

    const handleJoinGroup = async () => {
        const groupName = prompt('Enter group name to join:');
        if (groupName) {
            await joinGroup(groupName);
            setNotifications(prev => [...prev, {
                timestamp: new Date(),
                type: 'info',
                message: `Joining group: ${groupName}`
            }]);
        }
    };

    const handleLeaveGroup = async () => {
        const groupName = prompt('Enter group name to leave:');
        if (groupName) {
            await leaveGroup(groupName);
            setNotifications(prev => [...prev, {
                timestamp: new Date(),
                type: 'info',
                message: `Leaving group: ${groupName}`
            }]);
        }
    };

    const handleJoinAutoGroups = async () => {
        if (user) {
            await joinGroup(`User_${user.id}`);
            user.roles?.forEach(role => {
                joinGroup(`Role_${role}`);
            });
            setNotifications(prev => [...prev, {
                timestamp: new Date(),
                type: 'success',
                message: `Joined automatic groups for user: ${user.id}`
            }]);
        }
    };

    const handleClearNotifications = () => {
        setNotifications([]);
    };

    return (
        <div className="space-y-4">
            {/* Send Test Notification */}
            <SendTestNotification />

            {/* Connection Status */}
            <Card>
                <CardHeader>
                    <CardTitle>SignalR Connection Status</CardTitle>
                    <CardDescription>
                        Test SignalR connection and monitor notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Connection Status */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant={isConnected ? 'default' : 'destructive'}>
                            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                        </Badge>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md">
                            <p className="text-sm text-red-700 dark:text-red-300">
                                Error: {error.message}
                            </p>
                        </div>
                    )}

                    {/* User Info */}
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <p className="text-sm font-medium">User Info:</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            ID: {user?.id || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Roles: {user?.roles?.join(', ') || 'N/A'}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={handleJoinAutoGroups}
                            disabled={!isConnected}
                            variant="default"
                        >
                            Join Auto Groups
                        </Button>
                        <Button
                            onClick={handleJoinGroup}
                            disabled={!isConnected}
                            variant="outline"
                        >
                            Join Custom Group
                        </Button>
                        <Button
                            onClick={handleLeaveGroup}
                            disabled={!isConnected}
                            variant="outline"
                        >
                            Leave Group
                        </Button>
                        <Button
                            onClick={handleClearNotifications}
                            variant="ghost"
                        >
                            Clear Log
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications Log */}
            <Card>
                <CardHeader>
                    <CardTitle>Notification Log</CardTitle>
                    <CardDescription>
                        Real-time notifications received via SignalR
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                                No notifications yet
                            </p>
                        ) : (
                            notifications.map((notif, index) => (
                                <div
                                    key={index}
                                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant={
                                            notif.type === 'success' ? 'default' :
                                                notif.type === 'error' ? 'destructive' :
                                                    notif.type === 'warning' ? 'secondary' : 'outline'
                                        }>
                                            {notif.type}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                            {notif.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <pre className="text-xs font-mono overflow-x-auto">
                                        {notif.message}
                                    </pre>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Store Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle>Notification Store</CardTitle>
                    <CardDescription>
                        Notifications managed by the notification store
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm font-medium mb-2">
                        Total Notifications: {storeNotifications.length}
                    </p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {storeNotifications.slice(0, 10).map((notif) => (
                            <div
                                key={notif.id}
                                className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <Badge variant={notif.isRead ? 'outline' : 'default'}>
                                        {notif.type}
                                    </Badge>
                                    <span className="font-medium">{notif.title}</span>
                                </div>
                                {notif.message && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        {notif.message}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SignalRTestPanel;

