// Authentication API services

import { apiRequest } from '../shared/apiClient';
import { API_ENDPOINTS } from '../shared/endpoints';
import type { LoginRequest, LoginResponse, AuthUser } from '@/types/auth.types';

// Login user
export const loginUser = async (
	credentials: LoginRequest,
	setLoading?: (loading: boolean) => void
): Promise<LoginResponse> => {
	try {
		setLoading?.(true);
		console.log('Attempting login with credentials:', {
			userName: credentials.UserName,
			password: '***',
		});

		const response = await apiRequest<LoginResponse>(
			API_ENDPOINTS.AUTH.LOGIN,
			{
				method: 'POST',
				body: JSON.stringify(credentials),
			}
		);

		console.log('Login successful:', {
			success: response.success,
			hasToken: !!response.token,
		});

		return response;
	} catch (error) {
		console.error('Login failed:', error);
		throw error;
	} finally {
		setLoading?.(false);
	}
};

// Get current user data
export const getCurrentUser = async (
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<AuthUser> => {
	try {
		setLoading?.(true);
		console.log('Fetching current user data...');

		const response = await apiRequest<AuthUser>(
			API_ENDPOINTS.AUTH.CURRENT_USER,
			{
				method: 'GET',
			},
			token
		);

		console.log('Current user data fetched successfully:', {
			id: response.id,
			email: response.email,
			roles: response.roles,
		});

		return response;
	} catch (error) {
		console.error('Failed to fetch current user:', error);
		throw error;
	} finally {
		setLoading?.(false);
	}
};

// Decode JWT token
export const decodeToken = (token: string) => {
	try {
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map(
					(c) =>
						'%' +
						(
							'00' +
							c
								.charCodeAt(0)
								.toString(16)
						).slice(-2)
				)
				.join('')
		);
		return JSON.parse(jsonPayload);
	} catch (error) {
		console.error('Failed to decode token:', error);
		return null;
	}
};
