import React, { useState } from 'react';
import { Trash2, AlertTriangle, User, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDeleteUser } from '@/hooks/useDeleteUser';
import { LoadingSpinner } from '@/components/shared';
import { useTranslation } from '@/hooks/useTranslation';
import type { UserListResponse as UserType } from '@/types/user.types';

interface UserDeleteModalProps {
    user: UserType;
    isOpen: boolean;
    onClose: () => void;
    onDelete?: () => void;
}

export const UserDeleteModal: React.FC<UserDeleteModalProps> = ({
    user,
    isOpen,
    onClose,
    onDelete,
}) => {
    const { t } = useTranslation();
    const { deleteUser, isLoading } = useDeleteUser();
    const [confirmText, setConfirmText] = useState('');

    const handleDelete = async () => {
        try {
            await deleteUser(user.id);
            onDelete?.();
            onClose();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const isConfirmValid = confirmText === 'DELETE';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <Trash2 className="h-5 w-5" />
                        {t('deleteUser')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('deleteUserConfirmation')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Warning */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-medium text-red-800">
                                    Warning: This action cannot be undone
                                </h4>
                                <p className="text-sm text-red-700 mt-1">
                                    This will permanently delete the user and remove all associated data from our servers.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <User className="h-6 w-6 text-red-600" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {user.firstName} {user.lastName}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {user.email}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Shield className="h-4 w-4 text-gray-400" />
                                        <Badge variant="outline" className="text-xs">
                                            Admin
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Confirmation Input */}
                    <div className="space-y-2">
                        <label htmlFor="confirmText" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Type <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">DELETE</span> to confirm:
                        </label>
                        <input
                            id="confirmText"
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Type DELETE to confirm"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={!isConfirmValid || isLoading}
                        className="flex items-center gap-2"
                    >
                        {isLoading ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        {isLoading ? 'Deleting...' : 'Delete User'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UserDeleteModal;
