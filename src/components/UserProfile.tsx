import { useEffect, useState } from 'react';
import { User, Mail, Building, Shield, CheckCircle, XCircle, Key, Eye, EyeOff, Save, Edit } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/stores/appStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { changePassword } from '@/services/roleSpecificUserApi';
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
