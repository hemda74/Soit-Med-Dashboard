import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

const NotificationPermission: React.FC = () => {
    const { t } = useTranslation();
    const [permission, setPermission] = useState<NotificationPermission | null>(null);
    const [isRequesting, setIsRequesting] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            return;
        }

        setIsRequesting(true);
        try {
            const result = await Notification.requestPermission();
            setPermission(result);
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        } finally {
            setIsRequesting(false);
        }
    };

    const dismiss = () => {
        setIsDismissed(true);
        localStorage.setItem('notification-permission-dismissed', 'true');
    };

    // Don't show if permission is granted, denied, or dismissed
    if (
        permission === 'granted' ||
        permission === 'denied' ||
        isDismissed ||
        localStorage.getItem('notification-permission-dismissed') === 'true'
    ) {
        return null;
    }

    return (
        <Card className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Bell className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-blue-900 dark:text-blue-100">
                            Enable Notifications
                        </CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={dismiss}
                        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                    Get real-time notifications for important updates, new requests, and system alerts.
                </p>
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={requestPermission}
                        disabled={isRequesting}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isRequesting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Requesting...
                            </>
                        ) : (
                            <>
                                <Bell className="h-4 w-4 mr-2" />
                                Enable Notifications
                            </>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={dismiss}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Maybe Later
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default NotificationPermission;
