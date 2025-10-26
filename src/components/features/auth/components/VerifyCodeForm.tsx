import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Label from '@/components/ui/template/Label';
import Button from '@/components/ui/template/Button';
import { ChevronLeftIcon } from '@/components/icons/template';

// Temporary simple input for debugging
const SimpleInput = React.forwardRef<HTMLInputElement, any>(({ className, error, ...props }, ref) => (
    <input
        ref={ref}
        className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-black dark:text-black text-center ${error ? 'border-red-500' : 'border-gray-300'
            } ${className}`}
        {...props}
    />
));
SimpleInput.displayName = "SimpleInput";

interface VerifyCodeFormProps {
    email: string;
    onSubmit: (code: string) => void;
    onResendCode: () => void;
    isLoading: boolean;
    error: string | null;
    success: boolean;
}

export const VerifyCodeForm: React.FC<VerifyCodeFormProps> = ({
    email,
    onSubmit,
    onResendCode,
    isLoading,
    error,
    success,
}) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleInputChange = (index: number, value: string) => {
        // Only allow digits
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits are entered
        if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
            onSubmit(newCode.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Handle backspace
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
        setCode(newCode);

        // Focus the next empty input or the last one
        const nextEmptyIndex = newCode.findIndex(digit => digit === '');
        const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
        inputRefs.current[focusIndex]?.focus();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join('');
        if (fullCode.length === 6) {
            onSubmit(fullCode);
        }
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
                                Code Verified!
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                You can now proceed to reset your password.
                            </p>
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
                    to="/forgot-password"
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
                            Enter Verification Code
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            We've sent a 6-digit code to <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
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
                                    <Label htmlFor="code">
                                        Verification Code <span className="text-error-500">*</span>
                                    </Label>
                                    <div className="flex gap-2 justify-center">
                                        {code.map((digit, index) => (
                                            <SimpleInput
                                                key={index}
                                                ref={(el) => (inputRefs.current[index] = el)}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(index, e.target.value)}
                                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
                                                onPaste={handlePaste}
                                                className="w-12 h-12 text-lg font-semibold"
                                            />
                                        ))}
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                                        Code expires in 15 minutes
                                    </p>
                                </div>

                                <div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="sm"
                                        disabled={isLoading || code.join('').length !== 6}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            'Verify Code'
                                        )}
                                    </Button>
                                </div>

                                <div className="text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Didn't receive the code?
                                    </p>
                                    <button
                                        type="button"
                                        onClick={onResendCode}
                                        className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
                                        disabled={isLoading}
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

