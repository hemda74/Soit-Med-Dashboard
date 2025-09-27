// Authentication API services

import { apiRequest } from '../shared/apiClient';
import { API_ENDPOINTS } from '../shared/endpoints';
import type {
	AuthUser,
	LoginDTO,
	AuthResponse,
	ChangePasswordRequest,
	ChangePasswordResponse,
	RefreshTokenRequest,
	RefreshTokenResponse,
} from '@/types/auth.types';

// Login user
export const loginUser = async (
	credentials: LoginDTO,
	setLoading?: (loading: boolean) => void
): Promise<AuthResponse> => {
	try {
		setLoading?.(true);
		console.log('Attempting login with credentials:', {
			userName: credentials.UserName,
			password: '***',
		});

		const response = await apiRequest<AuthResponse>(
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

// Change password
export const changePassword = async (
	passwordData: ChangePasswordRequest,
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<ChangePasswordResponse> => {
	try {
		setLoading?.(true);
		console.log('Changing password...');

		const response = await apiRequest<ChangePasswordResponse>(
			API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
			{
				method: 'POST',
				body: JSON.stringify(passwordData),
			},
			token
		);

		console.log('Password changed successfully');
		return response;
	} catch (error) {
		console.error('Failed to change password:', error);
		throw error;
	} finally {
		setLoading?.(false);
	}
};

// Refresh token
export const refreshToken = async (
	refreshData: RefreshTokenRequest,
	setLoading?: (loading: boolean) => void
): Promise<RefreshTokenResponse> => {
	try {
		setLoading?.(true);
		console.log('Refreshing token...');

		const response = await apiRequest<RefreshTokenResponse>(
			API_ENDPOINTS.AUTH.REFRESH,
			{
				method: 'POST',
				body: JSON.stringify(refreshData),
			}
		);

		console.log('Token refreshed successfully');
		return response;
	} catch (error) {
		console.error('Failed to refresh token:', error);
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

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
	try {
		const decoded = decodeToken(token);
		if (!decoded || !decoded.exp) return true;

		const currentTime = Date.now() / 1000;
		return decoded.exp < currentTime;
	} catch (error) {
		console.error('Failed to check token expiration:', error);
		return true;
	}
};

// Get token expiration time
export const getTokenExpiration = (token: string): Date | null => {
	try {
		const decoded = decodeToken(token);
		if (!decoded || !decoded.exp) return null;

		return new Date(decoded.exp * 1000);
	} catch (error) {
		console.error('Failed to get token expiration:', error);
		return null;
	}
};
