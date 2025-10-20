import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { cn } from '@/lib/utils';

const ConnectionStatus: React.FC = () => {
    const { connectionStatus } = useNotificationStore();

    const getStatusConfig = () => {
        if (connectionStatus.isConnected) {
            return {
                icon: Wifi,
                color: 'text-green-600',
                bgColor: 'bg-green-50 dark:bg-green-950/20',
                text: 'Connected',
                description: 'Real-time notifications active',
            };
        } else if (connectionStatus.isReconnecting) {
            return {
                icon: Loader2,
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
                text: 'Reconnecting...',
                description: 'Attempting to reconnect',
            };
        } else {
            return {
                icon: WifiOff,
                color: 'text-red-600',
                bgColor: 'bg-red-50 dark:bg-red-950/20',
                text: 'Disconnected',
                description: 'Notifications may be delayed',
            };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div
            className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-sm transition-colors',
                config.bgColor
            )}
        >
            <Icon
                className={cn(
                    'h-4 w-4 mr-2',
                    config.color,
                    connectionStatus.isReconnecting && 'animate-spin'
                )}
            />
            <span className={config.color}>{config.text}</span>
        </div>
    );
};

export default ConnectionStatus;
