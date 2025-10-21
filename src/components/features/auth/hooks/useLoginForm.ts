import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/schemas/loginSchema';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';

export const useLoginForm = () => {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { login } = useAuthStore();
	const { setLoading } = useAppStore();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			userName: '',
			password: '',
		},
	});

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true);
		setError(null);
		setLoading(true);

		try {
			await login(data.userName, data.password);
			reset();
			// Redirect to dashboard after successful login
			navigate('/dashboard', { replace: true });
		} catch (err: any) {
			console.error('Login error:', err);
			setError(err.message || 'Login failed');
		} finally {
			setIsLoading(false);
			setLoading(false);
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const clearError = () => {
		setError(null);
	};

	return {
		// Form state
		showPassword,
		isLoading,
		error,
		errors,

		// Form methods
		register,
		handleSubmit: handleSubmit(onSubmit),
		reset,

		// Actions
		togglePasswordVisibility,
		clearError,
	};
};
