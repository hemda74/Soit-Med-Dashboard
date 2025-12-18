import { getApiBaseUrl } from '@/utils/apiConfig';
import type {
	DeleteUserResponse,
	DeleteUserParams,
} from '@/types/userDelete.types';

/**
 * User Delete API Service
 * Handles user deletion with proper error handling and type safety
 */
class UserDeleteApiService {
	private get baseUrl() {
		return getApiBaseUrl();
	}

	/**
	 * Delete a user by their ID
	 * @param params - Delete user parameters
	 * @returns Promise with delete response
	 */
	async deleteUser({
		userId,
		token,
	}: DeleteUserParams): Promise<DeleteUserResponse> {
		try {
			const response = await fetch(
				`${this.baseUrl}/api/User/${userId}`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type':
							'application/json',
					},
				}
			);

			const data = await response.json();

			// If the response is not ok, return the error response
			if (!response.ok) {
				return data as DeleteUserResponse;
			}

			return data as DeleteUserResponse;
		} catch (error: any) {
			// Handle network errors or other unexpected errors
			const errorResponse: DeleteUserResponse = {
				success: false,
				message:
					error.message ||
					'Network error occurred',
				timestamp: new Date().toISOString(),
			};
			return errorResponse;
		}
	}

	/**
	 * Get user-friendly error message from API error response
	 * @param error - Error response from API
	 * @returns User-friendly error message
	 */
	getErrorMessage(error: DeleteUserResponse): string {
		if (error.success) return '';

		const errorMessages: Record<string, string> = {
			"User with ID 'user-id-here' not found":
				'This user no longer exists.',
			'Cannot delete SuperAdmin user':
				'SuperAdmin accounts are protected and cannot be deleted.',
			'Cannot delete your own account':
				'You cannot delete your own account for security reasons.',
			'User ID is required': 'Invalid user selection.',
			'Failed to delete user':
				'Unable to delete user. Please try again later.',
			'Unauthorized access':
				'You are not authorized to perform this action.',
			'Access denied. SuperAdmin or Admin role required':
				'You need Admin privileges to delete users.',
		};

		return (
			errorMessages[error.message] ||
			error.message ||
			'An unexpected error occurred.'
		);
	}

	/**
	 * Validate if user can be deleted based on business rules
	 * @param userId - User ID to validate
	 * @param currentUserId - Current authenticated user ID
	 * @param userRole - Current user's role
	 * @returns Validation result with error message if invalid
	 */
	validateDeletePermission(
		userId: string,
		currentUserId: string,
		userRole: string
	): { canDelete: boolean; errorMessage?: string } {
		// Check if user has Admin privileges
		if (!['SuperAdmin', 'Admin'].includes(userRole)) {
			return {
				canDelete: false,
				errorMessage:
					'You need Admin privileges to delete users.',
			};
		}

		// Check if trying to delete own account
		if (userId === currentUserId) {
			return {
				canDelete: false,
				errorMessage:
					'You cannot delete your own account for security reasons.',
			};
		}

		// Check if user ID is provided
		if (!userId || userId.trim() === '') {
			return {
				canDelete: false,
				errorMessage: 'Invalid user selection.',
			};
		}

		return { canDelete: true };
	}
}

// Export singleton instance
export const userDeleteApi = new UserDeleteApiService();
export default userDeleteApi;
