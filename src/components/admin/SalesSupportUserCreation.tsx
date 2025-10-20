// Sales Support User Creation Component

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Loader2, UserPlus, X } from 'lucide-react';

interface SalesSupportUserCreationProps {
    onSuccess?: (user: any) => void;
    onCancel?: () => void;
}

const SalesSupportUserCreation: React.FC<SalesSupportUserCreationProps> = ({
    onSuccess,
    onCancel,
}) => {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
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
        { value: 'Junior', label: 'Junior' },
        { value: 'Senior', label: 'Senior' },
        { value: 'Lead', label: 'Lead' },
        { value: 'Specialist', label: 'Specialist' },
    ];

    const supportSpecializations = [
        { value: 'Customer Support', label: 'Customer Support' },
        { value: 'Technical Support', label: 'Technical Support' },
        { value: 'Sales Support', label: 'Sales Support' },
        { value: 'Product Support', label: 'Product Support' },
        { value: 'Billing Support', label: 'Billing Support' },
        { value: 'Account Management', label: 'Account Management' },
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
            toast.error('No authentication token found');
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
            const successMessage = response.message || 'Sales support user created successfully';
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
            let errorMessage = 'Failed to create sales support user';
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
                    Create Sales Support User
                </CardTitle>
                <CardDescription>
                    Create a new sales support user with specialized skills and support levels.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            Basic Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email *
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Please enter a valid email address',
                                        },
                                    })}
                                    placeholder="Enter email address"
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
                                    Password *
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register('password', {
                                        required: 'Email is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 8 characters',
                                        },
                                    })}
                                    placeholder="Enter password"
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
                                    First Name
                                </Label>
                                <Input
                                    id="firstName"
                                    {...register('firstName')}
                                    placeholder="Enter first name"
                                />
                            </div>

                            {/* Last Name */}
                            <div className="space-y-2">
                                <Label htmlFor="lastName">
                                    Last Name
                                </Label>
                                <Input
                                    id="lastName"
                                    {...register('lastName')}
                                    placeholder="Enter last name"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Phone Number */}
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">
                                    Phone Number
                                </Label>
                                <Input
                                    id="phoneNumber"
                                    type="tel"
                                    {...register('phoneNumber')}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            {/* Personal Email */}
                            <div className="space-y-2">
                                <Label htmlFor="personalMail">
                                    Personal Email
                                </Label>
                                <Input
                                    id="personalMail"
                                    type="email"
                                    {...register('personalMail')}
                                    placeholder="Enter personal email"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sales Support Specific Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            Sales Support Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Support Specialization */}
                            <div className="space-y-2">
                                <Label htmlFor="supportSpecialization">
                                    Support Specialization
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setValue('supportSpecialization', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder="Select specialization"
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
                                    Support Level
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setValue('supportLevel', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder="Select support level"
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
                                Notes
                            </Label>
                            <Textarea
                                id="notes"
                                {...register('notes')}
                                placeholder="Enter additional notes"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Profile Image Upload */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            Profile Image
                        </h3>

                        <div className="space-y-4">
                            {/* Image Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="profileImage">
                                    Profile Image
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
                                        Selected file: {profileImage.name}
                                    </p>
                                )}
                            </div>

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="space-y-2">
                                    <Label>Image Preview</Label>
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
                                    Alt Text
                                </Label>
                                <Input
                                    id="altText"
                                    {...register('altText')}
                                    placeholder="Enter alt text"
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
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Create User
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
