import React from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    description,
    action,
    className = ''
}) => {
    return (
        <div className={`flex items-center justify-between ${className}`}>
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                {description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {description}
                    </p>
                )}
            </div>
            {action && action}
        </div>
    );
};