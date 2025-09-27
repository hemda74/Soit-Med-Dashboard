import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorDisplayProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    onDismiss?: () => void;
    className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    title = 'Something went wrong',
    message,
    onRetry,
    onDismiss,
    className = ''
}) => {
    return (
        <Card className={`border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 ${className}`}>
            <CardContent className="p-6">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                            {title}
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-300">
                            {message}
                        </p>
                        {(onRetry || onDismiss) && (
                            <div className="mt-4 flex gap-2">
                                {onRetry && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={onRetry}
                                        className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-800/20"
                                    >
                                        Try Again
                                    </Button>
                                )}
                                {onDismiss && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={onDismiss}
                                        className="text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-800/20"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Dismiss
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
