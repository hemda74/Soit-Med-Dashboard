import { PasswordResetFlow } from '@/components/features/auth/components/PasswordResetFlow';

export default function ForgotPassword() {
    return (
        <PasswordResetFlow
            initialStep="forgot"
            onComplete={() => {
                // Optional: Handle completion (e.g., redirect to login)
                console.log('Password reset completed');
            }}
        />
    );
}
