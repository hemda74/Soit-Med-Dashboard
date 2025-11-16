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
	ForgotPasswordRequest,
	ForgotPasswordResponse,
	VerifyCodeRequest,
	VerifyCodeResponse,
	ResetPasswordRequest,
	ResetPasswordResponse,
	ProfileCompletionDTO,
} from '@/types/auth.types';

// Login user
export const loginUser = async (
	credentials: LoginDTO,
	setLoading?: (loading: boolean) => void
): Promise<AuthResponse> => {
	try {
		setLoading?.(true);

		const response = await apiRequest<AuthResponse>(
			API_ENDPOINTS.AUTH.LOGIN,
			{
				method: 'POST',
				body: JSON.stringify(credentials),
			}
		);

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

		const response = await apiRequest<any>(
			API_ENDPOINTS.AUTH.CURRENT_USER,
			{
				method: 'GET',
			},
			token
		);

		// Normalize the response to match AuthUser interface
		// Handle case where API returns Roles (capital R) instead of roles
		const normalizedResponse: AuthUser = {
			...response,
			roles: response.roles || response.Roles || [], // Support both Roles and roles
			id: response.id || response.Id || '',
			userName: response.userName || response.UserName || '',
			email: response.email || response.Email || '',
			firstName:
				response.firstName || response.FirstName || '',
			lastName: response.lastName || response.LastName || '',
			fullName: response.fullName || response.FullName || '',
			isActive:
				response.isActive ?? response.IsActive ?? true,
			createdAt:
				response.createdAt || response.CreatedAt || '',
			lastLoginAt:
				response.lastLoginAt ??
				response.LastLoginAt ??
				null,
			departmentId:
				response.departmentId ||
				response.DepartmentId ||
				0,
			departmentName:
				response.departmentName ||
				response.DepartmentName ||
				'',
			departmentDescription:
				response.departmentDescription ||
				response.DepartmentDescription ||
				'',
			phoneNumber:
				response.phoneNumber ??
				response.PhoneNumber ??
				null,
			personalMail:
				response.personalMail ??
				response.PersonalMail ??
				null,
			dateOfBirth:
				response.dateOfBirth ??
				response.DateOfBirth ??
				null,
			profileImage:
				response.profileImage ||
				response.ProfileImage ||
				null,
			userImages:
				response.userImages ||
				response.UserImages ||
				[],
		};

		return normalizedResponse;
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

		const response = await apiRequest<ChangePasswordResponse>(
			API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
			{
				method: 'POST',
				body: JSON.stringify(passwordData),
			},
			token
		);

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

		const response = await apiRequest<RefreshTokenResponse>(
			API_ENDPOINTS.AUTH.REFRESH,
			{
				method: 'POST',
				body: JSON.stringify(refreshData),
			}
		);

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

// Password Reset Functions

// Forgot password - Step 1: Send verification code
export const forgotPassword = async (
	request: ForgotPasswordRequest,
	setLoading?: (loading: boolean) => void
): Promise<ForgotPasswordResponse> => {
	try {
		setLoading?.(true);

		const response = await apiRequest<ForgotPasswordResponse>(
			API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
			{
				method: 'POST',
				body: JSON.stringify(request),
			}
		);

		return response;
	} catch (error) {
		console.error('Failed to send forgot password request:', error);
		throw error;
	} finally {
		setLoading?.(false);
	}
};

// Verify code - Step 2: Verify code and get reset token
export const verifyCode = async (
	request: VerifyCodeRequest,
	setLoading?: (loading: boolean) => void
): Promise<VerifyCodeResponse> => {
	try {
		setLoading?.(true);

		const response = await apiRequest<VerifyCodeResponse>(
			API_ENDPOINTS.AUTH.VERIFY_CODE,
			{
				method: 'POST',
				body: JSON.stringify(request),
			}
		);

		return response;
	} catch (error) {
		console.error('Failed to verify code:', error);
		throw error;
	} finally {
		setLoading?.(false);
	}
};

// Reset password - Step 3: Reset password with token
export const resetPassword = async (
	request: ResetPasswordRequest,
	setLoading?: (loading: boolean) => void
): Promise<ResetPasswordResponse> => {
	try {
		setLoading?.(true);

		const response = await apiRequest<ResetPasswordResponse>(
			API_ENDPOINTS.AUTH.RESET_PASSWORD,
			{
				method: 'POST',
				body: JSON.stringify(request),
			}
		);

		return response;
	} catch (error) {
		console.error('Failed to reset password:', error);
		throw error;
	} finally {
		setLoading?.(false);
	}
};

// Profile completion status
export const getProfileCompletion = async (
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<ProfileCompletionDTO> => {
	try {
		setLoading?.(true);

		const response = await apiRequest<ProfileCompletionDTO>(
			'/User/profile-completion',
			{
				method: 'GET',
			},
			token
		);

		return response;
	} catch (error) {
		console.error('Failed to fetch profile completion:', error);
		throw error;
	} finally {
		setLoading?.(false);
	}
};
