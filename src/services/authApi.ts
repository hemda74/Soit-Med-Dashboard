import type { LoginDTO, AuthResponse, AuthUser } from '../types/auth.types';
import { API_CONFIG, getApiUrl } from '../config/api';

// Login API function using fetch
export const loginUser = async (
	credentials: LoginDTO
): Promise<AuthResponse> => {
	const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LOGIN), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			userName: credentials.UserName,
			password: credentials.Password,
		}),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`HTTP ${response.status}: ${
				errorText || 'Login failed'
			}`
		);
	}

	return response.json();
};

// Fetch current user data
export const getCurrentUser = async (token: string): Promise<AuthUser> => {
	const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.USER_ME), {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`HTTP ${response.status}: ${
				errorText || 'Failed to fetch user data'
			}`
		);
	}

	return response.json();
};

// Function to decode JWT token and extract user info
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

		const decoded = JSON.parse(jsonPayload);

		return {
			id:
				decoded[
					'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
				] || '',
			userName:
				decoded[
					'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
				] || '',
			roles:
				decoded[
					'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
				] || [],
			exp: decoded.exp,
		};
	} catch (error) {
		console.error('Error decoding token:', error);
		return null;
	}
};
