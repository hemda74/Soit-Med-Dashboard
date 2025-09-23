import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { UserListResponse } from '@/types/user.types';

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    user: UserListResponse | null;
    isLoading?: boolean;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    user,
    isLoading = false,
}) => {
    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-red-600">
                        <AlertTriangle className="h-6 w-6" />
                        Delete User
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        This action cannot be undone. This will permanently delete the user
                        and remove all associated data from our servers.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                    <Trash2 className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-red-800 mb-1">
                                    User to be deleted:
                                </h4>
                                <div className="text-sm text-red-700">
                                    <p className="font-semibold">{user.fullName}</p>
                                    <p className="text-red-600">{user.email}</p>
                                    {user.departmentId && (
                                        <p className="text-red-500">
                                            Department: {user.department || `Department ${user.departmentId}`}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-yellow-800">
                                <p className="font-medium mb-1">Warning:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>All user data will be permanently removed</li>
                                    <li>User roles and permissions will be deleted</li>
                                    <li>Profile images and associated files will be removed</li>
                                    <li>This action cannot be undone</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Deleting...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Trash2 className="h-4 w-4" />
                                Delete User
                            </div>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteUserModal;
