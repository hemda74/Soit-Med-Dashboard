// Sales Support User Creation Component

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { createSalesSupport } from '@/services/roleSpecific/salesSupportRoleApi';
import type { SalesSupportUserRequest } from '@/types/roleSpecificUser.types';
import toast from 'react-hot-toast';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, Upload, X } from 'lucide-react';

interface SalesSupportUserCreationProps {
    onSuccess?: (user: any) => void;
    onCancel?: () => void;
}

const SalesSupportUserCreation: React.FC<SalesSupportUserCreationProps> = ({
    onSuccess,
    onCancel,
}) => {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<SalesSupportUserRequest>({
        defaultValues: {
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            personalMail: '',
            supportSpecialization: '',
            supportLevel: '',
            notes: '',
            altText: '',
        },
    });

    const supportLevels = [
        { value: 'Junior', label: t('salesSupportLevels.junior') },
        { value: 'Senior', label: t('salesSupportLevels.senior') },
        { value: 'Lead', label: t('salesSupportLevels.lead') },
        { value: 'Specialist', label: t('salesSupportLevels.specialist') },
    ];

    const supportSpecializations = [
        { value: 'Customer Support', label: t('salesSupportSpecializations.customerSupport') },
        { value: 'Technical Support', label: t('salesSupportSpecializations.technicalSupport') },
        { value: 'Sales Support', label: t('salesSupportSpecializations.salesSupport') },
        { value: 'Product Support', label: t('salesSupportSpecializations.productSupport') },
        { value: 'Billing Support', label: t('salesSupportSpecializations.billingSupport') },
        { value: 'Account Management', label: t('salesSupportSpecializations.accountManagement') },
    ];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setProfileImage(null);
        setImagePreview(null);
        setValue('profileImage', undefined);
    };

    const onSubmit = async (data: SalesSupportUserRequest) => {
        if (!user?.token) {
            toast.error(t('common.errors.noAuthToken'));
            return;
        }

        setIsLoading(true);

        try {
            // Add profile image to form data
            const formData = {
                ...data,
                profileImage: profileImage || undefined,
            };

            const response = await createSalesSupport(formData, user.token);

            // Show success message from API response or fallback
            const successMessage = response.message || t('salesSupportMessages.createSuccess');
            toast.success(successMessage);

            reset();
            setProfileImage(null);
            setImagePreview(null);

            if (onSuccess) {
                onSuccess(response);
            }
        } catch (error: any) {
            console.error('Error creating Sales Support user:', error);

            // Handle API error response format
            let errorMessage = t('salesSupportMessages.createError');
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    {t('salesSupportCreateUser.title')}
                </CardTitle>
                <CardDescription>
                    {t('salesSupportCreateUser.description')}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            {t('salesSupportCreateUser.basicInfo')}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    {t('common.fields.email')} *
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register('email', {
                                        required: t('common.validation.required'),
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: t('common.validation.invalidEmail'),
                                        },
                                    })}
                                    placeholder={t('common.fields.emailPlaceholder')}
                                />
                                {errors.email && (
                                    <Alert variant="destructive">
                                        <AlertDescription>
                                            {errors.email.message}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    {t('common.fields.password')} *
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register('password', {
                                        required: t('common.validation.required'),
                                        minLength: {
                                            value: 6,
                                            message: t('common.validation.passwordMinLength'),
                                        },
                                    })}
                                    placeholder={t('common.fields.passwordPlaceholder')}
                                />
                                {errors.password && (
                                    <Alert variant="destructive">
                                        <AlertDescription>
                                            {errors.password.message}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* First Name */}
                            <div className="space-y-2">
                                <Label htmlFor="firstName">
                                    {t('common.fields.firstName')}
                                </Label>
                                <Input
                                    id="firstName"
                                    {...register('firstName')}
                                    placeholder={t('common.fields.firstNamePlaceholder')}
                                />
                            </div>

                            {/* Last Name */}
                            <div className="space-y-2">
                                <Label htmlFor="lastName">
                                    {t('common.fields.lastName')}
                                </Label>
                                <Input
                                    id="lastName"
                                    {...register('lastName')}
                                    placeholder={t('common.fields.lastNamePlaceholder')}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Phone Number */}
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">
                                    {t('common.fields.phoneNumber')}
                                </Label>
                                <Input
                                    id="phoneNumber"
                                    type="tel"
                                    {...register('phoneNumber')}
                                    placeholder={t('common.fields.phoneNumberPlaceholder')}
                                />
                            </div>

                            {/* Personal Email */}
                            <div className="space-y-2">
                                <Label htmlFor="personalMail">
                                    {t('salesSupportFields.personalMail')}
                                </Label>
                                <Input
                                    id="personalMail"
                                    type="email"
                                    {...register('personalMail')}
                                    placeholder={t('salesSupportFields.personalMailPlaceholder')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sales Support Specific Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            {t('salesSupportCreateUser.salesSupportInfo')}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Support Specialization */}
                            <div className="space-y-2">
                                <Label htmlFor="supportSpecialization">
                                    {t('salesSupportFields.supportSpecialization')}
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setValue('supportSpecialization', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={t('salesSupportFields.supportSpecializationPlaceholder')}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {supportSpecializations.map((spec) => (
                                            <SelectItem key={spec.value} value={spec.value}>
                                                {spec.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Support Level */}
                            <div className="space-y-2">
                                <Label htmlFor="supportLevel">
                                    {t('salesSupportFields.supportLevel')}
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setValue('supportLevel', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={t('salesSupportFields.supportLevelPlaceholder')}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {supportLevels.map((level) => (
                                            <SelectItem key={level.value} value={level.value}>
                                                {level.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">
                                {t('salesSupportFields.notes')}
                            </Label>
                            <Textarea
                                id="notes"
                                {...register('notes')}
                                placeholder={t('salesSupportFields.notesPlaceholder')}
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Profile Image Upload */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            {t('salesSupportCreateUser.profileImage')}
                        </h3>

                        <div className="space-y-4">
                            {/* Image Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="profileImage">
                                    {t('common.fields.profileImage')}
                                </Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        id="profileImage"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="flex-1"
                                    />
                                    {profileImage && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={removeImage}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                {profileImage && (
                                    <p className="text-sm text-muted-foreground">
                                        {t('common.fields.selectedFile')}: {profileImage.name}
                                    </p>
                                )}
                            </div>

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="space-y-2">
                                    <Label>{t('common.fields.imagePreview')}</Label>
                                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Alt Text */}
                            <div className="space-y-2">
                                <Label htmlFor="altText">
                                    {t('common.fields.altText')}
                                </Label>
                                <Input
                                    id="altText"
                                    {...register('altText')}
                                    placeholder={t('common.fields.altTextPlaceholder')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4 pt-6 border-t">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={isLoading}
                            >
                                {t('common.actions.cancel')}
                            </Button>
                        )}
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('common.actions.creating')}
                                </>
                            ) : (
                                <>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    {t('salesSupportActions.createUser')}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default SalesSupportUserCreation;
