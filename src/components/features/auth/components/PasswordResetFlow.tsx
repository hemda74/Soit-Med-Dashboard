import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { VerifyCodeForm } from './VerifyCodeForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { forgotPassword, verifyCode, resetPassword } from '@/services/auth/authApi';

type ResetStep = 'forgot' | 'verify' | 'reset' | 'success';

interface PasswordResetFlowProps {
    initialStep?: ResetStep;
    onComplete?: () => void;
}

export const PasswordResetFlow: React.FC<PasswordResetFlowProps> = ({
    initialStep = 'forgot',
    onComplete
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState<ResetStep>(initialStep);
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Load persisted state on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('passwordResetEmail');
        const savedToken = localStorage.getItem('passwordResetToken');

        if (savedEmail) {
            setEmail(savedEmail);
        }
        if (savedToken) {
            setResetToken(savedToken);
        }
    }, []);

    // Determine step based on current route
    useEffect(() => {
        const path = location.pathname;
        if (path === '/forgot-password') {
            setCurrentStep('forgot');
        } else if (path === '/verify-code') {
            setCurrentStep('verify');
        } else if (path === '/reset-password') {
            setCurrentStep('reset');
        }
    }, [location.pathname]);

    const clearError = () => setError(null);

    // Step 1: Forgot Password
    const handleForgotPassword = async (emailInput: string) => {
        setIsLoading(true);
        setError(null);
        setEmail(emailInput);

        try {
            const response = await forgotPassword({ email: emailInput }, setIsLoading);

            if (response.success) {
                setCurrentStep('verify');
                localStorage.setItem('passwordResetEmail', emailInput);
                navigate('/verify-code');
            } else {
                setError(response.message || 'Failed to send verification code');
            }
        } catch (err: any) {
            console.error('Forgot password error:', err);
            setError(err.message || 'Failed to send verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify Code
    const handleVerifyCode = async (code: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await verifyCode({ email, code }, setIsLoading);

            if (response.success && response.resetToken) {
                setResetToken(response.resetToken);
                setCurrentStep('reset');
                localStorage.setItem('passwordResetToken', response.resetToken);
                navigate('/reset-password');
            } else {
                setError(response.message || 'Invalid verification code');
            }
        } catch (err: any) {
            console.error('Verify code error:', err);
            setError(err.message || 'Failed to verify code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Resend Code
    const handleResendCode = async () => {
        if (!email) return;
        await handleForgotPassword(email);
    };

    // Step 3: Reset Password
    const handleResetPassword = async (newPassword: string, confirmPassword: string) => {
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await resetPassword({
                email,
                resetToken,
                newPassword,
                confirmPassword
            }, setIsLoading);

            if (response.success) {
                setSuccess(true);
                setCurrentStep('success');
                // Clear stored data
                localStorage.removeItem('passwordResetEmail');
                localStorage.removeItem('passwordResetToken');
                onComplete?.();
                // Navigate to login after a short delay
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(response.message || 'Failed to reset password');
            }
        } catch (err: any) {
            console.error('Reset password error:', err);
            setError(err.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Render current step
    switch (currentStep) {
        case 'forgot':
            return (
                <ForgotPasswordForm
                    onSubmit={handleForgotPassword}
                    isLoading={isLoading}
                    error={error}
                    success={false}
                />
            );

        case 'verify':
            return (
                <VerifyCodeForm
                    email={email}
                    onSubmit={handleVerifyCode}
                    onResendCode={handleResendCode}
                    isLoading={isLoading}
                    error={error}
                    success={false}
                />
            );

        case 'reset':
            return (
                <ResetPasswordForm
                    email={email}
                    onSubmit={handleResetPassword}
                    isLoading={isLoading}
                    error={error}
                    success={false}
                />
            );

        case 'success':
            return (
                <ResetPasswordForm
                    email={email}
                    onSubmit={() => { }}
                    isLoading={false}
                    error={null}
                    success={true}
                />
            );

        default:
            return (
                <ForgotPasswordForm
                    onSubmit={handleForgotPassword}
                    isLoading={isLoading}
                    error={error}
                    success={false}
                />
            );
    }
};
