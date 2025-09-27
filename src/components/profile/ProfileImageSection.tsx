import { useState } from 'react';
import { User, Camera, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ProfileImageSectionProps {
    user: any;
    onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onImageDelete: () => void;
    isUploadingImage: boolean;
    isDeletingImage: boolean;
    showDeleteModal: boolean;
    setShowDeleteModal: (show: boolean) => void;
}

export default function ProfileImageSection({
    user,
    onImageUpload,
    onImageDelete,
    isUploadingImage,
    isDeletingImage,
    showDeleteModal,
    setShowDeleteModal
}: ProfileImageSectionProps) {
    const [imageLoadError, setImageLoadError] = useState(false);

    // Helper function to get the full image URL
    const getImageUrl = (filePath: string) => {
        if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
            return filePath;
        }
        if (filePath.startsWith('/')) {
            return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5117'}${filePath}`;
        }
        return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5117'}/${filePath}`;
    };

    return (
        <Card className="bg-card shadow-lg">
            <CardContent className="p-8">
                <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center border-4 border-card shadow-lg overflow-hidden">
                            {user.profileImage && user.profileImage.filePath && !imageLoadError ? (
                                <img
                                    src={getImageUrl(user.profileImage.filePath)}
                                    alt={user.profileImage.altText || user.fullName}
                                    className="w-full h-full rounded-full object-cover"
                                    onError={() => setImageLoadError(true)}
                                    onLoad={() => setImageLoadError(false)}
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-800/30 dark:to-blue-700/30 flex items-center justify-center">
                                    <User className="w-20 h-20 text-blue-600 dark:text-blue-400" />
                                    {imageLoadError && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-red-100/80 dark:bg-red-900/80 rounded-full">
                                            <span className="text-xs text-red-600 dark:text-red-400 font-medium">Failed to load</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Camera Button for Upload/Update */}
                        <label
                            htmlFor="profile-image-upload"
                            className="absolute -bottom-2 -right-2 rounded-full w-12 h-12 p-0 cursor-pointer bg-blue-600 hover:bg-blue-700 transition-colors"
                            title={isUploadingImage ? "Uploading..." : (user.profileImage && user.profileImage.filePath) ? "Change profile picture" : "Upload profile picture"}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onImageUpload}
                                disabled={isUploadingImage}
                                className="hidden"
                                id="profile-image-upload"
                            />
                            <div className="w-full h-full rounded-full flex items-center justify-center">
                                {isUploadingImage ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Camera className="w-5 h-5 text-white" />
                                )}
                            </div>
                        </label>

                        {/* Delete Button (only show if image exists) */}
                        {user.profileImage && user.profileImage.filePath && (
                            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                                <DialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0 bg-red-500 hover:bg-red-600"
                                        title="Delete profile picture"
                                    >
                                        <Trash2 className="w-4 h-4 text-white" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg border-0 shadow-2xl">
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
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-foreground mb-2">{user.fullName}</h2>
                        <p className="text-muted-foreground mb-4">{user.departmentName}</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {user.roles.map((role: string, index: number) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full font-medium"
                                >
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
