import React from 'react';
import { PasswordResetFlow } from '@/components/features/auth/components/PasswordResetFlow';

export default function ResetPassword() {
    return (
        <PasswordResetFlow
            initialStep="reset"
            onComplete={() => {
                console.log('Password reset completed');
            }}
        />
    );
}
