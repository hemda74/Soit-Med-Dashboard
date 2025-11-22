import React, { useState } from 'react';
import { User, Camera, Trash2, AlertTriangle, Save, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import UserStatusToggle from '../UserStatusToggle';
import type { UserListResponse } from '@/types/user.types';
import { getApiBaseUrl } from '@/utils/apiConfig';

// Department mapping (same as in UsersList.tsx)
const DEPARTMENT_MAP: { [key: number]: string } = {
    1: 'Administration',
    2: 'Medical',
    3: 'Sales',
    4: 'Engineering',
    5: 'Finance',
    6: 'Legal',
    7: 'NewOne'
};

// Helper function to get department name by ID
const getDepartmentName = (departmentId: number): string => {
    return DEPARTMENT_MAP[departmentId] || `Department ${departmentId}`;
};

// User edit form validation schema
const userEditSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    userName: z.string().min(1, 'Username is required'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().optional(),
    isActive: z.boolean(),
});

type UserEditFormData = z.infer<typeof userEditSchema>;

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserListResponse | null;
    onSubmit: (data: UserEditFormData) => void;
    onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onImageDelete: () => void;
    isUploadingImage: boolean;
    isDeletingImage: boolean;
    showDeleteImageModal: boolean;
    setShowDeleteImageModal: (show: boolean) => void;
    onStatusChange: (userId: string, newStatus: boolean) => void;
    isSuperAdmin: boolean;
}

export default function EditUserModal({
    isOpen,
    onClose,
    user,
    onSubmit,
    onImageUpload,
    onImageDelete,
    isUploadingImage,
    isDeletingImage,
    showDeleteImageModal,
    setShowDeleteImageModal,
    onStatusChange,
    isSuperAdmin
}: EditUserModalProps) {
    const [imageLoadError, setImageLoadError] = useState(false);

    const editForm = useForm<UserEditFormData>({
        resolver: zodResolver(userEditSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            userName: '',
            email: '',
            phoneNumber: '',
            isActive: true,
        }
    });

    // Update form when user changes
    React.useEffect(() => {
        if (user) {
            editForm.reset({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                userName: user.userName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                isActive: user.isActive || false,
            });
        }
    }, [user, editForm]);

    const handleClose = () => {
        editForm.reset();
        onClose();
    };

    const handleSubmit = (data: UserEditFormData) => {
        onSubmit(data);
    };

    // Helper function to get the full image URL
    const getImageUrl = (filePath: string) => {
        if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
            return filePath;
        }
        const baseUrl = getApiBaseUrl();
        if (filePath.startsWith('/')) {
            return `${baseUrl}${filePath}`;
        }
        return `${baseUrl}/${filePath}`;
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl z-50">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-gray-900">
                        <User className="h-5 w-5 text-blue-600" />
                        Edit User
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 text-sm">
                        Update user information for {user.fullName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Profile Image Section */}
                    <Card className="bg-gray-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-white shadow-lg overflow-hidden">
                                        {user.profileImage && user.profileImage.filePath && !imageLoadError ? (
                                            <img
                                                src={getImageUrl(user.profileImage.filePath)}
                                                alt={user.profileImage.altText || user.fullName}
                                                className="w-full h-full rounded-full object-cover"
                                                onError={() => setImageLoadError(true)}
                                                onLoad={() => setImageLoadError(false)}
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
                                                <Users className="w-10 h-10 text-blue-600" />
                                                {imageLoadError && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-red-100/80 rounded-full">
                                                        <span className="text-xs text-red-600 font-medium">Failed to load</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Camera Button for Upload/Update */}
                                    <label
                                        htmlFor="edit-profile-image-upload"
                                        className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0 cursor-pointer bg-blue-600 hover:bg-blue-700 transition-colors"
                                        title={isUploadingImage ? "Uploading..." : (user.profileImage && user.profileImage.filePath) ? "Change profile picture" : "Upload profile picture"}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={onImageUpload}
                                            disabled={isUploadingImage}
                                            className="hidden"
                                            id="edit-profile-image-upload"
                                        />
                                        <div className="w-full h-full rounded-full flex items-center justify-center">
                                            {isUploadingImage ? (
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Camera className="w-3 h-3 text-white" />
                                            )}
                                        </div>
                                    </label>

                                    {/* Delete Button (only show if image exists) */}
                                    {user.profileImage && user.profileImage.filePath && (
                                        <Dialog open={showDeleteImageModal} onOpenChange={setShowDeleteImageModal}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    className="absolute -top-1 -right-1 rounded-full w-6 h-6 p-0 bg-red-500 hover:bg-red-600"
                                                    title="Delete profile picture"
                                                >
                                                    <Trash2 className="w-3 h-3 text-white" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-lg border-0 shadow-2xl">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-2">
                                                        <AlertTriangle className="w-5 h-5 text-destructive" />
                                                        Delete Profile Image
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Are you sure you want to delete this user's profile image? This action cannot be undone.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setShowDeleteImageModal(false)}
                                                        disabled={isDeletingImage}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={onImageDelete}
                                                        disabled={isDeletingImage}
                                                    >
                                                        {isDeletingImage ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                Deleting...
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <Trash2 className="w-4 h-4" />
                                                                Delete Image
                                                            </div>
                                                        )}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-semibold text-gray-900">{user.fullName}</h3>
                                    <p className="text-xs text-gray-600 mb-1">
                                        {user.profileImage && user.profileImage.filePath
                                            ? `Current image: ${user.profileImage.fileName}`
                                            : 'No profile image set'
                                        }
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Click the camera icon to upload or change the profile image
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Information Form */}
                    <form onSubmit={editForm.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* First Name */}
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                                <Input
                                    id="firstName"
                                    {...editForm.register("firstName")}
                                    placeholder="Enter first name"
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                                {editForm.formState.errors.firstName && (
                                    <p className="text-sm text-red-600">
                                        {editForm.formState.errors.firstName.message}
                                    </p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                                <Input
                                    id="lastName"
                                    {...editForm.register("lastName")}
                                    placeholder="Enter last name"
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                                {editForm.formState.errors.lastName && (
                                    <p className="text-sm text-red-600">
                                        {editForm.formState.errors.lastName.message}
                                    </p>
                                )}
                            </div>

                            {/* Username */}
                            <div className="space-y-2">
                                <Label htmlFor="userName" className="text-sm font-medium text-gray-700">Username</Label>
                                <Input
                                    id="userName"
                                    {...editForm.register("userName")}
                                    placeholder="Enter username"
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                                {editForm.formState.errors.userName && (
                                    <p className="text-sm text-red-600">
                                        {editForm.formState.errors.userName.message}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...editForm.register("email")}
                                    placeholder="Enter email address"
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                                {editForm.formState.errors.email && (
                                    <p className="text-sm text-red-600">
                                        {editForm.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</Label>
                                <Input
                                    id="phoneNumber"
                                    {...editForm.register("phoneNumber")}
                                    placeholder="Enter phone number"
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                                {editForm.formState.errors.phoneNumber && (
                                    <p className="text-sm text-red-600">
                                        {editForm.formState.errors.phoneNumber.message}
                                    </p>
                                )}
                            </div>

                            {/* Department (Read-only) */}
                            <div className="space-y-2">
                                <Label htmlFor="department" className="text-sm font-medium text-gray-700">Department</Label>
                                <Input
                                    id="department"
                                    value={user.departmentId ? getDepartmentName(user.departmentId) : 'N/A'}
                                    disabled
                                    className="bg-gray-50 border-gray-300 text-gray-600"
                                />
                                <p className="text-xs text-gray-500">
                                    Department cannot be changed here
                                </p>
                            </div>

                            {/* Created At (Read-only) */}
                            <div className="space-y-2">
                                <Label htmlFor="createdAt" className="text-sm font-medium text-gray-700">Created At</Label>
                                <Input
                                    id="createdAt"
                                    value={user.createdAt ? new Date(user.createdAt).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    }) : 'N/A'}
                                    disabled
                                    className="bg-gray-50 border-gray-300 text-gray-600"
                                />
                                <p className="text-xs text-gray-500">
                                    Account creation date
                                </p>
                            </div>
                        </div>

                        {/* User Status Management - Only for SuperAdmin */}
                        {isSuperAdmin && (
                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="text-base font-semibold text-blue-900 mb-1">
                                                User Status Management
                                            </h4>
                                            <p className="text-xs text-blue-800">
                                                Change the user's active status. This will affect their ability to access the system.
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-blue-900">Current Status:</span>
                                                <span
                                                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${user.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <UserStatusToggle
                                                userId={user.id}
                                                userName={user.fullName}
                                                email={user.email}
                                                isActive={user.isActive}
                                                onStatusChange={(newStatus: boolean) => {
                                                    onStatusChange(user.id, newStatus);
                                                    editForm.setValue('isActive', newStatus);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Form Actions */}
                        <DialogFooter className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.formState.isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {editForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
