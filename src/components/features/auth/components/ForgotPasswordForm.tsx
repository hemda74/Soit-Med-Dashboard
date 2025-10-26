import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Label from '@/components/ui/template/Label';
import Button from '@/components/ui/template/Button';
import { ChevronLeftIcon } from '@/components/icons/template';

// Temporary simple input for debugging
const SimpleInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }>(({ className, error, ...props }, ref) => (
    <input
        ref={ref}
        className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-black dark:text-black ${error ? 'border-red-500' : 'border-gray-300'
            } ${className}`}
        {...props}
    />
));
SimpleInput.displayName = "SimpleInput";

interface ForgotPasswordFormProps {
    onSubmit: (email: string) => void;
    isLoading: boolean;
    error: string | null;
    success: boolean;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
    onSubmit,
    isLoading,
    error,
    success,
}) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(email);
    };

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
                                Check your email
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                We've sent a verification code to your email address.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>
                            <Button
                                onClick={() => {
                                    setEmail('');
                                    window.location.reload();
                                }}
                                className="w-full"
                                size="sm"
                            >
                                Send another code
                            </Button>
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
                    to="/login"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Back to login
                </Link>
            </div>
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            Forgot Password?
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No worries, we'll send you reset instructions.
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

                                <div>
                                    <Label htmlFor="email">
                                        Email <span className="text-error-500">*</span>
                                    </Label>
                                    <SimpleInput
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="sm"
                                        disabled={isLoading || !email}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            'Send verification code'
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

