import React, { useState } from 'react';
import { ForgotPasswordForm } from '@/components/features/auth/components/ForgotPasswordForm';

export default function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (email: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // TODO: Implement forgot password API call
            // await forgotPasswordApi(email);

            // Simulate API call for now
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ForgotPasswordForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            success={success}
        />
    );
}
