import React, { useState } from 'react';
import { Edit, User, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserUpdateForm } from './UserUpdateForm';
import { useTranslation } from '@/hooks/useTranslation';
import type { UserListResponse } from '@/types/user.types';
import type { UpdateUserRequest } from '@/types/userUpdate.types';

interface UserUpdateModalProps {
    user: UserListResponse;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (userId: string, userData: Record<string, unknown>) => Promise<void>;
}

export const UserUpdateModal: React.FC<UserUpdateModalProps> = ({
    user,
    isOpen,
    onClose,
    onUpdate,
}) => {
    const { t } = useTranslation();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (userData: UpdateUserRequest) => {
        setIsUpdating(true);
        try {
            await onUpdate(user.id, userData);
            onClose();
        } catch (error) {
            console.error('Error updating user:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        {t('updateUser')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('updateUserDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* User Info Card */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                        <User className="h-6 w-6 text-primary" />
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

                    {/* Update Form */}
                    <UserUpdateForm
                        user={user}
                        onUpdate={handleUpdate}
                        isLoading={isUpdating}
                    />
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isUpdating}
                    >
                        {t('cancel')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UserUpdateModal;
