import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/appStore';
import { changePassword, uploadProfileImage, updateProfileImage, deleteProfileImage } from '@/services';
import { useNotificationStore } from '@/stores/notificationStore';
import ProfileImageSection from './profile/ProfileImageSection';
import UserInfoCard from './profile/UserInfoCard';
import PasswordChangeForm from './profile/PasswordChangeForm';

type PasswordFormData = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export default function UserProfile() {
    const { user, fetchUserData } = useAuthStore();
    const { loading } = useAppStore();
    const { t } = useTranslation();
    const { success, error: showError } = useNotificationStore();
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isDeletingImage, setIsDeletingImage] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);




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
                setIsEditingPassword(false);
            } else {
                showError('Password Change Failed', response.message);
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to change password';
            showError('Password Change Failed', errorMessage);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user?.token) return;

        if (!file.type.startsWith('image/')) {
            showError('Invalid file type', 'Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showError('File too large', 'Please select an image smaller than 5MB');
            return;
        }

        setIsUploadingImage(true);
        try {
            const hasExistingImage = user.profileImage && user.profileImage.filePath;
            const response = hasExistingImage
                ? await updateProfileImage(file, user.fullName, user.token)
                : await uploadProfileImage(file, user.fullName, user.token);

            if (response.profileImage) {
                await fetchUserData();
                success('Profile Image Updated', response.message);
            } else {
                showError('Upload Failed', 'Failed to update profile image');
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to upload image';
            showError('Upload Failed', errorMessage);
        } finally {
            setIsUploadingImage(false);
            event.target.value = '';
        }
    };

    const handleDeleteImage = async () => {
        if (!user?.token) return;

        setIsDeletingImage(true);
        try {
            const response = await deleteProfileImage(user.token);

            if (response.message) {
                await fetchUserData();
                success('Profile Image Deleted', response.message);
                setShowDeleteModal(false);
            } else {
                showError('Delete Failed', 'Failed to delete profile image');
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to delete image';
            showError('Delete Failed', errorMessage);
        } finally {
            setIsDeletingImage(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{t('profile')}</h1>
                            <p className="text-muted-foreground mt-2">{t('profileDescription')}</p>
                        </div>
                        <Button
                            onClick={fetchUserData}
                            disabled={loading}
                            variant="outline"
                            className="bg-card border-border text-card-foreground hover:bg-primary"
                        >
                            {loading ? t('refreshing') : t('refreshData')}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Image and Basic Info */}
                    <div className="lg:col-span-1">
                        <ProfileImageSection
                            user={user}
                            onImageUpload={handleImageUpload}
                            onImageDelete={handleDeleteImage}
                            isUploadingImage={isUploadingImage}
                            isDeletingImage={isDeletingImage}
                            showDeleteModal={showDeleteModal}
                            setShowDeleteModal={setShowDeleteModal}
                        />
                    </div>

                    {/* Right Column - User Information */}
                    <div className="lg:col-span-2">
                        <UserInfoCard
                            user={user}
                            t={t as (key: any) => string}
                            onEditPassword={() => setIsEditingPassword(!isEditingPassword)}
                        />
                    </div>
                </div>

                {/* Password Change Modal */}
                <PasswordChangeForm
                    isOpen={isEditingPassword}
                    onClose={() => setIsEditingPassword(false)}
                    onSubmit={onSubmitPassword}
                />
            </div>
        </div>
    );
}
