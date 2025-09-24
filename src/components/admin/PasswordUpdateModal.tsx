import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Key, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateUserPasswordBySuperAdmin } from '@/services';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { SuccessModal } from '@/components/ui/success-modal';
import type { UserListResponse } from '@/types/user.types';

// Password validation schema
const passwordSchema = z.object({
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface PasswordUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserListResponse | null;
}

export function PasswordUpdateModal({ isOpen, onClose, user }: PasswordUpdateModalProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successModal, setSuccessModal] = useState<{
        isOpen: boolean;
        message: string;
        password?: string;
        userId?: string;
        userName?: string;
    }>({
        isOpen: false,
        message: '',
    });

    const { user: currentUser } = useAuthStore();
    const { error: showError } = useNotificationStore();

    const form = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: PasswordFormData) => {
        if (!user || !currentUser?.token) return;

        try {
            setLoading(true);
            const response = await updateUserPasswordBySuperAdmin(
                user.id,
                data.newPassword,
                data.confirmPassword,
                currentUser.token
            );

            if (response.success) {
                console.log('Password update successful:', response);
                setSuccessModal({
                    isOpen: true,
                    message: response.message,
                    password: data.newPassword,
                    userId: response.userId,
                    userName: response.userName,
                });
                form.reset();
                // Don't close the modal immediately, let the success modal handle it
            } else {
                showError('Password update failed');
            }
        } catch (error: any) {
            showError(
                error.message || 'Failed to update password'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    const closeSuccessModal = () => {
        setSuccessModal({ isOpen: false, message: '' });
        onClose(); // Close the password modal when success modal is closed
    };

    if (!isOpen || !user) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md shadow-lg animate-in fade-in-0 zoom-in-95 duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Update Password
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            className="h-8 w-8 p-0 hover:bg-muted"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* User Info */}
                        <div className="p-3 bg-muted rounded-lg">
                            <div className="text-sm font-medium">
                                {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                @{user.userName} • {user.email}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                ID: {user.id}
                            </div>
                        </div>

                        {/* Test Button - Remove this after testing */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setSuccessModal({
                                    isOpen: true,
                                    message: 'Test success message',
                                    password: 'TestPassword123!',
                                    userId: user.id,
                                    userName: user.userName,
                                });
                            }}
                            className="w-full"
                        >
                            Test Success Modal
                        </Button>

                        {/* Password Form */}
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter new password"
                                        {...form.register('newPassword')}
                                        disabled={loading}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={loading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                {form.formState.errors.newPassword && (
                                    <p className="text-sm text-destructive">
                                        {form.formState.errors.newPassword.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirm new password"
                                        {...form.register('confirmPassword')}
                                        disabled={loading}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={loading}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                {form.formState.errors.confirmPassword && (
                                    <p className="text-sm text-destructive">
                                        {form.formState.errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            {/* Password Requirements */}
                            <div className="text-xs text-muted-foreground space-y-1">
                                <div>Password must contain:</div>
                                <ul className="list-disc list-inside space-y-0.5 ml-2">
                                    <li>At least 8 characters</li>
                                    <li>One uppercase letter</li>
                                    <li>One lowercase letter</li>
                                    <li>One number</li>
                                    <li>One special character</li>
                                </ul>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Update Password
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Success Modal */}
            <SuccessModal
                isOpen={successModal.isOpen}
                onClose={closeSuccessModal}
                title="Password Updated Successfully"
                message={successModal.message}
                password={successModal.password}
                userId={successModal.userId}
                userName={successModal.userName}
            />
        </>
    );
}
