import React from 'react';
import { User } from 'lucide-react';

interface ProfileImageData {
    id: number;
    userId: string;
    fileName: string;
    filePath: string;
    contentType: string;
    fileSize: number;
    altText: string;
    uploadedAt: string;
    isActive: boolean;
    isProfileImage: boolean;
}

interface ProfileImageProps {
    src?: string | ProfileImageData | null;
    alt?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    fallbackIcon?: React.ReactNode;
}

const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
};

export const ProfileImage: React.FC<ProfileImageProps> = ({
    src,
    alt = 'Profile picture',
    size = 'md',
    className = '',
    fallbackIcon
}) => {
    const sizeClass = sizeClasses[size];

    // Helper function to get image URL from src
    const getImageUrl = (src: string | ProfileImageData | null): string | null => {
        if (!src) return null;

        if (typeof src === 'string') {
            return src;
        }

        if (typeof src === 'object' && 'filePath' in src) {
            return `http://localhost:5117/${src.filePath}`;
        }

        return null;
    };

    const imageUrl = getImageUrl(src);

    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={alt}
                className={`${sizeClass} rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 ${className}`}
                onError={(e) => {
                    // Hide the image and show fallback if it fails to load
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) {
                        fallback.style.display = 'flex';
                    }
                }}
            />
        );
    }

    return (
        <div
            className={`${sizeClass} rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center ${className}`}
            style={{ display: src ? 'none' : 'flex' }}
        >
            {fallbackIcon || <User className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-12 h-12'} text-primary/60`} />}
        </div>
    );
};

export default ProfileImage;
