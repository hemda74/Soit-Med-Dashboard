import { CheckCircle, Copy, X } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { useState } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    password?: string;
    userId?: string;
    userName?: string;
}

export function SuccessModal({
    isOpen,
    onClose,
    title = 'Success',
    message,
    password,
    userId,
    userName
}: SuccessModalProps) {
    const [copied, setCopied] = useState(false);
    const { success, errorNotification: showError } = useNotificationStore();

    const handleCopyPassword = async () => {
        if (password) {
            try {
                await navigator.clipboard.writeText(password);
                setCopied(true);
                success('Password copied to clipboard!');
                setTimeout(() => setCopied(false), 2000);
            } catch {
                showError('Failed to copy password');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 left-[16rem] bg-black/50 flex items-center justify-center z-[60] p-4">
            <Card className="w-full max-w-md shadow-lg animate-in fade-in-0 zoom-in-95 duration-200">
                <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-green-100 p-2 rounded-full">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <CardTitle className="text-lg font-semibold text-green-600">
                            {title}
                        </CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="ml-auto h-8 w-8 p-0 hover:bg-muted"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-foreground leading-relaxed">
                        {message}
                    </div>

                    {password && (
                        <div className="space-y-3">
                            <div className="text-sm font-medium text-foreground">
                                New Password:
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="flex-1 p-2 bg-muted rounded-md font-mono text-sm border">
                                    {password}
                                </div>
                                <Button
                                    onClick={handleCopyPassword}
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0"
                                >
                                    {copied ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {userId && (
                        <div className="text-xs text-muted-foreground space-y-1">
                            <div>User ID: {userId}</div>
                            {userName && <div>Username: {userName}</div>}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button onClick={onClose} variant="default" size="sm">
                            Close
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
