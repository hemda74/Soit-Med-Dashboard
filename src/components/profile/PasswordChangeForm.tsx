import { useState } from 'react';
import { Key, Eye, EyeOff, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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

interface PasswordChangeFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PasswordFormData) => void;
}

export default function PasswordChangeForm({ isOpen, onClose, onSubmit }: PasswordChangeFormProps) {
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    });

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleClose = () => {
        passwordForm.reset();
        onClose();
    };

    const handleSubmit = (data: PasswordFormData) => {
        onSubmit(data);
        passwordForm.reset();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-foreground">
                        <Key className="h-6 w-6 text-primary" />
                        Change Password
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Update your password with a strong, secure password
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={passwordForm.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="space-y-4">
                        {/* Current Password */}
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword" className="text-sm font-medium text-foreground">Current Password</Label>
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
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
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
                                <p className="text-sm text-destructive">
                                    {passwordForm.formState.errors.currentPassword.message}
                                </p>
                            )}
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">New Password</Label>
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
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
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
                                <p className="text-sm text-destructive">
                                    {passwordForm.formState.errors.newPassword.message}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm New Password</Label>
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
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
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
                                <p className="text-sm text-destructive">
                                    {passwordForm.formState.errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">Password Requirements:</h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            <li>• At least 8 characters long</li>
                            <li>• Contains uppercase and lowercase letters</li>
                            <li>• Contains at least one number</li>
                            <li>• Contains at least one special character</li>
                        </ul>
                    </div>

                    <DialogFooter className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="border-border text-foreground hover:bg-accent"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={passwordForm.formState.isSubmitting}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {passwordForm.formState.isSubmitting ? 'Saving...' : 'Save Password'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
