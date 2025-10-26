// import React from 'react';
import { PasswordResetFlow } from '@/components/features/auth/components/PasswordResetFlow';

export default function VerifyCode() {
    return (
        <PasswordResetFlow
            initialStep="verify"
            onComplete={() => {
                console.log('Code verification completed');
            }}
        />
    );
}

