const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || 'http://localhost:5117';
import type {
	UpdateUserResponse,
	UpdateUserParams,
	UpdateUserRequest,
	ValidRole,
} from '@/types/userUpdate.types';
import { VALID_ROLES } from '@/types/userUpdate.types';

/**
 * User Update API Service
 * Handles user updates with proper error handling and type safety
 */
class UserUpdateApiService {
	private baseUrl = API_BASE_URL;

	/**
	 * Update a user by their ID
	 * @param params - Update user parameters
	 * @returns Promise with update response
	 */
	async updateUser({
		userId,
		userData,
		token,
	}: UpdateUserParams): Promise<UpdateUserResponse> {
		try {
			const response = await fetch(
				`${this.baseUrl}/api/User/${userId}`,
				{
					method: 'PATCH',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type':
							'application/json',
					},
					body: JSON.stringify(userData),
				}
			);

			const data = await response.json();

			// If the response is not ok, return the error response
			if (!response.ok) {
				return data as UpdateUserResponse;
			}

			return data as UpdateUserResponse;
		} catch (error: any) {
			// Handle network errors or other unexpected errors
			const errorResponse: UpdateUserResponse = {
				success: false,
				message:
					error.message ||
					'Network error occurred',
				errors: ['Network error occurred'],
				timestamp: new Date().toISOString(),
			};
			return errorResponse;
		}
	}

	/**
	 * Get error message from response
	 * @param response - API response
	 * @returns Human-readable error message
	 */
	getErrorMessage(response: UpdateUserResponse): string {
		if (response.success) {
			return 'Update successful';
		}

		// Handle validation errors
		if (response.errors && response.errors.length > 0) {
			return response.errors.join(', ');
		}

		// Handle other error messages
		return response.message || 'An unexpected error occurred';
	}

	/**
	 * Validate user data before sending to API
	 * @param userData - User data to validate
	 * @returns Validation result
	 */
	validateUserData(userData: UpdateUserRequest): {
		isValid: boolean;
		errors: string[];
	} {
		const errors: string[] = [];

		// Validate email
		if (userData.email && !this.isValidEmail(userData.email)) {
			errors.push('Invalid email format');
		}

		// Validate role
		if (
			userData.role &&
			!VALID_ROLES.includes(userData.role as ValidRole)
		) {
			errors.push('Invalid role');
		}

		// Validate password if provided
		if (
			userData.password &&
			!this.isValidPassword(userData.password)
		) {
			errors.push(
				'Password must be at least 8 characters long'
			);
		}

		// Validate names
		if (
			userData.firstName &&
			userData.firstName.trim().length < 2
		) {
			errors.push(
				'First name must be at least 2 characters long'
			);
		}

		if (userData.lastName && userData.lastName.trim().length < 2) {
			errors.push(
				'Last name must be at least 2 characters long'
			);
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}

	/**
	 * Validate email format
	 * @param email - Email to validate
	 * @returns True if valid email
	 */
	private isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	/**
	 * Validate password strength
	 * @param password - Password to validate
	 * @returns True if valid password
	 */
	private isValidPassword(password: string): boolean {
		return password.length >= 8;
	}

	/**
	 * Validate update permissions
	 * @param userRole - Current user's role
	 * @param userData - User data being updated
	 * @returns Permission validation result
	 */
	validateUpdatePermission(
		userRole: string,
		userData: UpdateUserRequest
	): { canUpdate: boolean; errorMessage?: string } {
		// SuperAdmin can update anyone
		if (userRole === 'SuperAdmin') {
			return { canUpdate: true };
		}

		// Admin can update most users but not SuperAdmin
		if (userRole === 'Admin') {
			// Check if trying to update SuperAdmin
			if (userData.role === 'SuperAdmin') {
				return {
					canUpdate: false,
					errorMessage:
						'Cannot update SuperAdmin role',
				};
			}
			return { canUpdate: true };
		}

		// Other roles have limited update permissions
		return {
			canUpdate: false,
			errorMessage:
				'Insufficient permissions to update users',
		};
	}

	/**
	 * Get available roles for selection
	 * @returns Array of role options
	 */
	getAvailableRoles(): Array<{ value: string; label: string }> {
		return VALID_ROLES.map((role) => ({
			value: role,
			label: role.charAt(0).toUpperCase() + role.slice(1),
		}));
	}
}

export const userUpdateApi = new UserUpdateApiService();
export default userUpdateApi;
