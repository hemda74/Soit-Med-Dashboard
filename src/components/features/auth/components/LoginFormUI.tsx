import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Label from '@/components/ui/template/Label';
import Button from '@/components/ui/template/Button';
import Logo from '@/components/Logo';

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

interface LoginFormUIProps {
    showPassword: boolean;
    isLoading: boolean;
    error: string | null;
    errors: any;
    register: any;
    handleSubmit: any;
    reset: any;
    togglePasswordVisibility: () => void;
    clearError: () => void;
}

export const LoginFormUI: React.FC<LoginFormUIProps> = ({
    showPassword,
    isLoading,
    error,
    errors,
    register,
    handleSubmit,
    togglePasswordVisibility,
}) => {

    return (
        <div className="flex flex-col flex-1">
            <div className="w-full max-w-md pt-10 mx-auto flex justify-center">
                <Logo />
            </div>
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            Sign In
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enter your username and password to sign in!
                        </p>
                    </div>
                    <div>
                        <form onSubmit={(e) => {
                            handleSubmit(e);
                        }}>
                            <div className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="userName">
                                        Username <span className="text-error-500">*</span>
                                    </Label>
                                    <SimpleInput
                                        id="userName"
                                        type="text"
                                        placeholder="Enter your username"
                                        {...register('userName', {
                                            required: 'Username is required',
                                            minLength: {
                                                value: 1,
                                                message: 'Username is required'
                                            }
                                        })}
                                        error={!!errors.userName}
                                    />
                                    {errors.userName && (
                                        <p className="mt-1.5 text-xs text-error-500">
                                            {errors.userName.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="password">
                                        Password <span className="text-error-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <SimpleInput
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            {...register('password', {
                                                required: 'Password is required',
                                                minLength: {
                                                    value: 6,
                                                    message: 'Password must be at least 6 characters'
                                                }
                                            })}
                                            error={!!errors.password}
                                        />
                                        <span
                                            onClick={togglePasswordVisibility}
                                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="text-gray-700 dark:text-gray-700 h-5 w-5" />
                                            ) : (
                                                <Eye className="text-gray-700 dark:text-gray-700 h-5 w-5" />
                                            )}
                                        </span>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1.5 text-xs text-error-500">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-end">
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="sm"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            'Sign in'
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
