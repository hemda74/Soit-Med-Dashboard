import React from 'react';
import { LoginFormUI } from './LoginFormUI';
import { useLoginForm } from '../hooks/useLoginForm';

export const LoginForm: React.FC = () => {
    const loginFormProps = useLoginForm();

    return <LoginFormUI {...loginFormProps} />;
};

export default LoginForm;
