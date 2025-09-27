import React from 'react';
import { FileX } from 'lucide-react';

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title = 'No data available',
    description = 'There is no data to display at the moment.',
    icon,
    action,
    className = ''
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
            <div className="mb-4">
                {icon || <FileX className="h-12 w-12 text-gray-400" />}
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
                {description}
            </p>
            {action && action}
        </div>
    );
};
