import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/useTranslation';

interface ImageUploadFieldProps {
    imagePreview: string | null;
    imageError: string;
    imageAltText: string;
    onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
    onAltTextChange: (value: string) => void;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
    imagePreview,
    imageError,
    imageAltText,
    onImageSelect,
    onRemoveImage,
    onAltTextChange
}) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-2 md:col-span-2">
            <Label>{t('profileImage')}</Label>

            {/* Image Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={onImageSelect}
                    className="hidden"
                    id="profileImage"
                />

                {!imagePreview ? (
                    <div className="space-y-4">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="hover:bg-primary hover:text-white hover:border-primary transition-colors duration-200"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {t('selectProfileImage')}
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                            {t('imageTypeError')}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative inline-block">
                            <img
                                src={imagePreview}
                                alt="Profile preview"
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={onRemoveImage}
                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="hover:bg-primary hover:text-white hover:border-primary transition-colors duration-200"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {t('uploadImage')}
                            </Button>
                            <p className="text-sm text-green-600">
                                {imagePreview ? 'Image selected' : ''}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Image Alt Text */}
            {imagePreview && (
                <div className="space-y-2">
                    <Label htmlFor="imageAltText">{t('imageAltText')}</Label>
                    <Input
                        id="imageAltText"
                        value={imageAltText}
                        onChange={(e) => onAltTextChange(e.target.value)}
                        placeholder={t('enterImageAltText')}
                    />
                </div>
            )}

            {/* Image Error Display */}
            {imageError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                    {imageError}
                </div>
            )}
        </div>
    );
};

export default ImageUploadField;

