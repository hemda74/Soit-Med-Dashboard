import { useEffect, useState } from 'react';
import { User, Mail, Building, Shield, CheckCircle, XCircle, Key, Eye, EyeOff, Save, Edit, Camera, Trash2, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/stores/appStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { changePassword, uploadProfileImage, updateProfileImage, deleteProfileImage } from '@/services/roleSpecificUserApi';
import { useNotificationStore } from '@/stores/notificationStore';

// Password validation schema
const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function UserProfile() {
    const { user, fetchUserData } = useAuthStore();
    const { loading } = useAppStore();
    const { t } = useTranslation();
    const { success, error: showError } = useNotificationStore();
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isDeletingImage, setIsDeletingImage] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [imageLoadError, setImageLoadError] = useState(false);

    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    });

    useEffect(() => {
        // Refresh user data when component mounts
        fetchUserData();
    }, [fetchUserData]);

    // Debug user object
    useEffect(() => {
        if (user) {
            console.log('User object loaded:', user);
            console.log('Profile image data:', user.profileImage);
            if (user.profileImage) {
                console.log('Profile image filePath:', user.profileImage.filePath);
                console.log('Profile image fileName:', user.profileImage.fileName);
                console.log('Profile image contentType:', user.profileImage.contentType);
                // Reset image load error when user changes
                setImageLoadError(false);
            } else {
                console.log('No profile image found in user object');
                setImageLoadError(false);
            }
        }
    }, [user]);

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-muted-foreground">{t('noUserData')}</p>
                </div>
            </div>
        );
    }


    const onSubmitPassword = async (data: PasswordFormData) => {
        if (!user?.token) {
            showError('No authentication token found');
            return;
        }

        try {
            const response = await changePassword(
                {
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                    confirmPassword: data.confirmPassword,
                },
                user.token
            );

            if (response.success) {
                success('Password Changed Successfully', response.message);
                passwordForm.reset();
                setIsEditingPassword(false);
            } else {
                showError('Password Change Failed', response.message);
            }
        } catch (error: any) {
            console.error('Error changing password:', error);
            const errorMessage = error.message || 'Failed to change password';
            showError('Password Change Failed', errorMessage);
        }
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Helper function to get the full image URL
    const getImageUrl = (filePath: string) => {
        // If the filePath already includes http/https, return as is
        if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
            return filePath;
        }
        // If it's a relative path, prepend the API base URL
        if (filePath.startsWith('/')) {
            return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5117'}${filePath}`;
        }
        // If it doesn't start with /, assume it needs the full path
        return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5117'}/${filePath}`;
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user?.token) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError('Invalid file type', 'Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError('File too large', 'Please select an image smaller than 5MB');
            return;
        }

        setIsUploadingImage(true);
        try {
            // Use POST if no existing image, PUT if image exists
            const hasExistingImage = user.profileImage && user.profileImage.filePath;
            console.log('User profile image state:', user.profileImage);
            console.log('Has existing image:', hasExistingImage);
            console.log('Using method:', hasExistingImage ? 'PUT' : 'POST');

            const response = hasExistingImage
                ? await updateProfileImage(file, user.fullName, user.token)
                : await uploadProfileImage(file, user.fullName, user.token);

            if (response.profileImage) {
                // Update user data in auth store
                await fetchUserData();
                success('Profile Image Updated', response.message);
            } else {
                showError('Upload Failed', 'Failed to update profile image');
            }
        } catch (error: any) {
            console.error('Error uploading image:', error);
            const errorMessage = error.message || 'Failed to upload image';
            showError('Upload Failed', errorMessage);
        } finally {
            setIsUploadingImage(false);
            // Reset file input
            event.target.value = '';
        }
    };

    const handleDeleteImage = async () => {
        if (!user?.token) return;

        console.log('Deleting profile image for user:', user.id);
        setIsDeletingImage(true);
        try {
            const response = await deleteProfileImage(user.token);

            if (response.message) {
                // Update user data in auth store
                await fetchUserData();
                success('Profile Image Deleted', response.message);
                setShowDeleteModal(false);
            } else {
                showError('Delete Failed', 'Failed to delete profile image');
            }
        } catch (error: any) {
            console.error('Error deleting image:', error);
            const errorMessage = error.message || 'Failed to delete image';
            showError('Delete Failed', errorMessage);
        } finally {
            setIsDeletingImage(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{t('profile')}</h1>
                    <p className="text-muted-foreground mt-2">{t('profileDescription')}</p>
                </div>
                <Button
                    onClick={fetchUserData}
                    disabled={loading}
                    variant="outline"
                >
                    {loading ? t('refreshing') : t('refreshData')}
                </Button>
            </div>

            {/* User Image Card */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-4 border-primary/20 overflow-hidden">
                                {user.profileImage && user.profileImage.filePath && !imageLoadError ? (
                                    <img
                                        src={getImageUrl(user.profileImage.filePath)}
                                        alt={user.profileImage.altText || user.fullName}
                                        className="w-full h-full rounded-full object-cover"
                                        onError={(e) => {
                                            console.error('Image failed to load:', user.profileImage?.filePath);
                                            console.error('Constructed URL:', getImageUrl(user.profileImage?.filePath || ''));
                                            console.error('Image error:', e);
                                            setImageLoadError(true);
                                        }}
                                        onLoad={() => {
                                            console.log('Image loaded successfully:', user.profileImage?.filePath);
                                            console.log('Constructed URL:', getImageUrl(user.profileImage?.filePath || ''));
                                            setImageLoadError(false);
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-primary/50 flex items-center justify-center">
                                        <User className="w-16 h-16 text-primary/70" />
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
                                htmlFor="profile-image-upload"
                                className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 cursor-pointer"
                                title={isUploadingImage ? "Uploading..." : (user.profileImage && user.profileImage.filePath) ? "Change profile picture" : "Upload profile picture"}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isUploadingImage}
                                    className="hidden"
                                    id="profile-image-upload"
                                />
                                <Button
                                    size="sm"
                                    className="w-full h-full rounded-full"
                                    variant="secondary"
                                    disabled={isUploadingImage}
                                    asChild
                                >
                                    <div>
                                        {isUploadingImage ? (
                                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Camera className="w-4 h-4" />
                                        )}
                                    </div>
                                </Button>
                            </label>

                            {/* Delete Button (only show if image exists) */}
                            {user.profileImage && user.profileImage.filePath && (
                                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                                            variant="destructive"
                                            title="Delete profile picture"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5 text-destructive" />
                                                Delete Profile Image
                                            </DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to delete your profile image? This action cannot be undone.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowDeleteModal(false)}
                                                disabled={isDeletingImage}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={handleDeleteImage}
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
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-foreground">{user.fullName}</h2>
                            <p className="text-muted-foreground">{user.departmentName}</p>
                            <div className="flex flex-wrap justify-center gap-1 mt-2">
                                {user.roles.map((role, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                                    >
                                        {role}
                                    </span>
                                ))}
                            </div>
                            {/* Debug info */}
                            {user.profileImage && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                    <p>Image: {user.profileImage.fileName}</p>
                                    <p>Path: {user.profileImage.filePath}</p>
                                    <p>URL: {getImageUrl(user.profileImage.filePath)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Small Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Full Name Card */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('fullName')}</p>
                                <p className="text-lg font-semibold">{user.fullName}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Username Card */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('username')}</p>
                                <p className="text-lg font-semibold">{user.userName}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* User ID Card */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('userId')}</p>
                                <p className="text-sm font-semibold font-mono">{user.id}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Email Card */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-primary" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">{t('email')}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-lg font-semibold truncate">{user.email}</p>
                                    {user.emailConfirmed ? (
                                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Phone Card */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-primary" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">{t('phone')}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-lg font-semibold">
                                        {user.phoneNumber || t('notProvided')}
                                    </p>
                                    {user.phoneNumber && (
                                        user.phoneNumberConfirmed ? (
                                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Department Card */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Building className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('department')}</p>
                                <p className="text-lg font-semibold">{user.departmentName}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Roles Card */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-primary mt-1" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground mb-2">{t('role')}</p>
                                <div className="flex flex-wrap gap-1">
                                    {user.roles.map((role, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Password Card */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Key className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Password</p>
                                    <p className="text-lg font-semibold">••••••••</p>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsEditingPassword(!isEditingPassword)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Password Change Form */}
            {isEditingPassword && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Change Password
                        </CardTitle>
                        <CardDescription>
                            Update your password with a strong, secure password
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Current Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="currentPassword"
                                            type={showPasswords.current ? "text" : "password"}
                                            {...passwordForm.register("currentPassword")}
                                            className="pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => togglePasswordVisibility('current')}
                                        >
                                            {showPasswords.current ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {passwordForm.formState.errors.currentPassword && (
                                        <p className="text-sm text-red-600">
                                            {passwordForm.formState.errors.currentPassword.message}
                                        </p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showPasswords.new ? "text" : "password"}
                                            {...passwordForm.register("newPassword")}
                                            className="pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => togglePasswordVisibility('new')}
                                        >
                                            {showPasswords.new ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {passwordForm.formState.errors.newPassword && (
                                        <p className="text-sm text-red-600">
                                            {passwordForm.formState.errors.newPassword.message}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showPasswords.confirm ? "text" : "password"}
                                            {...passwordForm.register("confirmPassword")}
                                            className="pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                        >
                                            {showPasswords.confirm ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {passwordForm.formState.errors.confirmPassword && (
                                        <p className="text-sm text-red-600">
                                            {passwordForm.formState.errors.confirmPassword.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Password Requirements */}
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Password Requirements:</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• At least 8 characters long</li>
                                    <li>• Contains uppercase and lowercase letters</li>
                                    <li>• Contains at least one number</li>
                                    <li>• Contains at least one special character</li>
                                </ul>
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-2">
                                <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {passwordForm.formState.isSubmitting ? 'Saving...' : 'Save Password'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditingPassword(false);
                                        passwordForm.reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
