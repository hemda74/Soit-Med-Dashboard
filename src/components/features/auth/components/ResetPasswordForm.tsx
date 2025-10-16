import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Label from '@/components/ui/template/Label';
import Button from '@/components/ui/template/Button';
import { ChevronLeftIcon } from '@/components/icons/template';

// Temporary simple input for debugging
const SimpleInput = React.forwardRef<HTMLInputElement, any>(({ className, error, ...props }, ref) => (
    <input
        ref={ref}
        className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-black dark:text-black ${error ? 'border-red-500' : 'border-gray-300'
            } ${className}`}
        {...props}
    />
));
SimpleInput.displayName = "SimpleInput";

interface ResetPasswordFormProps {
    email: string;
    onSubmit: (newPassword: string, confirmPassword: string) => void;
    isLoading: boolean;
    error: string | null;
    success: boolean;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
    email,
    onSubmit,
    isLoading,
    error,
    success,
}) => {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        new: false,
        confirm: false
    });

    const togglePasswordVisibility = (field: 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData.newPassword, formData.confirmPassword);
    };

    const isFormValid = formData.newPassword.length >= 8 &&
        formData.newPassword === formData.confirmPassword &&
        formData.newPassword !== '';

    if (success) {
        return (
            <div className="flex flex-col flex-1">
                <div className="w-full max-w-md pt-10 mx-auto">
                    <Link
                        to="/login"
                        className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        <ChevronLeftIcon className="size-5" />
                        Back to login
                    </Link>
                </div>
                <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                    <div className="text-center">
                        <div className="mb-5 sm:mb-8">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                                <svg
                                    className="h-6 w-6 text-green-600 dark:text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                                Password Reset Successfully!
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Your password has been updated. You can now sign in with your new password.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <Link
                                to="/login"
                                className="inline-block w-full"
                            >
                                <Button
                                    className="w-full"
                                    size="sm"
                                >
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1">
            <div className="w-full max-w-md pt-10 mx-auto">
                <Link
                    to="/verify-code"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Back
                </Link>
            </div>
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            Reset Password
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enter your new password for <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
                        </p>
                    </div>
                    <div>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                                        {error}
                                    </div>
                                )}

                                {/* New Password */}
                                <div>
                                    <Label htmlFor="newPassword">
                                        New Password <span className="text-error-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <SimpleInput
                                            id="newPassword"
                                            type={showPasswords.new ? "text" : "password"}
                                            placeholder="Enter new password"
                                            value={formData.newPassword}
                                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        >
                                            {showPasswords.new ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <Label htmlFor="confirmPassword">
                                        Confirm New Password <span className="text-error-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <SimpleInput
                                            id="confirmPassword"
                                            type={showPasswords.confirm ? "text" : "password"}
                                            placeholder="Confirm new password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        >
                                            {showPasswords.confirm ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                                        <p className="mt-1.5 text-xs text-red-500">
                                            Passwords don't match
                                        </p>
                                    )}
                                </div>

                                {/* Password Requirements */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100 text-sm">Password Requirements:</h4>
                                    <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                                        <li>• At least 8 characters long</li>
                                        <li>• Contains uppercase and lowercase letters</li>
                                        <li>• Contains at least one number</li>
                                        <li>• Contains at least one special character</li>
                                    </ul>
                                </div>

                                <div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="sm"
                                        disabled={isLoading || !isFormValid}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Resetting...
                                            </>
                                        ) : (
                                            'Reset Password'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

