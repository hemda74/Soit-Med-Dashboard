import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteUser } from '@/hooks/useDeleteUser';
import { LoadingSpinner } from '@/components/shared';
import type { UserListResponse } from '@/types/user.types';

interface UserDeleteButtonProps {
    user: UserListResponse;
    onDelete?: () => void;
}

export const UserDeleteButton: React.FC<UserDeleteButtonProps> = ({
    user,
    onDelete,
}) => {
    const { deleteUser, isLoading } = useDeleteUser();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteUser(user.id);
            onDelete?.();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    if (showConfirm) {
        return (
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="flex items-center gap-1"
                >
                    {isLoading ? (
                        <LoadingSpinner size="sm" />
                    ) : (
                        <Trash2 className="h-4 w-4" />
                    )}
                    {isLoading ? 'Deleting...' : 'Confirm Delete'}
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowConfirm(false)}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
            </div>
        );
    }

    return (
        <Button
            size="sm"
            variant="outline"
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
            <Trash2 className="h-4 w-4" />
            Delete
        </Button>
    );
};

export default UserDeleteButton;
