import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { useNotificationStore } from '@/stores/notificationStore';
import { TestTube, Bug, XCircle } from 'lucide-react';

const NotificationDebugger: React.FC = () => {
    const {
        notifications,
        unreadCount,
        connectionStatus,
        // loading,
        // error,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAllNotifications,
        getNotificationsForCurrentUser,
        success,
        errorNotification,
        warning,
        info,
    } = useNotificationStore();

    const [testResults, setTestResults] = useState<string[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    const addTestResult = (result: string, type: 'success' | 'error' | 'info' = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
        setTestResults(prev => [...prev, `${icon} [${timestamp}] ${result}`]);
    };

    const runBasicTests = () => {
        setTestResults([]);
        addTestResult('Starting basic notification tests...', 'info');

        try {
            // Test 1: Add different types of notifications
            success('Test Success', 'This is a test success notification');
            addTestResult('Success notification added', 'success');

            errorNotification('Test Error', 'This is a test error notification');
            addTestResult('Error notification added', 'success');

            warning('Test Warning', 'This is a test warning notification');
            addTestResult('Warning notification added', 'success');

            info('Test Info', 'This is a test info notification');
            addTestResult('Info notification added', 'success');

            // Test 2: Check notification count
            const currentCount = notifications.length;
            addTestResult(`Total notifications: ${currentCount}`, 'info');

            // Test 3: Test unread count
            addTestResult(`Unread count: ${unreadCount}`, 'info');

            addTestResult('Basic tests completed successfully!', 'success');
        } catch (error) {
            addTestResult(`Basic tests failed: ${error}`, 'error');
        }
    };

    const runRoleBasedTests = () => {
        addTestResult('Starting role-based notification tests...', 'info');

        try {
            // Test role-based notifications
            success('Admin Only', 'This notification is only for admins', {
                roles: ['Admin', 'SuperAdmin']
            });
            addTestResult('Role-based notification added', 'success');

            // Test user-specific notification
            addNotification({
                type: 'info',
                title: 'User Specific',
                message: 'This notification is for specific users',
                isRead: false,
                userIds: ['test-user-1', 'test-user-2']
            });
            addTestResult('User-specific notification added', 'success');

            addTestResult('Role-based tests completed successfully!', 'success');
        } catch (error) {
            addTestResult(`Role-based tests failed: ${error}`, 'error');
        }
    };

    const runActionTests = () => {
        addTestResult('Starting action tests...', 'info');

        try {
            const userNotifications = getNotificationsForCurrentUser();

            if (userNotifications.length > 0) {
                // Test mark as read
                markAsRead(userNotifications[0].id);
                addTestResult('Mark as read test passed', 'success');

                // Test mark all as read
                markAllAsRead();
                addTestResult('Mark all as read test passed', 'success');
            } else {
                addTestResult('No notifications to test actions on', 'info');
            }

            addTestResult('Action tests completed successfully!', 'success');
        } catch (error) {
            addTestResult(`Action tests failed: ${error}`, 'error');
        }
    };

    const runAllTests = () => {
        setTestResults([]);
        addTestResult('🧪 Starting comprehensive notification system tests...', 'info');

        runBasicTests();
        runRoleBasedTests();
        runActionTests();

        addTestResult('🏁 All tests completed!', 'success');
    };

    const clearTests = () => {
        setTestResults([]);
    };

    const clearNotifications = () => {
        clearAllNotifications();
        addTestResult('All notifications cleared', 'info');
    };

    const userNotifications = getNotificationsForCurrentUser();

    if (!isVisible) {
        return (
            <Button
                onClick={() => setIsVisible(true)}
                variant="outline"
                size="sm"
                className="fixed bottom-4 right-4 z-50"
            >
                <Bug className="h-4 w-4 mr-2" />
                Debug Notifications
            </Button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
            <Card className="h-full">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <TestTube className="h-4 w-4" />
                            Notification Debugger
                        </CardTitle>
                        <Button
                            onClick={() => setIsVisible(false)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                        >
                            <XCircle className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Status */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${connectionStatus.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span>{connectionStatus.isConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>Unread: {unreadCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>Total: {notifications.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>User: {userNotifications.length}</span>
                        </div>
                    </div>

                    {/* Test Buttons */}
                    <div className="grid grid-cols-2 gap-1">
                        <Button onClick={runBasicTests} size="sm" variant="outline" className="text-xs">
                            Basic Tests
                        </Button>
                        <Button onClick={runRoleBasedTests} size="sm" variant="outline" className="text-xs">
                            Role Tests
                        </Button>
                        <Button onClick={runActionTests} size="sm" variant="outline" className="text-xs">
                            Action Tests
                        </Button>
                        <Button onClick={runAllTests} size="sm" className="text-xs">
                            All Tests
                        </Button>
                    </div>

                    <div className="flex gap-1">
                        <Button onClick={clearTests} size="sm" variant="outline" className="text-xs flex-1">
                            Clear Tests
                        </Button>
                        <Button onClick={clearNotifications} size="sm" variant="outline" className="text-xs flex-1">
                            Clear Notifications
                        </Button>
                    </div>

                    {/* Test Results */}
                    <div className="max-h-32 overflow-y-auto space-y-1">
                        {testResults.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No tests run yet</p>
                        ) : (
                            testResults.map((result, index) => (
                                <div key={index} className="text-xs font-mono">
                                    {result}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default NotificationDebugger;
