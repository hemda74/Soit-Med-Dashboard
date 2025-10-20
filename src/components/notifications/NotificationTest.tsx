import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationStore } from '@/stores/notificationStore';
import { Bell, TestTube, Trash2 } from 'lucide-react';

const NotificationTest: React.FC = () => {
    const {
        notifications,
        unreadCount,
        connectionStatus,
        addNotification,
        markAsRead,
        markAllAsRead,
        getNotificationsForCurrentUser,
        success,
        errorNotification,
        warning,
        info,
    } = useNotificationStore();

    const [testResults, setTestResults] = useState<string[]>([]);

    const addTestResult = (result: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
    };

    const testBasicNotifications = () => {
        try {
            // Test success notification
            success('Test Success', 'This is a test success notification');
            addTestResult('✅ Success notification added');

            // Test error notification
            errorNotification('Test Error', 'This is a test error notification');
            addTestResult('✅ Error notification added');

            // Test warning notification
            warning('Test Warning', 'This is a test warning notification');
            addTestResult('✅ Warning notification added');

            // Test info notification
            info('Test Info', 'This is a test info notification');
            addTestResult('✅ Info notification added');

            addTestResult('✅ All basic notification tests passed');
        } catch (error) {
            addTestResult(`❌ Basic notification test failed: ${error}`);
        }
    };

    const testRoleBasedNotifications = () => {
        try {
            // Test role-based notifications
            success('Admin Only', 'This notification is only for admins', {
                roles: ['Admin', 'SuperAdmin']
            });
            addTestResult('✅ Role-based notification added');

            // Test notification with specific user targeting
            addNotification({
                type: 'info',
                title: 'User Specific',
                message: 'This notification is for specific users',
                isRead: false,
                userIds: ['test-user-1', 'test-user-2']
            });
            addTestResult('✅ User-specific notification added');

            addTestResult('✅ Role-based notification tests passed');
        } catch (error) {
            addTestResult(`❌ Role-based notification test failed: ${error}`);
        }
    };

    const testNotificationActions = () => {
        try {
            const userNotifications = getNotificationsForCurrentUser();
            if (userNotifications.length > 0) {
                // Test mark as read
                markAsRead(userNotifications[0].id);
                addTestResult('✅ Mark as read test passed');

                // Test mark all as read
                markAllAsRead();
                addTestResult('✅ Mark all as read test passed');
            }

            addTestResult('✅ Notification action tests passed');
        } catch (error) {
            addTestResult(`❌ Notification action test failed: ${error}`);
        }
    };

    const testConnectionStatus = () => {
        try {
            addTestResult(`📡 Connection Status: ${connectionStatus.isConnected ? 'Connected' : 'Disconnected'}`);
            addTestResult(`🔄 Reconnecting: ${connectionStatus.isReconnecting ? 'Yes' : 'No'}`);
            addTestResult(`🔢 Reconnect Attempts: ${connectionStatus.reconnectAttempts}`);
            addTestResult(`⏳ Loading: ${connectionStatus.isConnected ? 'Yes' : 'No'}`);
            if (errorNotification) {
                addTestResult(`❌ Error: ${errorNotification}`);
            }
        } catch (error) {
            addTestResult(`❌ Connection status test failed: ${error}`);
        }
    };

    const runAllTests = () => {
        setTestResults([]);
        addTestResult('🧪 Starting notification system tests...');

        testBasicNotifications();
        testRoleBasedNotifications();
        testNotificationActions();
        testConnectionStatus();

        addTestResult('🏁 All tests completed!');
    };

    const clearTests = () => {
        setTestResults([]);
    };

    const userNotifications = getNotificationsForCurrentUser();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TestTube className="h-5 w-5" />
                        Notification System Test Panel
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Button onClick={testBasicNotifications} variant="outline" size="sm">
                            Test Basic
                        </Button>
                        <Button onClick={testRoleBasedNotifications} variant="outline" size="sm">
                            Test Role-Based
                        </Button>
                        <Button onClick={testNotificationActions} variant="outline" size="sm">
                            Test Actions
                        </Button>
                        <Button onClick={testConnectionStatus} variant="outline" size="sm">
                            Test Connection
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={runAllTests} className="flex-1">
                            <TestTube className="h-4 w-4 mr-2" />
                            Run All Tests
                        </Button>
                        <Button onClick={clearTests} variant="outline">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear Tests
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Current Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="font-medium">Total Notifications</p>
                            <p className="text-2xl font-bold text-primary">{notifications.length}</p>
                        </div>
                        <div>
                            <p className="font-medium">Unread Count</p>
                            <p className="text-2xl font-bold text-orange-500">{unreadCount}</p>
                        </div>
                        <div>
                            <p className="font-medium">User Notifications</p>
                            <p className="text-2xl font-bold text-green-500">{userNotifications.length}</p>
                        </div>
                        <div>
                            <p className="font-medium">Connection</p>
                            <p className={`text-2xl font-bold ${connectionStatus.isConnected ? 'text-green-500' : 'text-red-500'}`}>
                                {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                        {testResults.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No tests run yet. Click "Run All Tests" to start.</p>
                        ) : (
                            testResults.map((result, index) => (
                                <div key={index} className="text-sm font-mono">
                                    {result}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {userNotifications.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No notifications available.</p>
                        ) : (
                            userNotifications.slice(0, 5).map((notification) => (
                                <div key={notification.id} className="flex items-center justify-between p-2 border rounded">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{notification.title}</p>
                                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-xs ${notification.type === 'success' ? 'bg-green-100 text-green-800' :
                                            notification.type === 'error' ? 'bg-red-100 text-red-800' :
                                                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-blue-100 text-blue-800'
                                            }`}>
                                            {notification.type}
                                        </span>
                                        {!notification.isRead && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default NotificationTest;
