import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { updateUserStatus } from '@/services';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAppStore } from '@/stores/appStore';
import type { UserStatusRequest } from '@/types/user.types';

interface UserStatusToggleProps {
    userId: string;
    userName: string;
    email: string;
    isActive: boolean;
    onStatusChange: (newStatus: boolean) => void;
    disabled?: boolean;
}

export const UserStatusToggle: React.FC<UserStatusToggleProps> = ({
    userId,
    userName,
    email,
    isActive,
    onStatusChange,
    disabled = false,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuthStore();
    const { success, errorNotification: showError } = useNotificationStore();
    const { setLoading } = useAppStore();

    const handleToggleClick = () => {
        setReason('');
        setIsModalOpen(true);
    };

    const handleConfirm = async () => {
        if (!reason.trim()) {
            showError('Please provide a reason for this action');
            return;
        }

        if (!user?.token) {
            showError('Authentication token not found');
            return;
        }

        const action = isActive ? 'deactivate' : 'activate';
        const request: UserStatusRequest = {
            userId,
            action,
            reason: reason.trim(),
        };

        try {
            setIsLoading(true);
            setLoading(true);

            const response = await updateUserStatus(request, user.token);

            // Update the user status in the parent component
            onStatusChange(response.isActive);

            // Show success message
            success(response.message);

            // Close modal
            setIsModalOpen(false);
            setReason('');
        } catch (error) {
            console.error('Error updating user status:', error);
            showError(
                error instanceof Error
                    ? error.message
                    : 'Failed to update user status'
            );
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setReason('');
    };

    const actionText = isActive ? 'Deactivate' : 'Activate';
    const actionColor = isActive ? 'destructive' : 'default';
    const actionIcon = isActive ? XCircle : CheckCircle;

    return (
        <>
            <Button
                variant={actionColor}
                size="sm"
                onClick={handleToggleClick}
                disabled={disabled || isLoading}
                className="flex items-center gap-2 text-white hover:text-white"
            >
                {React.createElement(actionIcon, { className: 'h-4 w-4' })}
                {actionText}
            </Button>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            {actionText} User
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {actionText.toLowerCase()} this user? This action will{' '}
                            {isActive ? 'prevent' : 'allow'} the user from accessing the system.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                User Details
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <div><strong>Name:</strong> {userName}</div>
                                <div><strong>Email:</strong> {email}</div>
                                <div><strong>Current Status:</strong>
                                    <span className={`ml-1 px-2 py-1 text-xs font-semibold rounded-full ${isActive
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                        }`}>
                                        {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">
                                Reason for {actionText.toLowerCase()}ing *
                            </Label>
                            <textarea
                                id="reason"
                                placeholder={`Please provide a reason for ${actionText.toLowerCase()}ing this user...`}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={actionColor}
                            onClick={handleConfirm}
                            disabled={isLoading || !reason.trim()}
                            className="flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {React.createElement(actionIcon, { className: 'h-4 w-4' })}
                                    {actionText} User
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default UserStatusToggle;
